"use client";

import { useEffect, useState, useRef } from "react";

import { Indent, WrapText, Code2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { useMessageFormatter } from "@/hooks/session/useMessageFormatter";
import { useToast } from "@/hooks/use-toast";
import { decodeBase64 } from "@/lib/burpParser";
import type { ContentPanelProps } from "@/types/session";

import { ContentContextMenu } from "../shared/ContentContextMenu";
import { HttpMessageRenderer } from "../shared/HttpMessageRenderer";

export function ContentPanel({
    item,
    type,
    wrap,
    setWrap,
    prettify,
    setPrettify,
}: ContentPanelProps) {
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const content = item?.[type] || { value: "", base64: false };
    const { formatMessage } = useMessageFormatter();
    const decodedContent = content.base64 ? decodeBase64(content.value) : content.value;
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [item]);

    const copyTextToClipboard = async (text: string): Promise<void> => {
        if (!isMounted) return;

        try {
            // First try the modern clipboard API
            if (window?.navigator?.clipboard) {
                await window.navigator.clipboard.writeText(text);
                return;
            }

            // Fallback to execCommand
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.select();

            const successful = document.execCommand("copy");
            document.body.removeChild(textArea);

            if (!successful) {
                throw new Error("Failed to copy text");
            }
        } catch (err) {
            console.error("Copy failed:", err);
            throw err;
        }
    };

    const handleCopy = {
        raw: async () => {
            try {
                await copyTextToClipboard(decodedContent);
                toast({
                    description: "Copied raw content to clipboard",
                    duration: 2000,
                });
            } catch (err) {
                console.error("Failed to copy raw content:", err);
                toast({
                    description: "Failed to copy to clipboard",
                    variant: "destructive",
                    duration: 2000,
                });
            }
        },
        headers: async () => {
            try {
                const { headers } = formatMessage(decodedContent, {
                    wrap: false,
                    prettify: false,
                });
                const headerLines = headers.split("\n");
                const justHeaders = headerLines.slice(1).join("\n").trim();
                await copyTextToClipboard(justHeaders);
                toast({
                    description: "Copied headers to clipboard",
                    duration: 2000,
                });
            } catch (err) {
                console.error("Failed to copy headers:", err);
                toast({
                    description: "Failed to copy to clipboard",
                    variant: "destructive",
                    duration: 2000,
                });
            }
        },
        cookies: async () => {
            try {
                const { headers } = formatMessage(decodedContent, {
                    wrap: false,
                    prettify: false,
                });
                const cookieLines = headers
                    .split("\n")
                    .filter((line) => line.toLowerCase().startsWith("cookie:"))
                    .join("\n");
                await copyTextToClipboard(cookieLines);
                toast({
                    description: "Copied cookies to clipboard",
                    duration: 2000,
                });
            } catch (err) {
                console.error("Failed to copy cookies:", err);
                toast({
                    description: "Failed to copy to clipboard",
                    variant: "destructive",
                    duration: 2000,
                });
            }
        },
        payload: async () => {
            try {
                const { body } = formatMessage(decodedContent, {
                    wrap: false,
                    prettify,
                });
                await copyTextToClipboard(body);
                toast({
                    description: "Copied payload to clipboard",
                    duration: 2000,
                });
            } catch (err) {
                console.error("Failed to copy payload:", err);
                toast({
                    description: "Failed to copy to clipboard",
                    variant: "destructive",
                    duration: 2000,
                });
            }
        },
    };

    // Don't attempt to render until mounted
    if (!isMounted) {
        return null; // or a loading state
    }

    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 border-b p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h3>
                    <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle
                                    pressed={wrap}
                                    onPressedChange={setWrap}
                                    size="sm"
                                    aria-label="Toggle word wrap"
                                >
                                    <WrapText className="h-4 w-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>Wrap</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle
                                    pressed={prettify}
                                    onPressedChange={setPrettify}
                                    size="sm"
                                    aria-label="Toggle code formatting"
                                    className="font-mono"
                                >
                                    <Code2 className="h-4 w-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>Beautify</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className="min-h-0 flex-1">
                <ContentContextMenu onCopy={handleCopy}>
                    <ScrollArea className="h-full">
                        <div ref={contentRef} className="p-4">
                            <HttpMessageRenderer
                                content={decodedContent}
                                wrap={wrap}
                                prettify={prettify}
                                type={type}
                            />
                        </div>
                    </ScrollArea>
                </ContentContextMenu>
            </div>
        </div>
    );
}
