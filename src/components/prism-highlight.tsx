"use client";

import { useEffect, useState } from "react";

import Prism from "@/lib/prism";
import { useSession } from "@/lib/session-context";

interface PrismHighlightProps {
    code: string;
    language: string;
}

/**
 * Highlights search term in already-highlighted HTML.
 * Carefully avoids breaking HTML tags.
 */
const highlightSearchTerm = (html: string, searchTerm: string): string => {
    if (!searchTerm || searchTerm.length < 2) return html;

    // We need to only highlight text content, not HTML tags or attributes
    // Split by HTML tags, highlight text parts, rejoin
    const parts = html.split(/(<[^>]+>)/g);

    return parts
        .map((part) => {
            // If it's an HTML tag, don't modify it
            if (part.startsWith("<")) return part;

            // Otherwise, highlight the search term in text content
            const regex = new RegExp(
                `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                "gi"
            );
            return part.replace(
                regex,
                '<mark class="bg-yellow-500/50 text-inherit rounded-sm">$1</mark>'
            );
        })
        .join("");
};

export const PrismHighlight = (props: PrismHighlightProps) => {
    const { code, language } = props;
    const { searchTerm } = useSession();
    const [highlighted, setHighlighted] = useState(code);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const grammar = Prism.languages[language] || Prism.languages.text;
        let html = Prism.highlight(code, grammar, language);

        // Apply search highlighting on top of syntax highlighting
        if (searchTerm && searchTerm.length >= 2) {
            html = highlightSearchTerm(html, searchTerm);
        }

        setHighlighted(html);
    }, [code, language, searchTerm]);

    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
};
