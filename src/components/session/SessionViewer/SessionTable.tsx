"use client";

import { useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { SessionTableProps } from "@/types/session";

export function SessionTable({ items, selectedItem, onSelectItem }: SessionTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 5,
    });

    return (
        <div className="rounded-md border">
            <div ref={parentRef} className="overflow-auto" style={{ height: "40vh" }}>
                <div style={{ position: "relative" }}>
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
                    </Table>

                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const item = items[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.index}
                                    className={`absolute w-full ${
                                        selectedItem === item ? "bg-muted" : ""
                                    } cursor-pointer hover:bg-muted/50`}
                                    style={{
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    onClick={() => onSelectItem(item)}
                                >
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="w-14 text-muted-foreground">
                                                    {virtualRow.index + 1}
                                                </TableCell>
                                                <TableCell className="w-24 font-medium">
                                                    {item.method}
                                                </TableCell>
                                                <TableCell className="max-w-[500px] truncate">
                                                    {item.url}
                                                </TableCell>
                                                <TableCell className="w-24">{item.status}</TableCell>
                                                <TableCell className="w-24">
                                                    {item.responselength}
                                                </TableCell>
                                                <TableCell className="w-32">{item.mimetype}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
