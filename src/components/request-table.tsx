"use client";

import { BurpSession, BurpEntry } from "@/types/burp";
import { HarSession, HarEntry, HarResponse } from "@/types/har";
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
import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";
import { RequestContextMenu } from "@/components/request-context-menu";

interface RequestTableProps {
    session: BurpSession | HarSession | null;
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

// check if session is har type
function isHarSession(session: BurpSession | HarSession): session is HarSession {
    if (!session?.entries?.[0]) return false;

    const entry = session.entries[0];
    return (
        "request" in entry &&
        "httpVersion" in entry.request &&
        "response" in entry &&
        typeof entry.response === "object" &&
        "content" in (entry.response || {})
    );
}

// check if response is har type
function isHarResponse(response: any): response is HarResponse {
    return "content" in response && "headers" in response;
}

function getEntryTime(entry: BurpEntry | HarEntry): string {
    const timestamp = "startTime" in entry ? entry.startTime : entry.startedDateTime;
    return timestamp ? new Date(timestamp).toLocaleTimeString() : "-";
}

function getEntryId(entry: BurpEntry | HarEntry): string {
    return "startTime" in entry ? entry.startTime : entry.startedDateTime;
}

const columns: ColumnDef<RequestData>[] = [
    {
        accessorKey: "index",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    #
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-mono">{row.getValue("index")}</div>,
        size: 40,
        minSize: 35,
        maxSize: 50,
    },
    {
        accessorKey: "host",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Host
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="truncate font-mono">{row.getValue("host")}</div>,
        size: 220,
        minSize: 120,
        maxSize: 300,
    },
    {
        accessorKey: "method",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Method
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-mono">{row.getValue("method")}</div>,
        size: 85,
        minSize: 60,
        maxSize: 100,
    },
    {
        accessorKey: "url",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Path
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
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
        size: 420,
        minSize: 200,
        maxSize: 600,
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as number;
            return <div className={cn("font-mono font-medium", status)}>{status}</div>;
        },
        size: 80,
        minSize: 50,
        maxSize: 90,
    },
    {
        accessorKey: "mimeType",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    MIME Type
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="truncate font-mono">{row.getValue("mimeType")}</div>,
        size: 175,
        minSize: 150,
        maxSize: 225,
    },
    {
        accessorKey: "length",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Length
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-mono">{row.getValue("length")}</div>,
        size: 70,
        minSize: 90,
        maxSize: 100,
    },
    {
        accessorKey: "time",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="group p-0 font-mono hover:bg-transparent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Time
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="whitespace-nowrap font-mono">{getEntryTime(row.original.entry)}</div>
        ),
        size: 90,
        minSize: 70,
        maxSize: 120,
    },
];

export function RequestTable({ session }: RequestTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { handleSelectEntry } = useSession();
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateKey((k) => k + 1);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const data = useMemo(() => {
        if (!session?.entries) return [];

        return session.entries.map((entry: BurpEntry | HarEntry, index) => {
            try {
                let host = "";
                let pathname = "";
                let search = "";
                let url = isHarSession(session)
                    ? entry.request.url
                    : (entry as BurpEntry).request.url;

                if (!url) {
                    console.warn(`Missing URL for entry ${index}`);
                    return {
                        id: `error-${index}`,
                        index: index + 1,
                        host: "Invalid URL",
                        method: entry.request?.method || "UNKNOWN",
                        url: "/",
                        status: entry.response?.status || 0,
                        statusText: entry.response?.statusText || "",
                        mimeType: "unknown",
                        length: 0,
                        time: getEntryTime(entry),
                        entry,
                    };
                }

                try {
                    const urlObj = new URL(url);
                    host = urlObj.host;
                    pathname = urlObj.pathname;
                    search = urlObj.search;
                } catch (urlError) {
                    console.warn(`Invalid URL format for entry ${index}: ${url}`);
                    const urlParts = url.split("/");
                    if (urlParts.length >= 3) {
                        host = urlParts[2];
                        pathname = "/" + urlParts.slice(3).join("/");
                    } else {
                        host = url;
                        pathname = "/";
                    }
                }

                let mimeType = "unknown";
                let contentLength = 0;

                if (entry.response && isHarResponse(entry.response)) {
                    mimeType = entry.response.content.mimeType || "unknown";
                    contentLength =
                        entry.response.contentLength || entry.response.content.text?.length || 0;
                } else if (entry.response) {
                    mimeType = entry.response.mimeType;
                    contentLength = entry.response.contentLength;
                }

                return {
                    id: `${getEntryId(entry) || "unknown"}-${index}`,
                    index: index + 1,
                    host,
                    method: entry.request?.method || "UNKNOWN",
                    url: pathname + search,
                    status: entry.response?.status || 0,
                    statusText: entry.response?.statusText || "",
                    mimeType,
                    length: contentLength,
                    time: getEntryTime(entry),
                    entry,
                };
            } catch (error) {
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
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No session loaded
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            {/* Fixed Header Table */}
            <div className="border-b bg-background/95 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="overflow-hidden">
                    <div className="flex">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="flex">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-7 flex-shrink-0"
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
                    </div>
                </div>
            </div>

            {/* Scrollable Content Table */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-max">
                    <Table>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <RequestContextMenu key={row.id} entry={row.original.entry}>
                                        <TableRow
                                            data-state={row.getIsSelected() && "selected"}
                                            className={cn(
                                                "flex cursor-pointer hover:bg-accent",
                                                row.getIsSelected() && "bg-accent",
                                                {
                                                    "bg-red-500/10":
                                                        row.original.entry.highlight === "red",
                                                    "bg-orange-500/10":
                                                        row.original.entry.highlight === "orange",
                                                    "bg-yellow-500/10":
                                                        row.original.entry.highlight === "yellow",
                                                    "bg-green-500/10":
                                                        row.original.entry.highlight === "green",
                                                    "bg-cyan-500/10":
                                                        row.original.entry.highlight === "cyan",
                                                    "bg-blue-500/10":
                                                        row.original.entry.highlight === "blue",
                                                    "bg-purple-500/10":
                                                        row.original.entry.highlight === "purple",
                                                    "bg-pink-500/10":
                                                        row.original.entry.highlight === "pink",
                                                }
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
                                    </RequestContextMenu>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
