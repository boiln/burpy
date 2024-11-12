interface FormatOptions {
    wrap: boolean;
    prettify: boolean;
}

export function useMessageFormatter() {
    const getLanguageFromContentType = (headers: string): string => {
        const contentTypeMatch = headers.match(/content-type:\s*([^\r\n]+)/i);
        if (!contentTypeMatch) return "text";

        const contentType = contentTypeMatch[1].toLowerCase();

        if (contentType.includes("x-component")) return "json";
        if (contentType.includes("application/json")) return "json";
        if (contentType.includes("text/html")) return "html";
        if (
            contentType.includes("text/xml") ||
            contentType.includes("application/xml")
        )
            return "xml";
        if (
            contentType.includes("text/javascript") ||
            contentType.includes("application/javascript")
        )
            return "javascript";
        if (contentType.includes("text/css")) return "css";
        if (contentType.includes("text/markdown")) return "markdown";
        if (contentType.includes("text/yaml")) return "yaml";

        return "text";
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
                // Split content into lines and process each line
                const lines = content.split("\n");
                const formattedLines = lines.map((line) => {
                    // Check if line matches Next.js format (starts with number:)
                    if (line.match(/^\d+:/)) {
                        return formatNextJsLine(line);
                    }
                    // Regular JSON formatting
                    try {
                        const parsed = JSON.parse(line);
                        return JSON.stringify(parsed, null, 4);
                    } catch {
                        return line;
                    }
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
