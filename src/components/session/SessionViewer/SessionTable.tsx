"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import type { SessionTableProps } from "~/types/session";

export function SessionTable({
    items,
    selectedItem,
    onSelectItem,
}: SessionTableProps) {
    return (
        <div className="rounded-md border">
            <div className="overflow-auto" style={{ maxHeight: "40vh" }}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-14">#</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Length</TableHead>
                            <TableHead>MIME Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow
                                key={index}
                                className={`cursor-pointer hover:bg-muted/50 ${
                                    selectedItem === item ? "bg-muted" : ""
                                }`}
                                onClick={() => onSelectItem(item)}
                            >
                                <TableCell className="font-mono text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.method}
                                </TableCell>
                                <TableCell className="max-w-md truncate">
                                    {item.url}
                                </TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>{item.responselength}</TableCell>
                                <TableCell>{item.mimetype}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
