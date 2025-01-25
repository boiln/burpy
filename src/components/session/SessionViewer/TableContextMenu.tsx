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
import { useToast } from "@/hooks/use-toast";
import type { BurpItem, HighlightColor } from "@/types/burp";
import { toCurl } from "@/lib/toCurl";

interface TableContextMenuProps {
    children: React.ReactNode;
    item: BurpItem;
    items?: BurpItem[]; // Optional array of items for bulk operations
    onHighlight: (color: HighlightColor) => void;
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
    const { toast } = useToast();

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

    const copyToClipboard = (text: string, description: string) => {
        navigator.clipboard.writeText(text);
        toast({
            description: `Copied ${description} to clipboard`,
            duration: 2000,
        });
    };

    const handleCopyUrl = () => {
        const fullUrl = `${item.host.value}${item.url}`;
        navigator.clipboard.writeText(fullUrl);
    };

    const handleCopyCurl = () => {
        const curl = toCurl(item);
        copyToClipboard(curl, "curl command");
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent className="min-w-[180px] p-1">
                    {/* Copy Options - Only show in single item mode */}
                    {!isBulkOperation && (
                        <>
                            <ContextMenuSub>
                                <ContextMenuSubTrigger className="h-7 px-2">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="min-w-[160px] p-1">
                                    <ContextMenuItem className="h-7 px-2" onClick={handleCopyUrl}>
                                        <Link className="mr-2 h-4 w-4" />
                                        URL
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                        className="h-7 px-2"
                                        onClick={() => copyToClipboard(item.host.ip, "IP")}
                                    >
                                        <Globe className="mr-2 h-4 w-4" />
                                        IP
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                        className="h-7 px-2"
                                        onClick={() => copyToClipboard(item.time, "Time")}
                                    >
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
                        </>
                    )}

                    {/* Highlight Options */}
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className="h-7 px-2">
                            <Paintbrush2 className="mr-2 h-4 w-4" />
                            {isBulkOperation ? "Highlight" : "Highlight"}
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
                        {isBulkOperation
                            ? "Add Comment"
                            : item.comment
                              ? "Edit Comment"
                              : "Add Comment"}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isBulkOperation ? "Add Comment" : "Add Comment"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder={
                                isBulkOperation ? "Enter bulk comment..." : "Enter comment..."
                            }
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
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
