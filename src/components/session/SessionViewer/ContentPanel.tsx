"use client";

import { useEffect, useRef } from "react";
import { WrapText, Code2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { useMessageFormatter } from "@/hooks/session/useMessageFormatter";
import { useClipboard } from "@/hooks/useClipboard";
import { decodeBase64 } from "@/lib/burpParser";
import { toCurl } from "@/lib/toCurl";
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
    const { copyToClipboard, isMounted } = useClipboard();
    const content = item?.[type] || { value: "", base64: false };
    const { formatMessage } = useMessageFormatter();
    const decodedContent = content.base64 ? decodeBase64(content.value) : content.value;
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [item]);

    const handleCopy = {
        raw: async () => {
            await copyToClipboard(decodedContent, "raw content");
        },
        headers: async () => {
            const { headers } = formatMessage(decodedContent, {
                wrap: false,
                prettify: false,
            });
            const headerLines = headers.split("\n");
            const justHeaders = headerLines.slice(1).join("\n").trim();
            await copyToClipboard(justHeaders, "headers");
        },
        body: async () => {
            const { body } = formatMessage(decodedContent, {
                wrap: false,
                prettify: false,
            });
            await copyToClipboard(body, "body");
        },
        curl:
            type === "request" && item
                ? async () => {
                      const curl = toCurl(item);
                      await copyToClipboard(curl, "curl command");
                  }
                : undefined,
    };

    // Don't attempt to render until mounted
    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex h-full flex-col">
            <div className="shrink-0 border-b p-2">
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
                                    className="h-6 w-6 p-0"
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
                                    className="h-6 w-6 p-0"
                                    aria-label="Toggle code formatting"
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
