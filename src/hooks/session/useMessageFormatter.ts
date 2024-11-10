interface FormatOptions {
    wrap: boolean;
    prettify: boolean;
}

export function useMessageFormatter() {
    const getLanguageFromContentType = (headers: string): string => {
        const contentTypeMatch = headers.match(/content-type:\s*([^\r\n]+)/i);
        if (!contentTypeMatch) return "text";

        const contentType = contentTypeMatch[1].toLowerCase();

        // Map content types to Prism language identifiers
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

    const formatContent = (content: string, language: string): string => {
        if (!content.trim()) return content;

        try {
            switch (language) {
                case "json":
                    return JSON.stringify(JSON.parse(content), null, 4);
                case "html":
                    // Use html-prettify or similar library
                    return content;
                case "xml":
                    // Use xml-formatter or similar library
                    return content;
                default:
                    return content;
            }
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
