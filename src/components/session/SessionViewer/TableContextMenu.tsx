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
import { BurpItem, HighlightColor } from "@/types/burp";

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

    const handleCommentSubmit = () => {
        onUpdateComment(comment);
        setShowCommentDialog(false);
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>Highlight</ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            {HIGHLIGHT_COLORS.map((color) => (
                                <ContextMenuItem
                                    key={color.value}
                                    className={color.class}
                                    onClick={() => onHighlight(color.value)}
                                >
                                    {color.label}
                                </ContextMenuItem>
                            ))}
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => onHighlight(null)}>
                                Remove Highlight
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem onClick={() => setShowCommentDialog(true)}>
                        Add/Edit Comment
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
