interface FormatOptions {
    wrap: boolean;
    prettify: boolean;
}

export function useMessageFormatter() {
    const getLanguageFromContentType = (headers: string): string => {
        const contentTypeMatch = headers.match(/content-type:\s*([^\r\n]+)/i);
        if (!contentTypeMatch) {
            // Try to detect JSON even without content-type header
            return detectJsonContent(headers) ? "json" : "text";
        }

        const contentType = contentTypeMatch[1].toLowerCase();

        if (
            contentType.includes("json") ||
            contentType.includes("x-json") ||
            contentType.includes("x-javascript")
        )
            return "json";
        if (contentType.includes("text/html")) return "html";
        if (contentType.includes("xml")) return "xml";
        if (contentType.includes("javascript")) return "javascript";
        if (contentType.includes("text/css")) return "css";
        if (contentType.includes("text/markdown")) return "markdown";
        if (contentType.includes("text/yaml")) return "yaml";

        // Try to detect JSON even with different content-type
        return detectJsonContent(headers) ? "json" : "text";
    };

    const detectJsonContent = (content: string): boolean => {
        try {
            // Check if content starts with { or [ after trimming whitespace
            const trimmed = content.trim();
            if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
                return false;
            }
            JSON.parse(trimmed);
            return true;
        } catch {
            return false;
        }
    };

    const formatNextJsLine = (line: string): string => {
        try {
            // Match the pattern "number:JSON" and extract just the JSON part
            const match = line.match(/^(\d+):(.+)$/);
            if (match) {
                const [_, number, jsonContent] = match;
                const parsed = JSON.parse(jsonContent);
                // Format with 4 spaces indentation
                const formatted = JSON.stringify(parsed, null, 4);
                // Preserve the line number prefix
                return `${number}:${formatted}`;
            }
            return line;
        } catch (e) {
            return line;
        }
    };

    const formatContent = (content: string, language: string): string => {
        if (!content.trim()) return content;

        try {
            if (language === "json") {
                // Split content into lines
                const lines = content.split("\n");
                const formattedLines = lines.map((line) => {
                    const trimmed = line.trim();
                    // Check for JSON-like content
                    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            return JSON.stringify(parsed, null, 4);
                        } catch {
                            // If parsing fails, try to find JSON within the line
                            const jsonMatch = line.match(/({[\s\S]*}|\[[\s\S]*\])/);
                            if (jsonMatch) {
                                try {
                                    const parsed = JSON.parse(jsonMatch[0]);
                                    return JSON.stringify(parsed, null, 4);
                                } catch {
                                    return line;
                                }
                            }
                        }
                    }
                    return line;
                });
                return formattedLines.join("\n");
            }
            return content;
        } catch (e) {
            console.error(`Failed to format ${language} content:`, e);
            return content;
        }
    };

    const formatMessage = (content: string, options: FormatOptions) => {
        const { wrap, prettify } = options;

        const parts = content.split(/\r?\n\r?\n/);
        const headers = parts[0];
        const rawBody = parts.slice(1).join("\n\n").trim();

        let processedBody = rawBody;
        const language = getLanguageFromContentType(headers);

        if (prettify && rawBody) {
            processedBody = formatContent(rawBody, language);
        }

        return {
            headers,
            body: processedBody,
            language,
        };
    };

    return { formatMessage };
}
