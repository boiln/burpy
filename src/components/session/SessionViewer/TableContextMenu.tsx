"use client";

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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, MessageCircle, Paintbrush2, Link, Globe, Clock, Terminal } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import type { BurpItem, HighlightColor } from "@/types/burp";
import { toCurl } from "@/lib/toCurl";

interface TableContextMenuProps {
    children: React.ReactNode;
    item: BurpItem;
    items?: BurpItem[]; // Optional array of items for bulk operations
    onHighlight: (color: HighlightColor | null) => void;
    onUpdateComment: (comment: string) => void;
}

const HIGHLIGHT_COLORS: { label: string; value: HighlightColor; class: string }[] = [
    { label: "Red", value: "red", class: "bg-red-500/20" },
    { label: "Orange", value: "orange", class: "bg-orange-500/20" },
    { label: "Yellow", value: "yellow", class: "bg-yellow-500/20" },
    { label: "Green", value: "green", class: "bg-green-500/20" },
    { label: "Cyan", value: "cyan", class: "bg-cyan-500/20" },
    { label: "Blue", value: "blue", class: "bg-blue-500/20" },
    { label: "Purple", value: "purple", class: "bg-purple-500/20" },
    { label: "Pink", value: "pink", class: "bg-pink-500/20" },
];

export function TableContextMenu({
    children,
    item,
    items,
    onHighlight,
    onUpdateComment,
}: TableContextMenuProps) {
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [comment, setComment] = useState(item.comment);
    const { copyToClipboard, isMounted } = useClipboard();

    const isBulkOperation = items && items.length > 1;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCommentSubmit();
        }
    };

    const handleCommentSubmit = () => {
        onUpdateComment(comment);
        setShowCommentDialog(false);
    };

    const handleCopyUrl = async () => {
        const fullUrl = `${item.host.value}${item.url}`;
        await copyToClipboard(fullUrl, "URL");
    };

    const handleCopyCurl = async () => {
        const curl = toCurl(item);
        await copyToClipboard(curl, "curl command");
    };

    const handleCopyHost = async () => {
        await copyToClipboard(item.host.value, "host");
    };

    const handleCopyTime = async () => {
        await copyToClipboard(item.time, "timestamp");
    };

    if (!isMounted) return null;

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent className="min-w-[180px] p-1">
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className="h-7 px-2">
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="min-w-[160px] p-1">
                            <ContextMenuItem className="h-7 px-2" onClick={handleCopyUrl}>
                                <Link className="mr-2 h-4 w-4" />
                                URL
                            </ContextMenuItem>
                            <ContextMenuItem className="h-7 px-2" onClick={handleCopyHost}>
                                <Globe className="mr-2 h-4 w-4" />
                                Host
                            </ContextMenuItem>
                            <ContextMenuItem className="h-7 px-2" onClick={handleCopyTime}>
                                <Clock className="mr-2 h-4 w-4" />
                                Time
                            </ContextMenuItem>
                            <ContextMenuSeparator className="my-0.5" />
                            <ContextMenuItem className="h-7 px-2" onClick={handleCopyCurl}>
                                <Terminal className="mr-2 h-4 w-4" />
                                cURL (bash)
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator className="my-0.5" />
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className="h-7 px-2">
                            <Paintbrush2 className="mr-2 h-4 w-4" />
                            <span>Highlight {isBulkOperation ? "All" : ""}</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="min-w-[160px] p-1">
                            <ContextMenuItem className="h-7 px-2" onClick={() => onHighlight(null)}>
                                <div className="mr-2 h-4 w-4 rounded-full border border-border" />
                                None
                            </ContextMenuItem>
                            <ContextMenuSeparator className="my-0.5" />
                            {HIGHLIGHT_COLORS.map((color) => (
                                <ContextMenuItem
                                    key={color.value}
                                    className="h-7 px-2"
                                    onClick={() => onHighlight(color.value)}
                                >
                                    <div className={`mr-2 h-4 w-4 rounded-full ${color.class}`} />
                                    {color.label}
                                </ContextMenuItem>
                            ))}
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    {/* Comment Option */}
                    <ContextMenuItem
                        className="h-7 px-2"
                        onClick={() => setShowCommentDialog(true)}
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {isBulkOperation ? "Comment All" : "Comment"}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isBulkOperation ? "Add Comment to All" : "Add Comment"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter comment..."
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="secondary" onClick={handleCommentSubmit}>
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
