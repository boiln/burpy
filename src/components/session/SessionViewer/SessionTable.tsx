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
    const [selectedItems, setSelectedItems] = React.useState<Set<BurpItem>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null);
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

    const getHighlightClass = (
        color: HighlightColor | null,
        isSelected: boolean = false
    ): string => {
        if (!color) return "";

        const colorMap: Record<NonNullable<HighlightColor>, string> = {
            red: isSelected ? "bg-red-500/40" : "bg-red-500/20",
            orange: isSelected ? "bg-orange-500/40" : "bg-orange-500/20",
            yellow: isSelected ? "bg-yellow-500/40" : "bg-yellow-500/20",
            green: isSelected ? "bg-green-500/40" : "bg-green-500/20",
            cyan: isSelected ? "bg-cyan-500/40" : "bg-cyan-500/20",
            blue: isSelected ? "bg-blue-500/40" : "bg-blue-500/20",
            purple: isSelected ? "bg-purple-500/40" : "bg-purple-500/20",
            pink: isSelected ? "bg-pink-500/40" : "bg-pink-500/20",
        };

        return colorMap[color] || "";
    };

    const rowSelection = table.getSelectedRowModel();
    const handleBulkComment = (items: BurpItem[], comment: string) => {
        items.forEach((item) => onUpdateItem({ ...item, comment }));
    };

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const handleRowClick = (item: BurpItem, index: number, event: React.MouseEvent) => {
        if (event.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelection = new Set(selectedItems);

            for (let i = start; i <= end; i++) {
                newSelection.add(items[i]);
            }

            setSelectedItems(newSelection);
        } else {
            if (event.ctrlKey || event.metaKey) {
                const newSelection = new Set(selectedItems);
                if (newSelection.has(item)) {
                    newSelection.delete(item);
                } else {
                    newSelection.add(item);
                }
                setSelectedItems(newSelection);
            } else {
                setSelectedItems(new Set([item]));
            }
            setLastSelectedIndex(index);
        }
        onSelectItem(item);
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!selectedItem) return;
            const currentIndex = items.findIndex((i) => i === selectedItem);

            if (
                (e.key === "ArrowUp" && currentIndex > 0) ||
                (e.key === "ArrowDown" && currentIndex < items.length - 1)
            ) {
                e.preventDefault();

                const newIndex = e.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
                const newItem = items[newIndex];

                if (e.shiftKey) {
                    const newSelection = new Set(selectedItems);
                    newSelection.add(newItem);
                    setSelectedItems(newSelection);
                } else {
                    setSelectedItems(new Set([newItem]));
                }

                onSelectItem(newItem);
                setLastSelectedIndex(newIndex);

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
    }, [selectedItem, items, onSelectItem, selectedItems]);

    const handleBulkHighlight = (color: HighlightColor | null) => {
        const itemsToUpdate = Array.from(selectedItems);
        itemsToUpdate.forEach((item) => {
            onUpdateItem({ ...item, highlight: color });
        });
    };

    return (
        <div className="h-full overflow-hidden">
            <div className="relative flex h-full flex-col">
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
                                        items={
                                            selectedItems.has(row.original)
                                                ? Array.from(selectedItems)
                                                : undefined
                                        }
                                        onHighlight={(color) =>
                                            selectedItems.has(row.original)
                                                ? handleBulkHighlight(color)
                                                : handleHighlight(row.original, color)
                                        }
                                        onUpdateComment={(comment) =>
                                            selectedItems.has(row.original)
                                                ? handleBulkComment(
                                                      Array.from(selectedItems),
                                                      comment
                                                  )
                                                : handleUpdateComment(row.original, comment)
                                        }
                                    >
                                        <TableRow
                                            data-row-index={index}
                                            className={cn(
                                                "instant-select h-8 select-none transition-colors",
                                                selectedItems.has(row.original) &&
                                                    !row.original.highlight &&
                                                    "bg-accent/50 hover:bg-accent/60",
                                                !selectedItems.has(row.original) &&
                                                    !row.original.highlight &&
                                                    "hover:bg-muted/50",
                                                getHighlightClass(
                                                    row.original.highlight,
                                                    selectedItems.has(row.original)
                                                )
                                            )}
                                            onClick={(e) => handleRowClick(row.original, index, e)}
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
