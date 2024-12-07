"use client";

import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
    <ResizablePrimitive.PanelGroup
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
    className,
    ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle>) => (
    <ResizablePrimitive.PanelResizeHandle
        className={cn(
            "group relative mx-1 flex items-center justify-center",
            "w-1 bg-transparent hover:cursor-col-resize",
            "data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:hover:cursor-row-resize",
            "before:absolute before:flex before:transition-[background-color] before:duration-0",
            "before:h-full before:w-[2px] before:rounded-full before:bg-border group-hover:before:bg-primary/60",
            "data-[panel-group-direction=vertical]:before:h-[2px] data-[panel-group-direction=vertical]:before:w-full",
            "active:before:bg-primary/70",
            className
        )}
        {...props}
    />
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
