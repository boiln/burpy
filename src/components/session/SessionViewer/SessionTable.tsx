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
import { MessageCircle, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { formatMimeType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type SortableColumns =
    | "time"
    | "method"
    | "url"
    | "status"
    | "responselength"
    | "mimetype"
    | "host";

type SortConfig = {
    key: SortableColumns | null;
    direction: "asc" | "desc";
};

interface CommentIndicatorProps {
    comment: string;
}

export function SessionTable({
    items,
    selectedItem,
    onSelectItem,
    onUpdateItem,
}: SessionTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });

    const handleSort = (key: SortableColumns) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    const getSortedItems = () => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            let aValue: string;
            let bValue: string;

            const key = sortConfig.key as SortableColumns;

            if (key === "host") {
                aValue = a.host.value;
                bValue = b.host.value;
            } else if (key === "mimetype") {
                aValue = formatMimeType(a.mimetype);
                bValue = formatMimeType(b.mimetype);
            } else {
                aValue = String(a[key]);
                bValue = String(b[key]);
            }

            return sortConfig.direction === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    };

    const SortIcon = ({ column }: { column: SortableColumns }) => {
        if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    const handleHighlight = (item: BurpItem, color: HighlightColor | null) => {
        const updatedItem = {
            ...item,
            highlight: color,
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

        const colorMap: Record<NonNullable<HighlightColor>, string> = {
            red: "bg-red-500/10",
            orange: "bg-orange-500/10",
            yellow: "bg-yellow-500/10",
            green: "bg-green-500/10",
            cyan: "bg-cyan-500/10",
            blue: "bg-blue-500/10",
            purple: "bg-purple-500/10",
            pink: "bg-pink-500/10",
        };

        return colorMap[color] || "";
    };

    const CommentIndicator: React.FC<CommentIndicatorProps> = ({ comment }) => {
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
        <div className="h-full overflow-hidden">
            <div className="relative flex h-full flex-col">
                <div className="sticky top-0 z-10 bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("time")}
                                    >
                                        #
                                        <SortIcon column="time" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[80px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("method")}
                                    >
                                        Method
                                        <SortIcon column="method" />
                                    </Button>
                                </TableHead>
                                <TableHead className="min-w-[400px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("url")}
                                    >
                                        URL
                                        <SortIcon column="url" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[80px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("status")}
                                    >
                                        Status
                                        <SortIcon column="status" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[80px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("responselength")}
                                    >
                                        Length
                                        <SortIcon column="responselength" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[180px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("mimetype")}
                                    >
                                        MIME Type
                                        <SortIcon column="mimetype" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("host")}
                                    >
                                        IP
                                        <SortIcon column="host" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[180px]">
                                    <Button
                                        variant="ghost"
                                        className="-ml-4 h-8 px-4 font-medium"
                                        onClick={() => handleSort("time")}
                                    >
                                        Time
                                        <SortIcon column="time" />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Table>
                        <TableBody>
                            {getSortedItems().map((item, index) => (
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
                                            "cursor-pointer hover:bg-muted/50",
                                            selectedItem === item && "bg-muted",
                                            getHighlightClass(item.highlight)
                                        )}
                                        onClick={() => onSelectItem(item)}
                                    >
                                        <TableCell className="w-[50px] text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="w-[80px]">
                                            <span className="block truncate font-medium">
                                                {item.method}
                                            </span>
                                        </TableCell>
                                        <TableCell className="min-w-[400px] max-w-[400px]">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{item.url}</span>
                                                <CommentIndicator comment={item.comment} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[80px]">
                                            <span className="block truncate">{item.status}</span>
                                        </TableCell>
                                        <TableCell className="w-[80px]">
                                            <span className="block truncate">
                                                {item.responselength}
                                            </span>
                                        </TableCell>
                                        <TableCell className="w-[180px]">
                                            <span className="block truncate" title={item.mimetype}>
                                                {formatMimeType(item.mimetype)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="w-[120px]">
                                            <span className="block truncate" title={item.host.ip}>
                                                {item.host.ip}
                                            </span>
                                        </TableCell>
                                        <TableCell className="w-[180px]">
                                            <span className="block truncate">{item.time}</span>
                                        </TableCell>
                                    </TableRow>
                                </TableContextMenu>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
