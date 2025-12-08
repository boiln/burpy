"use client";

import { useEffect, useState } from "react";

import { WrapText } from "lucide-react";

import { PrismHighlight } from "@/components/prism-highlight";
import { Button } from "@/components/ui/button";
import { detectPayloadFormat, parseHttpMessage, processBody } from "@/lib/code-formatting";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
    language: string;
    value: string;
    mimeType?: string;
}

interface FormattedContent {
    requestLine: string;
    headers: string;
    body: string;
}

export const CodeBlock = (props: CodeBlockProps) => {
    const { language, value, mimeType } = props;

    const [isWrapped, setIsWrapped] = useState(true);
    const [isBeautified, setIsBeautified] = useState(true);
    const [content, setContent] = useState<FormattedContent>({
        requestLine: "",
        headers: "",
        body: "",
    });

    useEffect(() => {
        const update = async () => {
            const { requestLine, headers, body } = parseHttpMessage(value);
            const processedBody = await processBody(body, isBeautified, mimeType);

            setContent({
                requestLine,
                headers,
                body: processedBody,
            });
        };

        update();
    }, [value, isBeautified, mimeType]);

    const handleSelectAll = (e: React.KeyboardEvent<HTMLPreElement>) => {
        const isSelectAll = (e.ctrlKey || e.metaKey) && e.key === "a";
        if (!isSelectAll) return;

        e.preventDefault();

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(e.currentTarget);
        selection?.removeAllRanges();
        selection?.addRange(range);
    };

    const wrapStyles = {
        wordBreak: isWrapped ? "break-word" : "normal",
        whiteSpace: isWrapped ? "pre-wrap" : "pre",
    } as const;

    return (
        <div className="relative flex h-full flex-col">
            <Toolbar
                isWrapped={isWrapped}
                isBeautified={isBeautified}
                onToggleWrap={() => setIsWrapped(!isWrapped)}
                onToggleBeautify={() => setIsBeautified(!isBeautified)}
            />

            <pre
                className={cn(
                    "flex-1 rounded-md !bg-background/95 p-3 text-sm leading-normal",
                    isWrapped && "whitespace-pre-wrap break-words"
                )}
                tabIndex={0}
                onKeyDown={handleSelectAll}
                style={wrapStyles}
            >
                <code
                    className={cn(
                        `language-${language} block`,
                        isWrapped && "whitespace-pre-wrap break-words"
                    )}
                    style={wrapStyles}
                >
                    <PrismHighlight code={content.requestLine} language={language} />

                    <Divider />

                    {content.headers && (
                        <PrismHighlight code={content.headers} language={language} />
                    )}

                    {content.body && (
                        <>
                            <Divider />
                            <PrismHighlight
                                code={content.body}
                                language={detectPayloadFormat(content.body, mimeType)}
                            />
                        </>
                    )}
                </code>
            </pre>
        </div>
    );
};

interface ToolbarProps {
    isWrapped: boolean;
    isBeautified: boolean;
    onToggleWrap: () => void;
    onToggleBeautify: () => void;
}

const Toolbar = (props: ToolbarProps) => {
    const { isWrapped, isBeautified, onToggleWrap, onToggleBeautify } = props;

    return (
        <div className="flex items-center gap-1 border-b border-border/40 bg-background/95 px-2 py-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleWrap}
                title="Text wrap"
            >
                <WrapText className="h-3.5 w-3.5" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleBeautify}
                title="Beautify"
            >
                <div className="flex items-center text-[11px]">{"{ }"}</div>
            </Button>
        </div>
    );
};

const Divider = () => <div className="my-2 border-b border-border/40" />;
