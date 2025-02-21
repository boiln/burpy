"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WrapText } from "lucide-react";
import { cn } from "@/lib/utils";
import Prism from "@/lib/prism";

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

const formatCode = async (str: string, format: string): Promise<string> => {
    try {
        // handle multiple json objects in http post params
        if (format === "json") {
            try {
                const parsed = JSON.parse(str);
                return JSON.stringify(parsed, null, 4);
            } catch (e) {
                if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
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

        const lines = str
            .split(/\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        // add spacing for structured data
        if (lines.some((line) => line.includes(":") || line.includes("=") || line.includes(";"))) {
            return lines.join("\n");
        }

        return lines.join("\n");
    } catch (e) {
        console.warn("Formatting failed:", e);
        return str;
    }
};

const detectPayloadFormat = (str: string): string => {
    const trimmed = str.trim();
    if (!trimmed) return "text";

    try {
        JSON.parse(trimmed);
        return "json";
    } catch (e) {
        // use js highlight for code-like content
        if (
            trimmed.includes("{") ||
            trimmed.includes(";") ||
            trimmed.includes("function") ||
            trimmed.includes("=>") ||
            trimmed.includes("class") ||
            trimmed.includes("import")
        ) {
            return "javascript";
        }
    }

    return "text";
};

const splitPayloads = (body: string): string[] => {
    const payloads: string[] = [];
    let currentPayload = "";
    let inString = false;
    let inObject = 0;
    let inArray = 0;
    let lastChar = "";

    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        currentPayload += char;

        if (char === '"' && lastChar !== "\\") {
            inString = !inString;
        }

        if (!inString) {
            if (char === "{") inObject++;
            if (char === "}") inObject--;
            if (char === "[") inArray++;
            if (char === "]") inArray--;

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
            return `// payload truncated for perf\n${formatted.slice(0, 1000000)}...`;
        }
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
            const parts = value.split("\r\n\r\n");
            const headers = parts[0];
            const body = parts.slice(1).join("\r\n\r\n");

            const headerLines = headers.split("\r\n");
            const firstLine = headerLines[0];

            const modifiedFirstLine = firstLine.replace(
                /(GET|POST|PUT|DELETE|PATCH) (https?:\/\/[^\/]+)(\S+)/,
                (_, method, domain, path) => {
                    return `${method} ${path}`;
                }
            );

            const otherHeaders = headerLines.slice(1);

            let processedBody = "";
            if (body) {
                const format = detectPayloadFormat(body);

                if (isBeautified) {
                    const formatted = await formatCode(body, format);
                    processedBody = formatted;
                } else {
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
