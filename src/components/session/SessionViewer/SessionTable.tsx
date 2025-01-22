"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { SessionTableProps } from "@/types/session";
import { TableContextMenu } from "./TableContextMenu";
import { BurpItem, HighlightColor } from "@/types/burp";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageCircle } from "lucide-react";

export function SessionTable({
    items,
    selectedItem,
    onSelectItem,
    onUpdateItem,
}: SessionTableProps) {
    const handleHighlight = (item: BurpItem, color: HighlightColor) => {
        const updatedItem = {
            ...item,
            highlight: color ?? null,
        };
        onUpdateItem(updatedItem);
    };

    const handleUpdateComment = (item: BurpItem, comment: string) => {
        const updatedItem = {
            ...item,
            comment,
        };
        onUpdateItem(updatedItem);
    };

    const getHighlightClass = (color: HighlightColor): string => {
        if (!color) return "";

        const baseOpacity = "hover:bg-muted/50";
        const highlightOpacity = "/20";

        switch (color) {
            case "red":
                return `bg-red-500${highlightOpacity}`;
            case "orange":
                return `bg-orange-500${highlightOpacity}`;
            case "yellow":
                return `bg-yellow-500${highlightOpacity}`;
            case "green":
                return `bg-green-500${highlightOpacity}`;
            case "cyan":
                return `bg-cyan-500${highlightOpacity}`;
            case "blue":
                return `bg-blue-500${highlightOpacity}`;
            case "purple":
                return `bg-purple-500${highlightOpacity}`;
            case "pink":
                return `bg-pink-500${highlightOpacity}`;
            default:
                return "";
        }
    };

    const CommentIndicator = ({ comment }: { comment: string }) => {
        if (!comment.trim()) return null;

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted">
                        <MessageCircle className="h-3 w-3" />
                        <span className="max-w-[150px] truncate">{comment}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-md whitespace-pre-wrap">{comment}</p>
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <div className="rounded-md border">
            <div className="overflow-auto" style={{ height: "40vh" }}>
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            <TableHead className="w-14">#</TableHead>
                            <TableHead className="w-24">Method</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead className="w-24">Status</TableHead>
                            <TableHead className="w-24">Length</TableHead>
                            <TableHead className="w-32">MIME Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => {
                            const highlightClass = getHighlightClass(item.highlight);

                            return (
                                <TableContextMenu
                                    key={`${item.url}-${item.time}-${index}`}
                                    item={item}
                                    onHighlight={(color) => handleHighlight(item, color)}
                                    onUpdateComment={(comment) =>
                                        handleUpdateComment(item, comment)
                                    }
                                >
                                    <TableRow
                                        className={cn(
                                            "hover:bg-muted/50",
                                            selectedItem === item && "bg-muted",
                                            highlightClass
                                        )}
                                        onClick={() => onSelectItem(item)}
                                    >
                                        <TableCell className="w-14 text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="w-24 font-medium">
                                            {item.method}
                                        </TableCell>
                                        <TableCell className="max-w-[500px] truncate">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{item.url}</span>
                                                <CommentIndicator comment={item.comment} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-24">{item.status}</TableCell>
                                        <TableCell className="w-24">
                                            {item.responselength}
                                        </TableCell>
                                        <TableCell className="w-32">{item.mimetype}</TableCell>
                                    </TableRow>
                                </TableContextMenu>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
