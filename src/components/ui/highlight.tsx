"use client";

import { memo, useMemo } from "react";

interface HighlightProps {
    text: string;
    searchTerm: string;
    className?: string;
    highlightClassName?: string;
}

/**
 * Fast text highlighting component.
 * Uses string splitting instead of regex for better performance.
 * Memoized to prevent unnecessary re-renders.
 */
export const Highlight = memo(function Highlight({
    text,
    searchTerm,
    className = "",
    highlightClassName = "bg-yellow-500/40 text-foreground rounded-sm",
}: HighlightProps) {
    const parts = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) {
            return [{ text, highlight: false, start: 0 }];
        }

        const lowerText = text.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();
        const result: { text: string; highlight: boolean; start: number }[] = [];

        let lastIndex = 0;
        let index = lowerText.indexOf(lowerSearch);

        while (index !== -1) {
            // Add text before match
            if (index > lastIndex) {
                result.push({
                    text: text.slice(lastIndex, index),
                    highlight: false,
                    start: lastIndex,
                });
            }

            // Add matched text
            result.push({
                text: text.slice(index, index + searchTerm.length),
                highlight: true,
                start: index,
            });

            lastIndex = index + searchTerm.length;
            index = lowerText.indexOf(lowerSearch, lastIndex);
        }

        // Add remaining text
        if (lastIndex < text.length) {
            result.push({
                text: text.slice(lastIndex),
                highlight: false,
                start: lastIndex,
            });
        }

        return result.length > 0 ? result : [{ text, highlight: false, start: 0 }];
    }, [text, searchTerm]);

    if (!searchTerm || searchTerm.length < 2) {
        return <span className={className}>{text}</span>;
    }

    return (
        <span className={className}>
            {parts.map((part) =>
                part.highlight ? (
                    <mark key={`h-${part.start}`} className={highlightClassName}>
                        {part.text}
                    </mark>
                ) : (
                    <span key={`n-${part.start}`}>{part.text}</span>
                )
            )}
        </span>
    );
});
