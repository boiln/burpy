"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

interface SyntaxHighlighterProps {
    language: string;
    content: string;
    wrap: boolean;
    type: "request" | "response";
}

export function SyntaxHighlighter({
    language,
    content,
    wrap,
    type,
}: SyntaxHighlighterProps) {
    const [highlightedCode, setHighlightedCode] = useState(content);
    const { ref } = useInView({
        triggerOnce: true,
        threshold: 0,
    });

    useEffect(() => {
        const highlightCode = async () => {
            const Prism = (await import("~/lib/prism")).default;
            const highlighted = Prism.highlight(
                content,
                Prism.languages[language],
                language
            );
            setHighlightedCode(highlighted);
        };

        highlightCode();
    }, [content, language]);

    return (
        <pre
            ref={ref}
            className={`language-${language}`}
            style={{
                background: "none",
                fontSize: "13px",
                whiteSpace: wrap ? "pre-wrap" : "pre",
                wordBreak: wrap ? "break-word" : "normal",
                overflowX: "auto",
                fontFamily: "inherit",
                width: "100%",
                margin: 0,
                padding: 0,
            }}
        >
            <code
                className={`language-${language}`}
                style={{
                    whiteSpace: wrap ? "pre-wrap" : "pre",
                    wordBreak: wrap ? "break-word" : "normal",
                }}
                dangerouslySetInnerHTML={{
                    __html: highlightedCode,
                }}
            />
        </pre>
    );
}
