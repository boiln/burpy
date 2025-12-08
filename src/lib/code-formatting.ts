import prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import htmlPlugin from "prettier/plugins/html";
import cssPlugin from "prettier/plugins/postcss";

/**
 * Map MIME types to format identifiers
 */
const mimeToFormat: Record<string, string> = {
    "application/json": "json",
    "text/json": "json",
    "application/ld+json": "json",
    "application/hal+json": "json",
    "application/vnd.api+json": "json",
    "text/html": "html",
    "application/xhtml+xml": "html",
    "text/xml": "xml",
    "application/xml": "xml",
    "application/rss+xml": "xml",
    "application/atom+xml": "xml",
    "text/javascript": "javascript",
    "application/javascript": "javascript",
    "application/x-javascript": "javascript",
    "text/css": "css",
};

/**
 * Detects the format of a payload string, optionally using mimeType hint
 */
export const detectPayloadFormat = (str: string, mimeType?: string): string => {
    // 1. Trust mimeType if provided and recognized
    if (mimeType) {
        const baseMime = mimeType.split(";")[0].trim().toLowerCase();
        if (mimeToFormat[baseMime]) {
            return mimeToFormat[baseMime];
        }
        // Handle common patterns like "application/something+json"
        if (baseMime.endsWith("+json")) return "json";
        if (baseMime.endsWith("+xml")) return "xml";
    }

    // 2. Fall back to content-based detection
    const trimmed = str.trim();
    if (!trimmed) return "text";

    try {
        JSON.parse(trimmed);
        return "json";
    } catch {
        // Check for HTML/XML
        if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
            return trimmed.toLowerCase().includes("<!doctype html") ||
                trimmed.toLowerCase().includes("<html")
                ? "html"
                : "xml";
        }

        const codeIndicators = ["{", ";", "function", "=>", "class", "import"];
        const isCodeLike = codeIndicators.some((indicator) => trimmed.includes(indicator));

        if (isCodeLike) return "javascript";
    }

    return "text";
};

/**
 * Extracts JSON from a line that may have a prefix (e.g., "0:{...}" or "data: {...}")
 * Returns the JSON portion if found, otherwise returns the original line
 */
const extractJsonFromLine = (line: string): string => {
    const trimmed = line.trim();
    if (!trimmed) return trimmed;

    const rscMatch = trimmed.match(/^\d+:(.+)$/);
    if (rscMatch) return rscMatch[1];

    const sseMatch = trimmed.match(/^data:\s*(.+)$/);
    if (sseMatch) return sseMatch[1];

    return trimmed;
};

/**
 * Attempts to format content as newline-delimited JSON (NDJSON)
 * Each line is formatted separately if it contains valid JSON
 */
const formatNdjson = async (str: string): Promise<string | null> => {
    const lines = str.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return null;

    const formattedLines: string[] = [];
    let hasFormattedAny = false;

    for (const line of lines) {
        const jsonPart = extractJsonFromLine(line);
        const prefix = line.trim().slice(0, line.trim().length - jsonPart.length);

        try {
            JSON.parse(jsonPart);

            const formatted = await prettier.format(jsonPart, {
                parser: "json",
                plugins: [babelPlugin, estreePlugin],
                tabWidth: 4,
                printWidth: 100,
            });

            formattedLines.push(prefix + formatted.trim());
            hasFormattedAny = true;
        } catch {
            formattedLines.push(line.trim());
        }
    }

    return hasFormattedAny ? formattedLines.join("\n\n") : null;
};

/**
 * Formats code string using Prettier based on detected format
 */
export const formatCode = async (str: string, format: string): Promise<string> => {
    try {
        const parserMap: Record<string, string> = {
            json: "json",
            javascript: "babel",
            html: "html",
            xml: "html",
            css: "css",
        };

        const parser = parserMap[format];
        if (!parser) {
            const ndjsonResult = await formatNdjson(str);
            if (ndjsonResult) return ndjsonResult;
            return str;
        }

        const formatted = await prettier.format(str, {
            parser,
            plugins: [babelPlugin, estreePlugin, htmlPlugin, cssPlugin],
            tabWidth: 4,
            printWidth: 100,
        });

        return formatted.trim();
    } catch (e) {
        const ndjsonResult = await formatNdjson(str);
        if (ndjsonResult) return ndjsonResult;

        console.warn("Formatting failed:", e);
        return str;
    }
};

/**
 * Parses HTTP message value into structured parts
 */
export const parseHttpMessage = (value: string) => {
    const parts = value.split("\r\n\r\n");
    const headerSection = parts[0];
    const body = parts.slice(1).join("\r\n\r\n");

    const headerLines = headerSection.split("\r\n");
    const requestLine = headerLines[0];
    const headers = headerLines.slice(1).join("\r\n");

    // Strip domain from request line for cleaner display
    const cleanedRequestLine = requestLine.replace(
        /(GET|POST|PUT|DELETE|PATCH) (https?:\/\/[^\/]+)(\S+)/,
        (_, method, _domain, path) => `${method} ${path}`
    );

    return {
        requestLine: cleanedRequestLine,
        headers,
        body,
    };
};

/**
 * Processes body content with optional beautification
 */
export const processBody = async (
    body: string,
    beautify: boolean,
    mimeType?: string
): Promise<string> => {
    if (!body) return "";

    if (beautify) {
        const format = detectPayloadFormat(body, mimeType);
        return formatCode(body, format);
    }

    return body;
};
