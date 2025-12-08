"use client";

import { useState, useRef, useCallback, useEffect, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomScrollbarProps {
    children: ReactNode;
    className?: string;
    tabIndex?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const CustomScrollbar = forwardRef<HTMLDivElement, CustomScrollbarProps>(
    ({ children, className, tabIndex, onKeyDown }, ref) => {
        const internalRef = useRef<HTMLDivElement>(null);
        const containerRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;
        const trackRef = useRef<HTMLDivElement>(null);
        const [scrollState, setScrollState] = useState({
            scrollTop: 0,
            scrollHeight: 0,
            clientHeight: 0,
        });
        const isDragging = useRef(false);

        const updateScrollState = useCallback(() => {
            const el = (containerRef as React.RefObject<HTMLDivElement>).current;
            if (el) {
                setScrollState({
                    scrollTop: el.scrollTop,
                    scrollHeight: el.scrollHeight,
                    clientHeight: el.clientHeight,
                });
            }
        }, [containerRef]);

        useEffect(() => {
            const el = (containerRef as React.RefObject<HTMLDivElement>).current;
            if (!el) return;
            updateScrollState();
            el.addEventListener("scroll", updateScrollState);
            const resizeObserver = new ResizeObserver(updateScrollState);
            resizeObserver.observe(el);
            return () => {
                el.removeEventListener("scroll", updateScrollState);
                resizeObserver.disconnect();
            };
        }, [containerRef, updateScrollState]);

        const thumbHeight =
            scrollState.scrollHeight > 0
                ? Math.max(
                      30,
                      (scrollState.clientHeight / scrollState.scrollHeight) * scrollState.clientHeight
                  )
                : 0;
        const thumbTop =
            scrollState.scrollHeight > scrollState.clientHeight
                ? (scrollState.scrollTop / (scrollState.scrollHeight - scrollState.clientHeight)) *
                  (scrollState.clientHeight - thumbHeight)
                : 0;

        const handleTrackMouseDown = (e: React.MouseEvent) => {
            const el = (containerRef as React.RefObject<HTMLDivElement>).current;
            if (!el || !trackRef.current) return;
            const trackRect = trackRef.current.getBoundingClientRect();
            const clickY = e.clientY - trackRect.top;
            const scrollRatio = clickY / trackRect.height;
            el.scrollTop = scrollRatio * (scrollState.scrollHeight - scrollState.clientHeight);
        };

        const handleThumbMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            isDragging.current = true;
            const startY = e.clientY;
            const el = (containerRef as React.RefObject<HTMLDivElement>).current;
            const startScrollTop = el?.scrollTop || 0;

            const onMouseMove = (moveEvent: MouseEvent) => {
                const el = (containerRef as React.RefObject<HTMLDivElement>).current;
                if (!el || !trackRef.current) return;
                const deltaY = moveEvent.clientY - startY;
                const trackHeight = trackRef.current.clientHeight;
                const scrollableHeight = scrollState.scrollHeight - scrollState.clientHeight;
                const scrollDelta = (deltaY / (trackHeight - thumbHeight)) * scrollableHeight;
                el.scrollTop = startScrollTop + scrollDelta;
            };

            const onMouseUp = () => {
                isDragging.current = false;
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };

        const showScrollbar = scrollState.scrollHeight > scrollState.clientHeight;

        return (
            <div className={cn("flex h-full", className)}>
                <div
                    className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-hide"
                    ref={containerRef as React.RefObject<HTMLDivElement>}
                    tabIndex={tabIndex}
                    onKeyDown={onKeyDown}
                >
                    {children}
                </div>
                {/* Custom scrollbar track */}
                <div
                    ref={trackRef}
                    className="w-3 bg-muted border-l border-border flex-shrink-0 relative cursor-pointer"
                    onMouseDown={handleTrackMouseDown}
                >
                    {showScrollbar && (
                        <div
                            className="absolute left-0 right-0 bg-foreground/30 hover:bg-foreground/50 rounded-full mx-0.5 cursor-grab active:cursor-grabbing transition-colors"
                            style={{
                                height: thumbHeight,
                                top: thumbTop,
                            }}
                            onMouseDown={handleThumbMouseDown}
                        />
                    )}
                </div>
            </div>
        );
    }
);

CustomScrollbar.displayName = "CustomScrollbar";
