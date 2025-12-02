"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEntryTime } from "@/lib/entry-utils";
import type { RequestData } from "./types";

/**
 * Creates a sortable header button component
 */
const SortableHeader = ({ column, label }: { column: any; label: string }) => (
    <Button
        variant="ghost"
        className="group p-0 font-mono hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
        {label}
        <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </Button>
);

export const columns: ColumnDef<RequestData>[] = [
    {
        accessorKey: "index",
        header: ({ column }) => <SortableHeader column={column} label="#" />,
        cell: ({ row }) => <div className="font-mono">{row.getValue("index")}</div>,
        size: 40,
        minSize: 35,
        maxSize: 50,
    },
    {
        accessorKey: "host",
        header: ({ column }) => <SortableHeader column={column} label="Host" />,
        cell: ({ row }) => <div className="truncate font-mono">{row.getValue("host")}</div>,
        size: 220,
        minSize: 120,
        maxSize: 300,
    },
    {
        accessorKey: "method",
        header: ({ column }) => <SortableHeader column={column} label="Method" />,
        cell: ({ row }) => <div className="font-mono">{row.getValue("method")}</div>,
        size: 85,
        minSize: 60,
        maxSize: 100,
    },
    {
        accessorKey: "url",
        header: ({ column }) => <SortableHeader column={column} label="Path" />,
        cell: ({ row }) => (
            <div className="flex items-center justify-between gap-1 font-mono">
                <span className="truncate">{row.getValue("url")}</span>
                {row.original.entry.comment && (
                    <div className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5">
                        <MessageSquare className="h-3 w-3" />
                        <span>{row.original.entry.comment}</span>
                    </div>
                )}
            </div>
        ),
        size: 500,
        minSize: 200,
        maxSize: 600,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as number;
            return <div className={cn("font-mono font-medium")}>{status}</div>;
        },
        size: 80,
        minSize: 50,
        maxSize: 90,
    },
    {
        accessorKey: "mimeType",
        header: ({ column }) => <SortableHeader column={column} label="MIME Type" />,
        cell: ({ row }) => <div className="truncate font-mono">{row.getValue("mimeType")}</div>,
        size: 175,
        minSize: 150,
        maxSize: 225,
    },
    {
        accessorKey: "length",
        header: ({ column }) => <SortableHeader column={column} label="Length" />,
        cell: ({ row }) => <div className="font-mono">{row.getValue("length")}</div>,
        size: 70,
        minSize: 90,
        maxSize: 100,
    },
    {
        accessorKey: "time",
        header: ({ column }) => <SortableHeader column={column} label="Time" />,
        cell: ({ row }) => (
            <div className="whitespace-nowrap font-mono">{getEntryTime(row.original.entry)}</div>
        ),
        size: 90,
        minSize: 70,
        maxSize: 120,
    },
];
