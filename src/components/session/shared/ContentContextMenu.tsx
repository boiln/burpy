"use client";

import { useState, useEffect } from "react";

import { Copy, FileCode, FileText, Link, FileInput, Cookie, Code, Terminal } from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { decodeBase64, urlDecode } from "@/lib/burpParser";

interface ContentContextMenuProps {
    children: React.ReactNode;
    onCopy: {
        raw: () => void;
        headers: () => void;
        cookies: () => void;
        payload: () => void;
        curl?: () => void;
    };
}

export function ContentContextMenu({ children, onCopy }: ContentContextMenuProps) {
    const [hasSelection, setHasSelection] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const checkSelection = () => {
            const selection = window.getSelection();
            const selectedText = selection?.toString() || "";
            setHasSelection(selectedText.length > 0);
        };

        document.addEventListener("selectionchange", checkSelection);
        return () => document.removeEventListener("selectionchange", checkSelection);
    }, []);

    const getSelectedText = () => {
        const selection = window.getSelection();
        return selection?.toString() || "";
    };

    const handleCopySelection = async () => {
        try {
            const selectedText = getSelectedText();
            await navigator.clipboard.writeText(selectedText);
            toast({
                description: "Copied to clipboard",
            });
        } catch (err) {
            console.error("Failed to copy selection:", err);
            toast({
                description: "Failed to copy",
            });
        }
    };

    const handleDecode = {
        url: async () => {
            try {
                const decoded = urlDecode(getSelectedText());
                await navigator.clipboard.writeText(decoded);
                toast({
                    description: "URL decoded and copied",
                });
            } catch (err) {
                toast({
                    description: "Failed to decode URL",
                });
            }
        },
        base64: async () => {
            try {
                const decoded = decodeBase64(getSelectedText());
                await navigator.clipboard.writeText(decoded);
                toast({
                    description: "Base64 decoded and copied",
                });
            } catch (err) {
                toast({
                    description: "Failed to decode Base64",
                });
            }
        },
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="min-w-[180px] p-1">
                {hasSelection && (
                    <>
                        <ContextMenuItem className="h-7 px-2" onClick={handleCopySelection}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Selection</span>
                        </ContextMenuItem>
                        <ContextMenuSeparator className="my-0.5" />
                        <ContextMenuSub>
                            <ContextMenuSubTrigger className="h-7 px-2">
                                <FileCode className="mr-2 h-4 w-4" />
                                <span>Decode Selection</span>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="min-w-[160px] p-1">
                                <ContextMenuItem className="h-7 px-2" onClick={handleDecode.url}>
                                    <Link className="mr-2 h-4 w-4" />
                                    URL Decode
                                </ContextMenuItem>
                                <ContextMenuItem className="h-7 px-2" onClick={handleDecode.base64}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Base64 Decode
                                </ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator className="my-0.5" />
                    </>
                )}
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="h-7 px-2">
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy</span>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="min-w-[160px] p-1">
                        <ContextMenuItem className="h-7 px-2" onClick={onCopy.raw}>
                            <Code className="mr-2 h-4 w-4" />
                            Raw
                        </ContextMenuItem>
                        <ContextMenuItem className="h-7 px-2" onClick={onCopy.headers}>
                            <FileInput className="mr-2 h-4 w-4" />
                            Headers
                        </ContextMenuItem>
                        <ContextMenuItem className="h-7 px-2" onClick={onCopy.cookies}>
                            <Cookie className="mr-2 h-4 w-4" />
                            Cookies
                        </ContextMenuItem>
                        <ContextMenuSeparator className="my-0.5" />
                        <ContextMenuItem className="h-7 px-2" onClick={onCopy.payload}>
                            <FileText className="mr-2 h-4 w-4" />
                            Payload
                        </ContextMenuItem>
                        {onCopy.curl && (
                            <>
                                <ContextMenuSeparator className="my-0.5" />
                                <ContextMenuItem className="h-7 px-2" onClick={onCopy.curl}>
                                    <Terminal className="mr-2 h-4 w-4" />
                                    cURL (bash)
                                </ContextMenuItem>
                            </>
                        )}
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
