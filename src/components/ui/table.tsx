import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                className={cn("w-full caption-bottom text-sm", className)}
                {...props}
            />
        </div>
    )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b-0", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
        {...props}
    />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn(
                "cursor-default select-none border-b-0",
                // Default hover and selected states (when no highlight)
                "data-[highlight=none]:data-[state=selected]:bg-accent data-[highlight=none]:hover:bg-accent/50",
                // Highlight color states
                "data-[highlight=red]:bg-red-500/10 data-[highlight=red]:data-[state=selected]:bg-red-500/30 data-[highlight=red]:hover:bg-red-500/20",
                "data-[highlight=orange]:bg-orange-500/10 data-[highlight=orange]:data-[state=selected]:bg-orange-500/30 data-[highlight=orange]:hover:bg-orange-500/20",
                "data-[highlight=yellow]:bg-yellow-500/10 data-[highlight=yellow]:data-[state=selected]:bg-yellow-500/30 data-[highlight=yellow]:hover:bg-yellow-500/20",
                "data-[highlight=green]:bg-green-500/10 data-[highlight=green]:data-[state=selected]:bg-green-500/30 data-[highlight=green]:hover:bg-green-500/20",
                "data-[highlight=cyan]:bg-cyan-500/10 data-[highlight=cyan]:data-[state=selected]:bg-cyan-500/30 data-[highlight=cyan]:hover:bg-cyan-500/20",
                "data-[highlight=blue]:bg-blue-500/10 data-[highlight=blue]:data-[state=selected]:bg-blue-500/30 data-[highlight=blue]:hover:bg-blue-500/20",
                "data-[highlight=purple]:bg-purple-500/10 data-[highlight=purple]:data-[state=selected]:bg-purple-500/30 data-[highlight=purple]:hover:bg-purple-500/20",
                "data-[highlight=pink]:bg-pink-500/10 data-[highlight=pink]:data-[state=selected]:bg-pink-500/30 data-[highlight=pink]:hover:bg-pink-500/20",
                className
            )}
            {...props}
        />
    )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-8 px-2 text-left align-middle font-mono text-base font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "select-none px-2 py-0.5 align-middle [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
