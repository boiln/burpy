"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Upload } from "lucide-react";
import { BurpSession, BurpEntry } from "@/types/burp";
import { HarEntry, HarHeader } from "@/types/har";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createDefaultParser, BurpParser } from "@/lib/http-parser";

interface FileUploadProps {
    onSessionLoaded: (session: BurpSession) => void;
}

export interface FileUploadRef {
    loadDemoFile: () => Promise<void>;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({ onSessionLoaded }, ref) => {
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

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

            // Validate first entry to check structure
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
        try {
            console.log(`Reading ${file.name}...`);

            // Validate file size
            if (file.size > 50 * 1024 * 1024) {
                throw new Error("File size exceeds 50MB limit");
            }

            // Validate file extension
            const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
            if (!["har", "xml"].includes(fileExtension)) {
                throw new Error("Unsupported file format. Please upload a .har or .xml file");
            }

            const text = await file.text();
            let entries: BurpEntry[] = [];

            if (fileExtension === "har") {
                console.log("Parsing HAR file...");
                const harData = JSON.parse(text);

                if (!validateHarData(harData)) {
                    throw new Error("Invalid HAR file format");
                }

                entries = harData.log.entries.map((entry: HarEntry) => ({
                    startTime: entry.startedDateTime || new Date().toISOString(),
                    duration: entry.time || 0,
                    request: {
                        method: entry.request.method,
                        url: entry.request.url,
                        protocol: entry.request.httpVersion || "HTTP/1.1",
                        headers:
                            entry.request.headers?.map((h: HarHeader) => `${h.name}: ${h.value}`) ||
                            [],
                        body: entry.request.postData?.text || "",
                    },
                    response: {
                        status: entry.response.status,
                        statusText: entry.response.statusText || "",
                        headers:
                            entry.response.headers?.map(
                                (h: HarHeader) => `${h.name}: ${h.value}`
                            ) || [],
                        body: entry.response.content?.text || "",
                        mimeType: entry.response.content?.mimeType || "text/plain",
                        contentLength: entry.response.content?.text?.length || 0,
                    },
                }));
            } else {
                console.log("Parsing Burp XML file...");
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/xml");
                const items = doc.querySelectorAll("item");
                entries = Array.from(items).map((item) => BurpParser.parseXmlItem(item.outerHTML));
            }

            if (!entries || entries.length === 0) {
                throw new Error("No valid entries found in the file");
            }

            const session: BurpSession = { entries };
            console.log("Session loaded:", entries.length, "items");
            onSessionLoaded(session);
            console.log(
                `Loaded ${entries.length} items from ${fileExtension.toUpperCase()} session`
            );
        } catch (error: unknown) {
            console.error("Error parsing session file:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to parse session file";
            console.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
            event.target.value = "";
        }
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

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    }, []);

    const loadDemoFile = async () => {
        setLoading(true);
        try {
            console.log("Fetching demo file...");
            const response = await fetch("/demo.har");
            if (!response.ok) {
                throw new Error(`Failed to load demo file: ${response.statusText}`);
            }

            const text = await response.text();
            console.log("Parsing demo file...");
            let harData;

            try {
                harData = JSON.parse(text);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Failed to parse demo file: Invalid JSON");
            }

            console.log("Validating HAR data structure...");
            if (!validateHarData(harData)) {
                throw new Error("Invalid HAR file format in demo file");
            }

            console.log("Creating parser...");
            console.log("Processing entries...");
            const entries = harData.log.entries.map((entry: HarEntry) => {
                return {
                    startTime: entry.startedDateTime || new Date().toISOString(),
                    duration: entry.time || 0,
                    request: {
                        method: entry.request.method,
                        url: entry.request.url,
                        protocol: entry.request.httpVersion || "HTTP/1.1",
                        headers:
                            entry.request.headers?.map((h: HarHeader) => `${h.name}: ${h.value}`) ||
                            [],
                        body: entry.request.postData?.text || "",
                    },
                    response: {
                        status: entry.response.status,
                        statusText: entry.response.statusText || "",
                        headers:
                            entry.response.headers?.map(
                                (h: HarHeader) => `${h.name}: ${h.value}`
                            ) || [],
                        body: entry.response.content?.text || "",
                        mimeType: entry.response.content?.mimeType || "text/plain",
                        contentLength: entry.response.content?.text?.length || 0,
                    },
                };
            });

            if (!entries || entries.length === 0) {
                throw new Error("No valid entries found in the demo file");
            }

            const session: BurpSession = { entries };
            console.log(`Successfully loaded demo session with ${entries.length} items`);
            onSessionLoaded(session);
        } catch (error) {
            console.error("Error details:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred while loading the demo file";
            console.error("Demo file loading error:", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        loadDemoFile,
    }));

    return (
        <div className="flex items-center gap-2">
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
        </div>
    );
});

FileUpload.displayName = "FileUpload";

export default FileUpload;
