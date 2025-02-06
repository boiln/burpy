"use client";

import { useState } from "react";
import { Upload, PlayCircle } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { parseBurpXml } from "@/lib/burpParser";
import { parseHarToSession } from "@/lib/harParser";
import { BurpSession } from "@/types/burp";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
    onSessionLoaded: (session: BurpSession) => void;
}

export function FileUpload({ onSessionLoaded }: FileUploadProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadDemoFile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/demo.har`);
            if (!response.ok) {
                throw new Error("Failed to load demo file");
            }
            const text = await response.text();
            const session = parseHarToSession(text);

            if (!session.items || session.items.length === 0) {
                throw new Error("No valid entries found in the demo file");
            }

            console.log("Demo session loaded:", session.items.length, "items");
            onSessionLoaded(session);
            toast({
                description: `Loaded ${session.items.length} items from demo session`,
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to load demo file";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            console.log(`Reading ${file.name}...`);

            // Validate file size
            if (file.size > 900 * 1024 * 1024) {
                // 50MB limit
                throw new Error("File size exceeds 50MB limit");
            }

            // Validate file extension
            const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
            if (!["har", "xml"].includes(fileExtension)) {
                throw new Error("Unsupported file format. Please upload a .har or .xml file");
            }

            const text = await file.text();
            let session: BurpSession;

            if (fileExtension === "har") {
                console.log("Parsing HAR file...");
                session = parseHarToSession(text);
            } else {
                console.log("Parsing Burp XML file...");
                session = await parseBurpXml(text);
            }

            if (!session.items || session.items.length === 0) {
                throw new Error("No valid entries found in the file");
            }

            console.log("Session loaded:", session.items.length, "items");
            onSessionLoaded(session);
            toast({
                description: `Loaded ${session.items.length} items from ${fileExtension.toUpperCase()} session`,
            });
        } catch (error: unknown) {
            console.error("Error parsing session file:", error);

            // Provide specific error messages based on the error type
            const errorMessage =
                error instanceof Error ? error.message : "Failed to parse session file";

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setLoading(false);
            // Clear the file input
            event.target.value = "";
        }
    };

    return (
        <div className="flex w-full max-w-2xl flex-col items-center space-y-4">
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <Upload className="mb-2 h-8 w-8 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="mr-3 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            "Click to upload Burp (.xml) or HAR (.har) file"
                        )}
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".xml,.har"
                    onChange={handleFileUpload}
                    disabled={loading}
                />
            </label>

            <div className="flex w-full items-center justify-center space-x-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={loadDemoFile}
                disabled={loading}
            >
                <span>Try the demo</span>
            </Button>
        </div>
    );
}
