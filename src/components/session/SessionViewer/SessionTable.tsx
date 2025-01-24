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
        },
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

    return (
        <div className="h-full overflow-hidden">
            <div className="relative flex h-full flex-col overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="h-9 hover:bg-transparent">
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
                    <TableBody className="overflow-auto">
                        {table.getRowModel().rows.map((row) => (
                            <TableContextMenu
                                key={row.id}
                                item={row.original}
                                onHighlight={(color) => handleHighlight(row.original, color)}
                                onUpdateComment={(comment) =>
                                    handleUpdateComment(row.original, comment)
                                }
                            >
                                <TableRow
                                    className={cn(
                                        "h-8 select-none hover:bg-muted/50",
                                        selectedItem === row.original && "bg-muted",
                                        getHighlightClass(row.original.highlight)
                                    )}
                                    onClick={() => onSelectItem(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="p-0 px-2 text-[13px]"
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
    );
}
