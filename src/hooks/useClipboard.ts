import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseClipboardReturn {
    copyToClipboard: (text: string, description?: string) => Promise<void>;
    isMounted: boolean;
}

export function useClipboard(): UseClipboardReturn {
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const copyToClipboard = async (text: string, description = "content"): Promise<void> => {
        if (!isMounted) return;

        try {
            // First try the modern clipboard API
            if (window?.navigator?.clipboard) {
                await window.navigator.clipboard.writeText(text);
            } else {
                // Fallback to execCommand
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
                document.body.appendChild(textArea);
                textArea.select();
                const successful = document.execCommand("copy");
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error("Failed to copy text");
                }
            }

            toast({
                description: `Copied ${description} to clipboard`,
                duration: 2000,
            });
        } catch (err) {
            console.error("Copy failed:", err);
            toast({
                description: "Failed to copy to clipboard",
                variant: "destructive",
                duration: 2000,
            });
        }
    };

    return {
        copyToClipboard,
        isMounted,
    };
}
