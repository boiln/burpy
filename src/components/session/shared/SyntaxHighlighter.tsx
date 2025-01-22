"use client";

import React, { useEffect, useState } from "react";

import { useInView } from "react-intersection-observer";

interface SyntaxHighlighterProps {
    language: string;
    content: string;
    wrap: boolean;
    type: "request" | "response";
    prettify?: boolean;
}

const isValidJson = (str: string): boolean => {
    if (!str.trim()) return false;
    try {
        const trimmed = str.trim();
        if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false;
        JSON.parse(trimmed);
        return true;
    } catch {
        return false;
    }
};

export function SyntaxHighlighter({
    language,
    content,
    wrap,
    type,
    prettify = false,
}: SyntaxHighlighterProps) {
    const [processedCode, setProcessedCode] = useState(content);
    const [isProcessing, setIsProcessing] = useState(true);
    const [effectiveLanguage, setEffectiveLanguage] = useState(language);
    const { ref } = useInView({
        triggerOnce: true,
        threshold: 0,
    });

    useEffect(() => {
        const processCode = async () => {
            setIsProcessing(true);
            let formattedContent = content;
            let currentLanguage = language;

            // Auto-detect JSON even if language is text/plain
            if (isValidJson(content)) {
                currentLanguage = "json";
            }
            setEffectiveLanguage(currentLanguage);

            // Format the content if needed
            if (prettify) {
                try {
                    if (currentLanguage === "json") {
                        const trimmed = content.trim();
                        try {
                            const parsed = JSON.parse(trimmed);
                            formattedContent = JSON.stringify(parsed, null, 2);
                        } catch {
                            // If parsing the whole content fails, try line by line
                            const lines = content.split("\n");
                            const formattedLines = lines.map((line) => {
                                const lineTrimmed = line.trim();
                                if (isValidJson(lineTrimmed)) {
                                    try {
                                        const parsed = JSON.parse(lineTrimmed);
                                        return JSON.stringify(parsed, null, 2);
                                    } catch {
                                        return line;
                                    }
                                }
                                return line;
                            });
                            formattedContent = formattedLines.join("\n");
                        }
                    } else if (currentLanguage === "html") {
                        formattedContent = content
                            .replace(/></g, ">\n<")
                            .replace(/\s+</g, "\n<")
                            .replace(/>\s+/g, ">\n");
                    } else if (currentLanguage === "xml") {
                        formattedContent = content
                            .replace(/></g, ">\n<")
                            .replace(/\s+</g, "\n<")
                            .replace(/>\s+/g, ">\n");
                    }
                } catch (e) {
                    console.error(`Failed to format ${currentLanguage} content:`, e);
                    formattedContent = content;
                }
            }

            // Highlight the formatted content
            try {
                const Prism = (await import("@/lib/prism")).default;
                const targetLanguage = Prism.languages[currentLanguage] || Prism.languages.text;

                // Ensure we have a valid language for highlighting
                if (targetLanguage) {
                    const highlighted = Prism.highlight(
                        formattedContent,
                        targetLanguage,
                        currentLanguage
                    );
                    setProcessedCode(highlighted);
                } else {
                    // Fallback to plain text if language not supported
                    setProcessedCode(formattedContent);
                }
            } catch (e) {
                console.error("Failed to highlight content:", e);
                setProcessedCode(formattedContent);
            }

            setIsProcessing(false);
        };

        processCode();
    }, [content, language, prettify]);

    const sharedStyles = {
        background: "none",
        fontSize: "11px",
        lineHeight: "1.4",
        whiteSpace: wrap ? "pre-wrap" : "pre",
        wordBreak: wrap ? "break-word" : "normal",
        overflow: "auto",
        fontFamily: "inherit",
        width: "100%",
        margin: 0,
        padding: 0,
    } as const;

    if (isProcessing) {
        return (
            <pre className="animate-pulse" style={sharedStyles}>
                <code>{content}</code>
            </pre>
        );
    }

    return (
        <pre ref={ref} className={`language-${effectiveLanguage}`} style={sharedStyles}>
            <code
                className={`language-${effectiveLanguage}`}
                style={{
                    whiteSpace: wrap ? "pre-wrap" : "pre",
                    wordBreak: wrap ? "break-word" : "normal",
                }}
                dangerouslySetInnerHTML={{
                    __html: processedCode,
                }}
            />
        </pre>
    );
}
