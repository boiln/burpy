/**
 * Code formatting and detection utilities for HTTP payloads
 */

/**
 * Detects the format of a payload string (json, javascript, or text)
 */
export const detectPayloadFormat = (str: string): string => {
    const trimmed = str.trim();
    if (!trimmed) return "text";

    try {
        JSON.parse(trimmed);
        return "json";
    } catch {
        const codeIndicators = ["{", ";", "function", "=>", "class", "import"];
        const isCodeLike = codeIndicators.some((indicator) => trimmed.includes(indicator));

        if (isCodeLike) return "javascript";
    }

    return "text";
};

/**
 * Formats code string based on detected format
 */
export const formatCode = async (str: string, format: string): Promise<string> => {
    try {
        if (format === "json") {
            return formatJson(str);
        }

        return formatLines(str);
    } catch (e) {
        console.warn("Formatting failed:", e);
        return str;
    }
};

/**
 * Formats JSON strings, handling both single objects and line-separated objects
 */
const formatJson = (str: string): string => {
    try {
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed, null, 4);
    } catch {
        const trimmed = str.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return str;
        }

        const lines = str
            .split(/\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        const formattedLines = lines.map((line) => {
            try {
                const parsed = JSON.parse(line);
                return JSON.stringify(parsed, null, 4);
            } catch {
                return line;
            }
        });

        return formattedLines.join("\n\n");
    }
};

/**
 * Formats lines of text, preserving structure
 */
const formatLines = (str: string): string => {
    const lines = str
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    return lines.join("\n");
};

/**
 * Splits a body string into separate payload chunks
 * Handles nested JSON objects and arrays
 */
export const splitPayloads = (body: string): string[] => {
    const payloads: string[] = [];
    let currentPayload = "";
    let inString = false;
    let objectDepth = 0;
    let arrayDepth = 0;
    let lastChar = "";

    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        currentPayload += char;

        // Track string boundaries
        if (char === '"' && lastChar !== "\\") {
            inString = !inString;
        }

        // Track nesting depth when not in string
        if (!inString) {
            if (char === "{") objectDepth++;
            if (char === "}") objectDepth--;
            if (char === "[") arrayDepth++;
            if (char === "]") arrayDepth--;

            const isBalanced = objectDepth === 0 && arrayDepth === 0;
            const isPayloadEnd = isEndOfPayload(char, body, i);

            if (isBalanced && isPayloadEnd && currentPayload.trim()) {
                payloads.push(currentPayload.trim());
                currentPayload = "";
            }
        }

        lastChar = char;
    }

    // Don't forget remaining content
    if (currentPayload.trim()) {
        payloads.push(currentPayload.trim());
    }

    return payloads;
};

/**
 * Checks if current position is the end of a payload
 */
const isEndOfPayload = (char: string, body: string, index: number): boolean => {
    const nextChar = body[index + 1];
    const isLastChar = index === body.length - 1;

    return (
        char === "\n" ||
        (char === "}" && nextChar === "\n") ||
        (char === "}" && isLastChar) ||
        (char === "]" && nextChar === "\n") ||
        (char === "]" && isLastChar)
    );
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
export const processBody = async (body: string, beautify: boolean): Promise<string> => {
    if (!body) return "";

    const format = detectPayloadFormat(body);

    if (beautify) {
        return formatCode(body, format);
    }

    const payloads = splitPayloads(body);
    return payloads.join("\n");
};
