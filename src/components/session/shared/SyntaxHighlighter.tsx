"use client";

import React, { useEffect, useMemo, useState } from "react";

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

    useEffect(() => {
        // Import Prism dynamically on the client side
        import("~/lib/prism").then((Prism) => {
            const highlighted = Prism.default.highlight(
                content,
                Prism.default.languages[language],
                language
            );
            setHighlightedCode(highlighted);
        });
    }, [content, language]);

    return (
        <pre
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
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
        </pre>
    );
}
