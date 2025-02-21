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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { BurpEntry } from "@/types/burp";
import { HarEntry } from "@/types/har";
import { Palette, MessageSquareMore, Link2, Globe, Clock, Terminal } from "lucide-react";
import { useSession } from "@/lib/session-context";
import type { HighlightColor } from "@/types/burp";
import { toCurl } from "@/lib/to-curl";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RequestContextMenuProps {
    children: React.ReactNode;
    entry: BurpEntry | HarEntry;
}

function getFullUrl(entry: BurpEntry | HarEntry): string {
    return "httpVersion" in entry.request ? entry.request.url : entry.request.url;
}

function getHost(entry: BurpEntry | HarEntry): string {
    try {
        const url = new URL(getFullUrl(entry));
        return url.host;
    } catch {
        return "";
    }
}

function getTime(entry: BurpEntry | HarEntry): string {
    const timestamp = "startTime" in entry ? entry.startTime : entry.startedDateTime;
    return timestamp ? new Date(timestamp).toLocaleTimeString() : "-";
}

export function RequestContextMenu({ children, entry }: RequestContextMenuProps) {
    const { handleHighlightEntry, handleCommentEntry } = useSession();
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [comment, setComment] = useState(entry.comment || "");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when dialog opens
    useEffect(() => {
        if (showCommentDialog && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showCommentDialog]);

    const handleHighlight = (color: HighlightColor | null) => {
        handleHighlightEntry(entry, color);
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(getFullUrl(entry));
    };

    const handleCopyHost = () => {
        navigator.clipboard.writeText(getHost(entry));
    };

    const handleCopyTime = () => {
        navigator.clipboard.writeText(getTime(entry));
    };

    const handleCopyCurl = () => {
        navigator.clipboard.writeText(toCurl(entry));
    };

    const handleSaveComment = () => {
        handleCommentEntry(entry, comment);
        setShowCommentDialog(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveComment();
        } else if (e.key === "Escape") {
            setShowCommentDialog(false);
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <div className="flex items-center">
                                <Palette className="mr-2 h-4 w-4" />
                                <span className="flex-1">Highlight</span>
                            </div>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-32">
                            <ContextMenuItem onClick={() => handleHighlight(null)}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full border border-border/40" />
                                    <span className="ml-2">None</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => handleHighlight("red")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#f87171]/70" />
                                    <span className="ml-2">Red</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("orange")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#fb923c]/70" />
                                    <span className="ml-2">Orange</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("yellow")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#fbbf24]/70" />
                                    <span className="ml-2">Yellow</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("green")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#34d399]/70" />
                                    <span className="ml-2">Green</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("cyan")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#22d3ee]/70" />
                                    <span className="ml-2">Cyan</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("blue")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#60a5fa]/70" />
                                    <span className="ml-2">Blue</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("purple")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#a78bfa]/70" />
                                    <span className="ml-2">Purple</span>
                                </div>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleHighlight("pink")}>
                                <div className="flex items-center">
                                    <span className="h-3 w-3 rounded-full bg-[#f472b6]/70" />
                                    <span className="ml-2">Pink</span>
                                </div>
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem onClick={() => setShowCommentDialog(true)}>
                        <div className="flex items-center">
                            <MessageSquareMore className="mr-2 h-4 w-4" />
                            <span className="flex-1">Comment</span>
                        </div>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleCopyUrl}>
                        <div className="flex items-center">
                            <Link2 className="mr-2 h-4 w-4" />
                            <span className="flex-1">URL</span>
                        </div>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleCopyHost}>
                        <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4" />
                            <span className="flex-1">Host</span>
                        </div>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleCopyTime}>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span className="flex-1">Time</span>
                        </div>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleCopyCurl}>
                        <div className="flex items-center">
                            <Terminal className="mr-2 h-4 w-4" />
                            <span className="flex-1">cURL (bash)</span>
                        </div>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Comment</DialogTitle>
                    </DialogHeader>
                    <Input
                        ref={inputRef}
                        placeholder="Enter comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="my-4"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveComment}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
