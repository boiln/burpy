import { ColumnDef } from "@tanstack/react-table";
import { BurpItem } from "@/types/burp";
import { formatMimeType } from "@/lib/utils";
import { CommentIndicator } from "@/components/session/SessionViewer/CommentIndicator";

export const columns: ColumnDef<BurpItem>[] = [
    {
        accessorFn: (_: BurpItem, index: number) => index + 1,
        header: "#",
        size: 30,
        id: "index",
    },
    {
        accessorFn: (row: BurpItem) => row.host.value,
        header: "Host",
        size: 150,
        id: "host",
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell" title={row.getValue("host")}>
                {row.getValue("host")}
            </div>
        ),
    },
    {
        accessorKey: "method",
        header: "Method",
        size: 60,
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell">{row.getValue("method")}</div>
        ),
    },
    {
        accessorKey: "url",
        header: "URL",
        size: 200,
        cell: ({ row }: { row: any }) => (
            <div className="flex items-center gap-2">
                <span className="truncate-cell" title={row.getValue("url")}>
                    {row.getValue("url")}
                </span>
                {row.original.comment && <CommentIndicator comment={row.original.comment} />}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 60,
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell">{row.getValue("status")}</div>
        ),
    },
    {
        accessorKey: "responselength",
        header: "Length",
        size: 60,
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell">{row.getValue("responselength")}</div>
        ),
    },
    {
        accessorKey: "mimetype",
        header: "MIME Type",
        size: 80,
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell" title={row.getValue("mimetype")}>
                {formatMimeType(row.getValue("mimetype"))}
            </div>
        ),
    },
    {
        accessorFn: (row: BurpItem) => row.host.ip,
        header: "IP",
        size: 90,
        id: "ip",
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell" title={row.original.host.ip}>
                {row.original.host.ip}
            </div>
        ),
    },
    {
        accessorKey: "time",
        header: "Time",
        size: 120,
        cell: ({ row }: { row: any }) => (
            <div className="truncate-cell">{row.getValue("time")}</div>
        ),
    },
];
