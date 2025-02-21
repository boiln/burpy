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
import { useState, useMemo, useEffect, useRef } from "react";
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
        size: 500,
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
    const { handleSelectEntry, selectedEntry, handleMultiSelectEntry, selectedEntries } =
        useSession();
    const [updateKey, setUpdateKey] = useState(0);
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateKey((k) => k + 1);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleRowClick = (e: React.MouseEvent, entry: BurpEntry | HarEntry) => {
        // Prevent text selection during click operations
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            handleMultiSelectEntry(entry, "ctrl");
        } else if (e.shiftKey) {
            if (session?.entries) {
                const entries = session.entries as (BurpEntry | HarEntry)[];
                const currentIndex = entries.findIndex((e) => e === entry);
                const lastSelectedIndex = entries.findIndex((e) => e === selectedEntry);

                if (lastSelectedIndex !== -1) {
                    const start = Math.min(currentIndex, lastSelectedIndex);
                    const end = Math.max(currentIndex, lastSelectedIndex);
                    const rangeEntries = entries.slice(start, end + 1);

                    // Clear existing selection and add the range
                    selectedEntries.clear();
                    rangeEntries.forEach((e) => selectedEntries.add(e));

                    // Update the last selected entry for future range selections
                    handleMultiSelectEntry(entry, "shift");
                }
            }
        } else {
            handleMultiSelectEntry(entry, "single");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!session?.entries || !selectedEntry) return;

        const entries = session.entries as (BurpEntry | HarEntry)[];
        const currentIndex = entries.findIndex((e) => e === selectedEntry);
        if (currentIndex === -1) return;

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex =
                e.key === "ArrowUp"
                    ? Math.max(0, currentIndex - 1)
                    : Math.min(entries.length - 1, currentIndex + 1);

            const nextEntry = entries[nextIndex];
            if (nextEntry) {
                if (e.shiftKey) {
                    handleMultiSelectEntry(nextEntry, "shift");
                    if (e.key === "ArrowUp") {
                        selectedEntries.add(nextEntry);
                    } else {
                        const lastEntry = entries[currentIndex];
                        if (lastEntry) selectedEntries.delete(lastEntry);
                    }
                } else {
                    handleMultiSelectEntry(nextEntry, "single");
                }

                const row = tableRef.current?.querySelector(`[data-row-index="${nextIndex}"]`);
                row?.scrollIntoView({ block: "nearest" });
            }
        }
    };

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
                    <Table>
                        <TableHeader>
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
                        </TableHeader>
                    </Table>
                </div>
            </div>

            {/* Scrollable Content Table */}
            <div
                className="flex-1 overflow-auto"
                ref={tableRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <div className="min-w-max">
                    <Table>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, index) => (
                                    <RequestContextMenu key={row.id} entry={row.original.entry}>
                                        <TableRow
                                            data-row-index={index}
                                            data-state={
                                                selectedEntries.has(row.original.entry)
                                                    ? "selected"
                                                    : undefined
                                            }
                                            data-highlight={row.original.entry.highlight || "none"}
                                            className={cn(
                                                "instant-select flex",
                                                selectedEntries.has(row.original.entry) &&
                                                    "bg-accent"
                                            )}
                                            onClick={(e) => handleRowClick(e, row.original.entry)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    handleMultiSelectEntry(
                                                        row.original.entry,
                                                        "single"
                                                    );
                                                }
                                            }}
                                            tabIndex={0}
                                            role="row"
                                            aria-selected={selectedEntries.has(row.original.entry)}
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
