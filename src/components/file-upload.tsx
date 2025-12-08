"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";

import { Upload } from "lucide-react";

import { processFile, fetchDemoFile } from "@/lib/file-processing";
import { cn } from "@/lib/utils";
import type { BurpSession } from "@/types/burp";
import type { HarSession } from "@/types/har";

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

    const handleProcessFile = async (file: File) => {
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const session = await processFile(file);
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

        handleProcessFile(file);
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

            handleProcessFile(file);
        },
        [handleProcessFile]
    );

    const loadDemoFile = async () => {
        setLoading(true);
        setError(null);

        try {
            const session = await fetchDemoFile();
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
