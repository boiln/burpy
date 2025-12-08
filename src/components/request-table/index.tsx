"use client";

import { useState, useMemo, useRef } from "react";

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    type ColumnSizingState,
} from "@tanstack/react-table";

import { RequestContextMenu } from "@/components/request-context-menu";
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    isHarSession,
    getEntryId,
    getEntryTime,
    parseUrl,
    getResponseInfo,
    getEntryCookies,
} from "@/lib/entry-utils";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import type { BurpSession, BurpEntry } from "@/types/burp";
import type { HarSession, HarEntry } from "@/types/har";

import { columns, createColumns } from "./columns";

import type { RequestData } from "./types";

interface RequestTableProps {
    session: BurpSession | HarSession | null;
}

export const RequestTable = (props: RequestTableProps) => {
    const { session } = props;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const { selectedEntry, selectedEntries, searchTerm, handleMultiSelectEntry } = useSession();
    const tableRef = useRef<HTMLDivElement>(null);

    const tableColumns = useMemo(() => createColumns(searchTerm), [searchTerm]);

    const data = useMemo(() => {
        if (!session?.entries) return [];

        return session.entries.map((entry: BurpEntry | HarEntry, index) => {
            return transformEntry(entry, index, session);
        });
    }, [session]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing,
        state: { sorting, columnSizing },
        columnResizeMode: "onChange",
        defaultColumn: {
            minSize: 20,
        },
    });

    const handleRowClick = (e: React.MouseEvent, entry: BurpEntry | HarEntry) => {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            handleMultiSelectEntry(entry, "ctrl");
            return;
        }

        if (e.shiftKey && session?.entries) {
            handleShiftClick(
                entry,
                session,
                selectedEntry,
                selectedEntries as Set<BurpEntry | HarEntry>,
                handleMultiSelectEntry
            );
            return;
        }

        handleMultiSelectEntry(entry, "single");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!session?.entries || !selectedEntry) return;

        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

        e.preventDefault();

        const entries = session.entries as (BurpEntry | HarEntry)[];
        const currentIndex = entries.findIndex((ent) => ent === selectedEntry);
        if (currentIndex === -1) return;

        const nextIndex =
            e.key === "ArrowUp"
                ? Math.max(0, currentIndex - 1)
                : Math.min(entries.length - 1, currentIndex + 1);

        const nextEntry = entries[nextIndex];
        if (!nextEntry) return;

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
    };

    if (!session) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No session loaded
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <TableHeader_ table={table} />
            <TableBody_
                table={table}
                tableRef={tableRef}
                selectedEntries={selectedEntries as Set<BurpEntry | HarEntry>}
                onRowClick={handleRowClick}
                onKeyDown={handleKeyDown}
                handleMultiSelectEntry={handleMultiSelectEntry}
            />
        </div>
    );
};

const transformEntry = (
    entry: BurpEntry | HarEntry,
    index: number,
    session: BurpSession | HarSession
): RequestData => {
    try {
        const url = isHarSession(session) ? entry.request.url : (entry as BurpEntry).request.url;

        if (!url) {
            console.warn(`Missing URL for entry ${index}`);
            return createErrorEntry(entry, index, "Invalid URL");
        }

        const { host, pathname, search } = parseUrl(url);
        const { mimeType, contentLength } = getResponseInfo(entry);

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
            cookies: getEntryCookies(entry),
            entry,
        };
    } catch (error) {
        console.error(`Error processing entry ${index}:`, error);
        return createErrorEntry(entry, index, "Error");
    }
};

const createErrorEntry = (
    entry: BurpEntry | HarEntry,
    index: number,
    host: string
): RequestData => ({
    id: `error-${index}`,
    index: index + 1,
    host,
    method: entry.request?.method || "ERROR",
    url: "/",
    status: entry.response?.status || 0,
    statusText: entry.response?.statusText || "Error",
    mimeType: "unknown",
    length: 0,
    time: "-",
    cookies: "",
    entry,
});

const handleShiftClick = (
    entry: BurpEntry | HarEntry,
    session: BurpSession | HarSession,
    selectedEntry: BurpEntry | HarEntry | null,
    selectedEntries: Set<BurpEntry | HarEntry>,
    handleMultiSelectEntry: (entry: BurpEntry | HarEntry, mode: "shift") => void
) => {
    const entries = session.entries as (BurpEntry | HarEntry)[];
    const currentIndex = entries.findIndex((e) => e === entry);
    const lastSelectedIndex = entries.findIndex((e) => e === selectedEntry);

    if (lastSelectedIndex === -1) return;

    const start = Math.min(currentIndex, lastSelectedIndex);
    const end = Math.max(currentIndex, lastSelectedIndex);
    const rangeEntries = entries.slice(start, end + 1);

    selectedEntries.clear();
    rangeEntries.forEach((e) => selectedEntries.add(e));

    handleMultiSelectEntry(entry, "shift");
};

const TableHeader_ = ({ table }: { table: any }) => (
    <div className="border-b bg-background/95 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="scrollbar-hide overflow-x-auto">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup: any) => (
                        <TableRow key={headerGroup.id} className="flex">
                            {headerGroup.headers.map((header: any, index: number) => (
                                <TableHead
                                    key={header.id}
                                    className="group relative h-7 flex-shrink-0"
                                    style={{
                                        width: header.column.getSize(),
                                        minWidth: header.column.columnDef.minSize,
                                    }}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                    {header.column.getCanResize() &&
                                        index < headerGroup.headers.length - 1 && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                onDoubleClick={() => header.column.resetSize()}
                                                className={cn(
                                                    "absolute bottom-0 right-0 h-4 w-[4px] cursor-col-resize touch-none select-none",
                                                    "border-r border-border",
                                                    header.column.getIsResizing() &&
                                                        "border-primary"
                                                )}
                                            />
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
            </Table>
        </div>
    </div>
);

interface TableBodyProps {
    table: any;
    tableRef: React.RefObject<HTMLDivElement>;
    selectedEntries: Set<BurpEntry | HarEntry>;
    onRowClick: (e: React.MouseEvent, entry: BurpEntry | HarEntry) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    handleMultiSelectEntry: (entry: BurpEntry | HarEntry, mode: "single") => void;
}

const TableBody_ = (props: TableBodyProps) => {
    const { table, tableRef, selectedEntries, onRowClick, onKeyDown, handleMultiSelectEntry } =
        props;

    const rows = table.getRowModel().rows;

    return (
        <div className="flex-1 overflow-hidden">
            <CustomScrollbar className="h-full" ref={tableRef} tabIndex={0} onKeyDown={onKeyDown}>
                <div className="min-w-max">
                    <Table>
                        <TableBody>
                            {rows?.length ? (
                                rows.map((row: any, index: number) => (
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
                                            onClick={(e) => onRowClick(e, row.original.entry)}
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
                                            {row.getVisibleCells().map((cell: any) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className="flex-shrink-0"
                                                    style={{
                                                        width: cell.column.getSize(),
                                                        minWidth: cell.column.columnDef.minSize,
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
            </CustomScrollbar>
        </div>
    );
};

export default RequestTable;
