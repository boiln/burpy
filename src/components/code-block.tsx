"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WrapText } from "lucide-react";
import { cn } from "@/lib/utils";
import Prism from "@/lib/prism";

// Client-side only component that handles Prism highlighting
function PrismHighlight({ code, language }: { code: string; language: string }) {
    const [highlighted, setHighlighted] = useState(code);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setHighlighted(
                Prism.highlight(code, Prism.languages[language] || Prism.languages.text, language)
            );
        }
    }, [code, language]);

    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

const extractPath = (url: string): string => {
    try {
        // Check if it's a full URL
        if (url.includes("://")) {
            const urlObj = new URL(url);
            return `${urlObj.pathname}${urlObj.search}`;
        }
        // If it's already just a path, return as is
        return url;
    } catch (e) {
        return url;
    }
};

const formatCode = async (str: string, format: string): Promise<string> => {
    try {
        // Handle multiple JSON objects in the payload (common in HTTP POST params)
        if (format === "json") {
            try {
                // Try to parse as a single JSON first
                const parsed = JSON.parse(str);
                return JSON.stringify(parsed, null, 4);
            } catch (e) {
                // If single JSON parse fails, try handling multiple JSON objects
                if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
                    // Split by newlines and try to parse each line
                    const lines = str
                        .split(/\n/)
                        .map((line) => line.trim())
                        .filter(Boolean);
                    const formattedLines = lines.map((line) => {
                        try {
                            const parsed = JSON.parse(line);
                            return JSON.stringify(parsed, null, 4);
                        } catch (e) {
                            return line;
                        }
                    });
                    return formattedLines.join("\n\n");
                }
            }
        }

        // For everything else, try basic formatting
        const lines = str
            .split(/\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        // If it looks like structured data, add some spacing
        if (lines.some((line) => line.includes(":") || line.includes("=") || line.includes(";"))) {
            return lines.join("\n");
        }

        // For everything else, return as is with consistent line breaks
        return lines.join("\n");
    } catch (e) {
        console.warn("Formatting failed:", e);
        return str;
    }
};

const detectPayloadFormat = (str: string): string => {
    // Remove leading/trailing whitespace
    const trimmed = str.trim();
    if (!trimmed) return "text";

    try {
        // Try parsing as JSON first
        JSON.parse(trimmed);
        return "json";
    } catch (e) {
        // Not JSON, try to detect if it's code-like
        if (
            trimmed.includes("{") ||
            trimmed.includes(";") ||
            trimmed.includes("function") ||
            trimmed.includes("=>") ||
            trimmed.includes("class") ||
            trimmed.includes("import")
        ) {
            return "javascript"; // Use javascript highlighting for code-like content
        }
    }

    return "text";
};

const splitPayloads = (body: string): string[] => {
    // More robust payload splitting
    const payloads: string[] = [];
    let currentPayload = "";
    let inString = false;
    let inObject = 0;
    let inArray = 0;
    let lastChar = "";

    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        currentPayload += char;

        // Handle string boundaries
        if (char === '"' && lastChar !== "\\") {
            inString = !inString;
        }

        if (!inString) {
            // Handle object/array nesting
            if (char === "{") inObject++;
            if (char === "}") inObject--;
            if (char === "[") inArray++;
            if (char === "]") inArray--;

            // If we're not in any structure, check for payload boundaries
            if (inObject === 0 && inArray === 0) {
                if (
                    char === "\n" ||
                    (char === "}" && body[i + 1] === "\n") ||
                    (char === "}" && i === body.length - 1) ||
                    (char === "]" && body[i + 1] === "\n") ||
                    (char === "]" && i === body.length - 1)
                ) {
                    if (currentPayload.trim()) {
                        payloads.push(currentPayload.trim());
                        currentPayload = "";
                    }
                }
            }
        }

        lastChar = char;
    }

    // Add any remaining payload
    if (currentPayload.trim()) {
        payloads.push(currentPayload.trim());
    }

    return payloads;
};

