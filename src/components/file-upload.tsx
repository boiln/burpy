"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";

import { Upload } from "lucide-react";

import { BurpParser, createDefaultParser } from "@/lib/http-parser";
import { cn } from "@/lib/utils";
import type { BurpSession } from "@/types/burp";
import type { HarEntry, HarSession } from "@/types/har";

interface FileUploadProps {
    onSessionLoaded: (session: BurpSession | HarSession) => void;
}

export interface FileUploadRef {
    loadDemoFile: () => Promise<void>;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>((props, ref) => {
    const { onSessionLoaded } = props;

    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateHarData = (data: any): data is { log: { entries: HarEntry[] } } => {
        try {
            if (!data || typeof data !== "object") {
                console.error("Invalid HAR data: not an object", data);
                return false;
            }

            if (!data.log) {
                console.error("Invalid HAR data: missing log property", data);
                return false;
            }

            if (!Array.isArray(data.log.entries)) {
                console.error("Invalid HAR data: entries is not an array", data.log);
                return false;
            }

            if (data.log.entries.length === 0) {
                console.error("Invalid HAR data: entries array is empty");
                return false;
            }

            const firstEntry = data.log.entries[0];
            if (!firstEntry.request?.method || !firstEntry.request?.url) {
                console.error("Invalid HAR data: invalid request structure", firstEntry);
                return false;
            }

            if (typeof firstEntry.response?.status !== "number") {
                console.error("Invalid HAR data: invalid response structure", firstEntry);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error validating HAR data:", error);
            return false;
        }
    };

    const processFile = async (file: File) => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            console.log(`Reading ${file.name}...`);

            if (file.size > 250 * 1024 * 1024) {
                throw new Error("File size exceeds 250MB limit");
            }

            const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
            if (!["har", "xml"].includes(fileExtension)) {
                throw new Error("Unsupported file format. Please upload a .har or .xml file");
            }

            const text = await file.text();
            const parser = createDefaultParser();

            if (fileExtension === "har") {
                const harData = JSON.parse(text);

                if (!validateHarData(harData)) {
                    throw new Error("Invalid HAR file format");
                }

                const entries = harData.log.entries.map((entry) => {
                    try {
                        const { request, response } = parser.parse(entry, "application/har+json");
                        return {
                            ...entry,
                            parsedRequest: request,
                            parsedResponse: response,
                        };
                    } catch (parseError) {
                        console.error("Failed to parse HAR entry:", parseError);
                        throw parseError;
                    }
                });

                const session: HarSession = { entries };
                onSessionLoaded(session);
                return;
            }

            const xmlParser = new DOMParser();
            const doc = xmlParser.parseFromString(text, "text/xml");
            const items = doc.querySelectorAll("item");

            if (!items || items.length === 0) {
                throw new Error("No items found in Burp XML file");
            }

            const entries = Array.from(items).map((item, index) => {
                try {
                    const burpEntry = BurpParser.parseXmlItem(item.outerHTML);
                    const { request, response } = parser.parse(
                        burpEntry,
                        "application/vnd.burp.suite.item"
                    );

                    return {
                        ...burpEntry,
                        parsedRequest: request,
                        parsedResponse: response,
                    };
                } catch (parseError) {
                    console.error(`Failed to parse Burp item ${index + 1}:`, parseError);
                    throw parseError;
                }
            });

            if (!entries || entries.length === 0) {
                throw new Error("No valid entries found in the file");
            }

            const session: BurpSession = { entries };
            onSessionLoaded(session);
        } catch (error) {
            console.error("Error processing file:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to process file. Check console for details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        processFile(file);
        event.target.value = "";
    };

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);

            const file = event.dataTransfer.files?.[0];
            if (!file) return;

            processFile(file);
        },
        [processFile]
    );

    const loadDemoFile = async () => {
        setLoading(true);
        setError(null);

        try {
            let response = await fetch("/demo.har");

            if (!response.ok) {
                const repoPath = window.location.pathname.split("/")[1];
                response = await fetch(`/${repoPath}/demo.har`);

                if (!response.ok) {
                    throw new Error(
                        `Failed to load demo file (HTTP ${response.status}): ${response.statusText}`
                    );
                }
            }

            const text = await response.text();
            const parser = createDefaultParser();

            let harData;
            try {
                harData = JSON.parse(text);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Failed to parse demo file: Invalid JSON");
            }

            if (!validateHarData(harData)) {
                throw new Error("Invalid HAR file format in demo file");
            }

            const entries = harData.log.entries.map((entry) => {
                const { request, response } = parser.parse(entry, "application/har+json");
                return {
                    ...entry,
                    parsedRequest: request,
                    parsedResponse: response,
                };
            });

            const session: HarSession = { entries };
            onSessionLoaded(session);
        } catch (error) {
            console.error("Error loading demo file:", error);
            setError(
                error instanceof Error
                    ? `Failed to load demo file: ${error.message}`
                    : "An unexpected error occurred while loading the demo file"
            );
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        loadDemoFile,
    }));

    return (
        <div className="flex flex-col gap-2">
            <div
                className={cn(
                    "flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                    isDragging ? "border-primary bg-primary/10" : "border-dashed hover:bg-accent"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload file"
            >
                <Upload className="h-4 w-4" />
                <span className="text-sm">{loading ? "Processing..." : "Upload HAR/XML"}</span>
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xml,.har"
                    onChange={handleFileUpload}
                    disabled={loading}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
});

FileUpload.displayName = "FileUpload";

export default FileUpload;
