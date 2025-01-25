"use client";

import * as React from "react";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BurpItem, HighlightColor } from "@/types/burp";
import { columns } from "@/components/session/SessionViewer/Columns";
import { TableContextMenu } from "@/components/session/SessionViewer/TableContextMenu";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionTableProps {
    items: BurpItem[];
    selectedItem: BurpItem | null;
    onSelectItem: (item: BurpItem) => void;
    onUpdateItem: (item: BurpItem) => void;
}

export function SessionTable({
    items,
    selectedItem,
    onSelectItem,
    onUpdateItem,
}: SessionTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const isHarFile = items.length > 0 && items[0].host.ip === "";

    const filteredColumns = React.useMemo(
        () => columns.filter((col) => !(isHarFile && col.header === "IP")),
        [isHarFile]
    );

    const table = useReactTable({
        data: items,
        columns: filteredColumns,
        state: {
            sorting,
            rowSelection: {},
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleHighlight = (item: BurpItem, color: HighlightColor | null) => {
        onUpdateItem({ ...item, highlight: color });
    };

    const handleUpdateComment = (item: BurpItem, comment: string) => {
        onUpdateItem({ ...item, comment });
    };

    const getHighlightClass = (color: HighlightColor | null): string => {
        if (!color) return "";

        const colorMap: Record<NonNullable<HighlightColor>, string> = {
            red: "bg-red-500/20",
            orange: "bg-orange-500/20",
            yellow: "bg-yellow-500/20",
            green: "bg-green-500/20",
            cyan: "bg-cyan-500/20",
            blue: "bg-blue-500/20",
            purple: "bg-purple-500/20",
            pink: "bg-pink-500/20",
        };

        return colorMap[color] || "";
    };

    const rowSelection = table.getSelectedRowModel();
    const handleBulkComment = (items: BurpItem[], comment: string) => {
        items.forEach((item) => onUpdateItem({ ...item, comment }));
    };

    // Add ref for the scrollable container instead of TableBody
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!selectedItem) return;
            const currentIndex = items.findIndex((i) => i === selectedItem);

            if (
                (e.key === "ArrowUp" && currentIndex > 0) ||
                (e.key === "ArrowDown" && currentIndex < items.length - 1)
            ) {
                e.preventDefault(); // Prevent default scroll behavior

                const newIndex = e.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
                const newItem = items[newIndex];
                onSelectItem(newItem);

                // Find the row element within the scrollable container
                const rowElement = scrollContainerRef.current?.querySelector(
                    `[data-row-index="${newIndex}"]`
                ) as HTMLElement;

                if (rowElement && scrollContainerRef.current) {
                    const containerRect = scrollContainerRef.current.getBoundingClientRect();
                    const rowRect = rowElement.getBoundingClientRect();

                    // Check if the row is outside the visible area
                    if (rowRect.top < containerRect.top) {
                        scrollContainerRef.current.scrollTop -= containerRect.top - rowRect.top;
                    } else if (rowRect.bottom > containerRect.bottom) {
                        scrollContainerRef.current.scrollTop +=
                            rowRect.bottom - containerRect.bottom;
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [selectedItem, items, onSelectItem]);

    return (
        <div className="h-full overflow-hidden">
            <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-2">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                handleBulkComment(
                                    table.getSelectedRowModel().rows.map((r) => r.original),
                                    ""
                                )
                            }
                        >
                            Clear Comments
                        </Button>
                    </div>
                </div>
                <div className="relative flex-1">
                    <div className="absolute inset-0 overflow-auto" ref={scrollContainerRef}>
                        <Table>
                            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="border-b hover:bg-transparent"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    "h-8 select-none",
                                                    header.column.getCanSort() && "cursor-pointer"
                                                )}
                                                style={{
                                                    width: header.getSize(),
                                                    minWidth: header.getSize(),
                                                    maxWidth: header.getSize(),
                                                }}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getIsSorted() && (
                                                        <span>
                                                            {header.column.getIsSorted() === "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.map((row, index) => (
                                    <TableContextMenu
                                        key={row.id}
                                        item={row.original}
                                        onHighlight={(color) =>
                                            handleHighlight(row.original, color)
                                        }
                                        onUpdateComment={(comment) =>
                                            handleUpdateComment(row.original, comment)
                                        }
                                    >
                                        <TableRow
                                            data-row-index={index}
                                            className={cn(
                                                "instant-select h-8 select-none hover:bg-muted/50",
                                                selectedItem === row.original && "selected-row",
                                                getHighlightClass(row.original.highlight)
                                            )}
                                            onClick={() => onSelectItem(row.original)}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className="table-cell-base"
                                                    style={{
                                                        width: cell.column.getSize(),
                                                        minWidth: cell.column.getSize(),
                                                        maxWidth: cell.column.getSize(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableContextMenu>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