const highlightPayload = async (payload: string): Promise<string> => {
    const format = detectPayloadFormat(payload);
    if (!format) return payload;

    try {
        const formatted = await formatCode(payload, format);
        if (formatted.length > 1000000) {
            return `// Large payload truncated for performance\n${formatted.slice(0, 1000000)}...`;
        }
        // Use PrismHighlight component's logic directly
        if (typeof window !== "undefined") {
            return Prism.highlight(
                formatted,
                Prism.languages[format] || Prism.languages.text,
                format
            );
        }
        return formatted;
    } catch (e) {
        return payload;
    }
};

export function CodeBlock({ language, value }: { language: string; value: string }) {
    const [isWrapped, setIsWrapped] = useState(true);
    const [isBeautified, setIsBeautified] = useState(true);
    const [formattedContent, setFormattedContent] = useState<{
        firstLine: string;
        headers: string;
        body: string;
    }>({ firstLine: "", headers: "", body: "" });

    useEffect(() => {
        const updateContent = async () => {
            // Split the content into headers and body
            const parts = value.split("\r\n\r\n");
            const headers = parts[0];
            const body = parts.slice(1).join("\r\n\r\n");

            // Process headers to make them more compact
            const headerLines = headers.split("\r\n");
            const firstLine = headerLines[0];

            // Extract just the path from the first line if it contains a URL
            const modifiedFirstLine = firstLine.replace(
                /(GET|POST|PUT|DELETE|PATCH) (https?:\/\/[^\/]+)(\S+)/,
                (_, method, domain, path) => {
                    return `${method} ${path}`;
                }
            );

            const otherHeaders = headerLines.slice(1);

            // Process body if present
            let processedBody = "";
            if (body) {
                const format = detectPayloadFormat(body);

                if (isBeautified) {
                    // If beautification is enabled, format the entire body
                    const formatted = await formatCode(body, format);
                    processedBody = formatted;
                } else {
                    // For when beautification is disabled
                    const payloads = splitPayloads(body);
                    const formattedPayloads = await Promise.all(
                        payloads.map(async (payload) => {
                            const payloadFormat = detectPayloadFormat(payload);
                            return isBeautified
                                ? await formatCode(payload, payloadFormat)
                                : payload;
                        })
                    );
                    processedBody = formattedPayloads.join("\n");
                }
            }

            setFormattedContent({
                firstLine: modifiedFirstLine,
                headers: otherHeaders.join("\r\n"),
                body: processedBody,
            });
        };

        updateContent();
    }, [value, isBeautified]);

    return (
        <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-1 border-b border-border/40 bg-background/95 px-2 py-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsWrapped(!isWrapped)}
                    title="Text wrap"
                >
                    <WrapText className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsBeautified(!isBeautified)}
                    title="Beautify"
                >
                    <div className="flex items-center text-[11px] font-medium">{"{ }"}</div>
                </Button>
            </div>
            <pre
                className={cn(
                    "flex-1 overflow-auto rounded-md !bg-background/95 p-3 text-sm leading-normal",
                    isWrapped && "whitespace-pre-wrap break-words"
                )}
                tabIndex={0}
                style={{
                    wordBreak: isWrapped ? "break-word" : "normal",
                    whiteSpace: isWrapped ? "pre-wrap" : "pre",
                }}
            >
                <code
                    className={cn(
                        `language-${language} block`,
                        isWrapped && "whitespace-pre-wrap break-words"
                    )}
                    style={{
                        wordBreak: isWrapped ? "break-word" : "normal",
                        whiteSpace: isWrapped ? "pre-wrap" : "pre",
                    }}
                >
                    <PrismHighlight code={formattedContent.firstLine} language={language} />
                    {formattedContent.headers && (
                        <>
                            <br />
                            <PrismHighlight code={formattedContent.headers} language={language} />
                        </>
                    )}
                    {formattedContent.body && (
                        <>
                            <br />
                            <PrismHighlight
                                code={formattedContent.body}
                                language={detectPayloadFormat(formattedContent.body)}
                            />
                        </>
                    )}
                </code>
            </pre>
        </div>
    );
}
