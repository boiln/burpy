"use client";

import { BurpSession } from "@/types/burp";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";

interface RequestTableProps {
    session: BurpSession | null;
}

type RequestData = {
    id: string;
    index: number;
    host: string;
    method: string;
    url: string;
    status: number;
    statusText: string;
    mimeType: string;
    length: number;
    time: string;
    entry: any;
};

const columns: ColumnDef<RequestData>[] = [
    {
        accessorKey: "index",
        header: ({ column }) => {
            return (
                <div className="w-16 text-right">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        #
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="font-mono">{row.getValue("index")}</div>,
        size: 50,
    },
    {
        accessorKey: "host",
        header: ({ column }) => {
            return (
                <div className="w-[200px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Host
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="truncate font-mono">{row.getValue("host")}</div>,
        size: 250,
    },
    {
        accessorKey: "method",
        header: ({ column }) => {
            return (
                <div className="w-[100px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Method
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="font-mono">{row.getValue("method")}</div>,
        size: 100,
    },
    {
        accessorKey: "url",
        header: ({ column }) => {
            return (
                <div className="w-[400px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Path
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="truncate font-mono text-xs">{row.getValue("url")}</div>,
        size: 450,
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <div className="w-[100px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as number;
            return <div className={cn("font-mono font-medium", status)}>{status}</div>;
        },
        size: 85,
    },
    {
        accessorKey: "mimeType",
        header: ({ column }) => {
            return (
                <div className="w-[150px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        MIME Type
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("mimeType")}</div>,
        size: 180,
    },
    {
        accessorKey: "length",
        header: ({ column }) => {
            return (
                <div className="w-[100px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Length
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => <div className="font-mono">{row.getValue("length")}</div>,
        size: 95,
    },
    {
        accessorKey: "time",
        header: ({ column }) => {
            return (
                <div className="w-[120px]">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-1 p-0 hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Time
                        <ArrowUpDown className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <div className="whitespace-nowrap font-mono">{row.getValue("time")}</div>
        ),
        size: 150,
    },
];

export function RequestTable({ session }: RequestTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { handleSelectEntry } = useSession();

    const data = useMemo(() => {
        if (!session) return [];

        return session.entries.map((entry, index) => {
            try {
                let host = "";
                let pathname = "";
                let search = "";

                // Validate required fields
                if (!entry.request?.url) {
                    console.warn(`Missing URL for entry ${index}`);
                    return {
                        id: `error-${index}`,
                        index: index + 1,
                        host: "Invalid URL",
                        method: entry.request?.method || "UNKNOWN",
                        url: "/",
                        status: entry.response?.status || 0,
                        statusText: entry.response?.statusText || "",
                        mimeType: entry.response?.mimeType || "unknown",
                        length: entry.response?.contentLength || 0,
                        time: entry.startTime
                            ? new Date(entry.startTime).toLocaleTimeString()
                            : "-",
                        entry,
                    };
                }

                // Parse URL
                try {
                    const url = new URL(entry.request.url);
                    host = url.host;
                    pathname = url.pathname;
                    search = url.search;
                } catch (urlError) {
                    // Handle invalid URLs gracefully
                    console.warn(`Invalid URL format for entry ${index}: ${entry.request.url}`);
                    const urlParts = entry.request.url.split("/");
                    if (urlParts.length >= 3) {
                        host = urlParts[2];
                        pathname = "/" + urlParts.slice(3).join("/");
                    } else {
                        host = entry.request.url;
                        pathname = "/";
                    }
                }

                // Create table row data with null checks
                return {
                    id: `${entry.startTime || "unknown"}-${index}`,
                    index: index + 1,
                    host,
                    method: entry.request?.method || "UNKNOWN",
                    url: pathname + search,
                    status: entry.response?.status || 0,
                    statusText: entry.response?.statusText || "",
                    mimeType: entry.response?.mimeType || "unknown",
                    length: entry.response?.contentLength || 0,
                    time: entry.startTime ? new Date(entry.startTime).toLocaleTimeString() : "-",
                    entry,
                };
            } catch (error) {
                // Fallback for completely invalid entries
                console.error(`Error processing entry ${index}:`, error);
                return {
                    id: `error-${index}`,
                    index: index + 1,
                    host: "Error",
                    method: "ERROR",
                    url: "/",
                    status: 0,
                    statusText: "Error",
                    mimeType: "unknown",
                    length: 0,
                    time: "-",
                    entry,
                };
            }
        });
    }, [session]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        columnResizeMode: "onChange",
        defaultColumn: {
            minSize: 20,
            maxSize: 1000,
            size: 100,
        },
    });

    if (!session) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No session loaded
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Fixed Header Table */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="flex">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-10 flex-shrink-0"
                                        style={{
                                            width: header.column.getSize(),
                                            minWidth: header.column.columnDef.minSize,
                                            maxWidth: header.column.columnDef.maxSize,
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                </Table>
            </div>

            {/* Scrollable Content Table */}
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "flex cursor-pointer hover:bg-accent",
                                        row.getIsSelected() && "bg-accent"
                                    )}
                                    onClick={() => handleSelectEntry(row.original.entry)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleSelectEntry(row.original.entry);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="row"
                                    aria-selected={row.getIsSelected()}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="flex-shrink-0"
                                            style={{
                                                width: cell.column.getSize(),
                                                minWidth: cell.column.columnDef.minSize,
                                                maxWidth: cell.column.columnDef.maxSize,
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
