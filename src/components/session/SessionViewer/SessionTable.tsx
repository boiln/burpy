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

export function SessionTable({ items, selectedItem, onSelectItem }: SessionTableProps) {
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
                        {items.map((item, index) => (
                            <TableRow
                                key={index}
                                className={`hover:bg-muted/50 ${
                                    selectedItem === item ? "bg-muted" : ""
                                }`}
                                onClick={() => onSelectItem(item)}
                            >
                                <TableCell className="w-14 text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="w-24 font-medium">{item.method}</TableCell>
                                <TableCell className="max-w-[500px] truncate">{item.url}</TableCell>
                                <TableCell className="w-24">{item.status}</TableCell>
                                <TableCell className="w-24">{item.responselength}</TableCell>
                                <TableCell className="w-32">{item.mimetype}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
