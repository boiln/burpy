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
import {
    Copy,
    MessageCircle,
    Paintbrush2,
    Link,
    Hash,
    FileCode,
    Globe,
    Clock,
    FileJson,
    FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BurpItem, HighlightColor } from "@/types/burp";

interface TableContextMenuProps {
    children: React.ReactNode;
    item: BurpItem;
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
    onHighlight,
    onUpdateComment,
}: TableContextMenuProps) {
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [comment, setComment] = useState(item.comment);
    const { toast } = useToast();

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

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    {/* Copy Options */}
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuItem onClick={() => copyToClipboard(item.method, "Method")}>
                                <FileCode className="mr-2 h-4 w-4" />
                                Copy Method
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => copyToClipboard(item.url, "URL")}>
                                <Link className="mr-2 h-4 w-4" />
                                Copy URL
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => copyToClipboard(item.status, "Status")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Copy Status
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => copyToClipboard(item.responselength, "Length")}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Copy Length
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => copyToClipboard(item.mimetype, "MIME Type")}
                            >
                                <FileJson className="mr-2 h-4 w-4" />
                                Copy MIME Type
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => copyToClipboard(item.host.ip, "IP")}>
                                <Globe className="mr-2 h-4 w-4" />
                                Copy IP
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => copyToClipboard(item.time, "Time")}>
                                <Clock className="mr-2 h-4 w-4" />
                                Copy Time
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    {/* Highlight Options */}
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Paintbrush2 className="mr-2 h-4 w-4" />
                            Highlight
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            {HIGHLIGHT_COLORS.map((color) => (
                                <ContextMenuItem
                                    key={color.value}
                                    onClick={() => onHighlight(color.value)}
                                >
                                    <div className={`mr-2 h-4 w-4 rounded-full ${color.class}`} />
                                    {color.label}
                                </ContextMenuItem>
                            ))}
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => onHighlight(null)}>
                                <div className="mr-2 h-4 w-4 rounded-full border border-border" />
                                None
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    {/* Comment Option */}
                    <ContextMenuItem onClick={() => setShowCommentDialog(true)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {item.comment ? "Edit Comment" : "Add Comment"}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Comment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Enter comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCommentSubmit}>Save</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
