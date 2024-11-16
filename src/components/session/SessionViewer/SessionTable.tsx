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
} from "~/components/ui/table";
import type { SessionTableProps } from "~/types/session";

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
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-background">
                            <tr>
                                <th className="w-14 p-3 text-left font-medium">#</th>
                                <th className="w-24 p-3 text-left font-medium">Method</th>
                                <th className="p-3 text-left font-medium">URL</th>
                                <th className="w-24 p-3 text-left font-medium">Status</th>
                                <th className="w-24 p-3 text-left font-medium">Length</th>
                                <th className="w-32 p-3 text-left font-medium">MIME Type</th>
                            </tr>
                        </thead>
                    </table>

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
                                    <table className="w-full border-collapse">
                                        <tr>
                                            <td className="w-14 p-3 text-muted-foreground">
                                                {virtualRow.index + 1}
                                            </td>
                                            <td className="w-24 p-3 font-medium">{item.method}</td>
                                            <td className="max-w-[500px] truncate p-3">
                                                {item.url}
                                            </td>
                                            <td className="w-24 p-3">{item.status}</td>
                                            <td className="w-24 p-3">{item.responselength}</td>
                                            <td className="w-32 p-3">{item.mimetype}</td>
                                        </tr>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
