"use client";

import { useState } from "react";

import { Upload } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { parseBurpXml } from "@/lib/burpParser";
import { BurpSession } from "@/types/burp";

interface FileUploadProps {
    onSessionLoaded: (session: BurpSession) => void;
}

export function FileUpload({ onSessionLoaded }: FileUploadProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const text = await file.text();
            const session = await parseBurpXml(text);
            onSessionLoaded(session);
            toast({
                description: `Loaded ${session.items.length} items from Burp session`,
                duration: 3500,
                className:
                    "w-[380px] fixed top-4 right-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
            });
        } catch (error) {
            console.error("Error parsing Burp session:", error);
            toast({
                description: "Failed to parse Burp session file",
                variant: "destructive",
                duration: 3500,
                className: "w-[380px] fixed top-4 right-4",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full max-w-2xl items-center justify-center">
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
                            "Click to upload Burp session file"
                        )}
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".xml"
                    onChange={handleFileUpload}
                    disabled={loading}
                />
            </label>
        </div>
    );
}
