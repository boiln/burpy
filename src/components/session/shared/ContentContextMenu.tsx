"use client";

import { useState, useEffect } from "react";

import { Copy, FileCode, FileJson, FileText, Link, FileInput, Cookie, Code } from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useToast } from "~/hooks/use-toast";
import { decodeBase64, urlDecode, htmlDecode, jsonFormat, jsonMinify } from "~/lib/burpParser";

interface ContentContextMenuProps {
    children: React.ReactNode;
    onCopy: {
        raw: () => void;
        headers: () => void;
        cookies: () => void;
        payload: () => void;
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

    const showToast = (title: string, success: boolean = true) => {
        toast({
            title,
            duration: 2000,
            className: success
                ? "w-[380px] fixed top-4 right-4 bg-background border-border"
                : "w-[380px] fixed top-4 right-4 bg-destructive/10 dark:bg-destructive/20 border-destructive/50",
        });
    };

    const handleCopySelection = async () => {
        try {
            const selectedText = getSelectedText();
            await navigator.clipboard.writeText(selectedText);
            showToast("Copied to clipboard");
        } catch (err) {
            console.error("Failed to copy selection:", err);
            showToast("Failed to copy", false);
        }
    };

    const handleDecode = {
        url: async () => {
            try {
                const decoded = urlDecode(getSelectedText());
                await navigator.clipboard.writeText(decoded);
                showToast("URL decoded and copied");
            } catch (err) {
                showToast("Failed to decode URL", false);
            }
        },
        base64: async () => {
            try {
                const decoded = decodeBase64(getSelectedText());
                await navigator.clipboard.writeText(decoded);
                showToast("Base64 decoded and copied");
            } catch (err) {
                showToast("Failed to decode Base64", false);
            }
        },
        html: async () => {
            try {
                const decoded = htmlDecode(getSelectedText());
                await navigator.clipboard.writeText(decoded);
                showToast("HTML decoded and copied");
            } catch (err) {
                showToast("Failed to decode HTML", false);
            }
        },
        jsonFormat: async () => {
            try {
                const formatted = jsonFormat(getSelectedText());
                await navigator.clipboard.writeText(formatted);
                showToast("JSON formatted and copied");
            } catch (err) {
                showToast("Failed to format JSON", false);
            }
        },
        jsonMinify: async () => {
            try {
                const minified = jsonMinify(getSelectedText());
                await navigator.clipboard.writeText(minified);
                showToast("JSON minified and copied");
            } catch (err) {
                showToast("Failed to minify JSON", false);
            }
        },
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-56">
                {hasSelection && (
                    <>
                        <ContextMenuItem onClick={handleCopySelection}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Selection</span>
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuSub>
                            <ContextMenuSubTrigger className="flex items-center">
                                <FileCode className="mr-2 h-4 w-4" />
                                <span>Decode Selection</span>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                <ContextMenuItem onClick={handleDecode.url}>
                                    <Link className="mr-2 h-4 w-4" />
                                    URL Decode
                                </ContextMenuItem>
                                <ContextMenuItem onClick={handleDecode.base64}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Base64 Decode
                                </ContextMenuItem>
                                <ContextMenuItem onClick={handleDecode.html}>
                                    <FileCode className="mr-2 h-4 w-4" />
                                    HTML Decode
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={handleDecode.jsonFormat}>
                                    <FileJson className="mr-2 h-4 w-4" />
                                    JSON Format
                                </ContextMenuItem>
                                <ContextMenuItem onClick={handleDecode.jsonMinify}>
                                    <FileJson className="mr-2 h-4 w-4" />
                                    JSON Minify
                                </ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                    </>
                )}
                <ContextMenuSub>
                    <ContextMenuSubTrigger className="flex items-center">
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy</span>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem onClick={onCopy.raw}>
                            <Code className="mr-2 h-4 w-4" />
                            Raw Content
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onCopy.headers}>
                            <FileInput className="mr-2 h-4 w-4" />
                            Headers
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onCopy.cookies}>
                            <Cookie className="mr-2 h-4 w-4" />
                            Cookies
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={onCopy.payload}>
                            <FileText className="mr-2 h-4 w-4" />
                            Payload
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
