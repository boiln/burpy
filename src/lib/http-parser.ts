import type { BurpEntry } from "@/types/burp";
import type { HarEntry } from "@/types/har";

// Base interface for all HTTP message parsers
export interface HttpParser<T> {
    parseRequest(raw: T): string;
    parseResponse(raw: T): string;
    validate(raw: unknown): raw is T;
    parse(raw: T, mimeType?: string): { request: string; response: string };
}

// Burp parser

export class BurpParser implements HttpParser<BurpEntry> {
    private decodeBase64(str: string): string {
        // If string is empty or not a string, return empty string
        if (!str || typeof str !== "string") {
            return "";
        }

        // Check if the string looks like base64
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(str)) {
            return str; // Return original string if not base64
        }

        try {
            // Try to decode, but handle padding issues
            let paddedStr = str;
            while (paddedStr.length % 4 !== 0) {
                paddedStr += "=";
            }
            return atob(paddedStr);
        } catch (error) {
            console.warn("Base64 decoding failed, returning original string:", error);
            return str; // Return original string if decoding fails
        }
    }

    parseRequest(entry: BurpEntry): string {
        // If we have a raw request body, decode and use it directly
        if (entry.request.body) {
            const decodedBody = this.decodeBase64(entry.request.body);
            if (decodedBody && decodedBody.includes("\r\n")) {
                return decodedBody + "\r\n";
            }
        }

        // Otherwise construct the request from individual parts
        const headers = entry.request.headers
            .map((header) => this.decodeBase64(header))
            .join("\r\n");
        const protocol = entry.request.protocol || "HTTP/1.1";
        const url = entry.request.url;
        const requestLine = `${entry.request.method} ${url} ${protocol}`;
        const body = this.decodeBase64(entry.request.body || "");

        return [requestLine, headers, "", body].join("\r\n") + "\r\n";
    }

    parseResponse(entry: BurpEntry): string {
        if (!entry.response || entry.response.status === 0) {
            return "No response received\r\n";
        }

        const headers = entry.response.headers
            .map((header) => this.decodeBase64(header))
            .join("\r\n");
        const protocol = entry.request.protocol || "HTTP/1.1";
        const statusLine = `${protocol} ${entry.response.status} ${entry.response.statusText || ""}`;
        const body = this.decodeBase64(entry.response.body || "");

        return [statusLine, headers, "", body].join("\r\n") + "\r\n";
    }

    validate(raw: unknown): raw is BurpEntry {
        if (!raw || typeof raw !== "object") {
            return false;
        }

        const entry = raw as BurpEntry;

        // More specific Burp validation
        const hasValidRequest =
            entry.request &&
            typeof entry.request === "object" &&
            typeof entry.request.method === "string" &&
            typeof entry.request.url === "string" &&
            Array.isArray(entry.request.headers);

        const hasValidResponse =
            !entry.response ||
            (typeof entry.response === "object" &&
                typeof entry.response.status === "number" &&
                Array.isArray(entry.response.headers) &&
                typeof entry.response.body === "string");

        return Boolean(hasValidRequest && hasValidResponse);
    }

    parse(entry: BurpEntry): { request: string; response: string } {
        return {
            request: this.parseRequest(entry),
            response: this.parseResponse(entry),
        };
    }

    static parseXmlItem(raw: string): BurpEntry {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(raw, "text/xml");

            const getElementContent = (selector: string) =>
                doc.querySelector(selector)?.textContent || "";

            // Get the raw request and response
            const rawRequest = getElementContent("request");
            const rawResponse = getElementContent("response");
            const requestHeaders = getElementContent("requestheaders");
            const responseHeaders = getElementContent("responseheaders");

            // Parse status with a default of 0 for empty/invalid values
            const statusText = getElementContent("status");
            const status = statusText ? parseInt(statusText, 10) : 0;

            return {
                startTime: new Date().toISOString(),
                duration: 0,
                request: {
                    method: getElementContent("method"),
                    url: getElementContent("url"),
                    protocol: "HTTP/1.1",
                    headers: requestHeaders ? [requestHeaders] : [],
                    body: rawRequest || "",
                },
                response: {
                    status: isNaN(status) ? 0 : status, // Ensure we never return NaN
                    statusText: getElementContent("statustext") || "No response",
                    headers: responseHeaders ? [responseHeaders] : [],
                    body: rawResponse || "",
                    mimeType: getElementContent("mimetype") || "text/plain",
                    contentLength: parseInt(getElementContent("contentlength"), 10) || 0,
                },
            };
        } catch (error) {
            throw new Error(
                `Invalid Burp XML format: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

// HAR parser

export class HarParser implements HttpParser<HarEntry> {
    parseRequest(entry: HarEntry): string {
        const requestLine = `${entry.request.method} ${entry.request.url} ${entry.request.httpVersion}`;
        const headers = entry.request.headers.map((h) => `${h.name}: ${h.value}`).join("\r\n");
        const body = entry.request.postData?.text || "";

        return [requestLine, headers, "", body].join("\r\n") + "\r\n";
    }

    parseResponse(entry: HarEntry): string {
        if (!entry.response || entry.response.status === 0) {
            return "No response received\r\n";
        }

        // Construct the response parts
        const statusLine = `${entry.response.httpVersion} ${entry.response.statusText}`;
        const headers = entry.response.headers.map((h) => `${h.name}: ${h.value}`).join("\r\n");
        const body = entry.response.content?.text || "";

        return [statusLine, headers, "", body].join("\r\n") + "\r\n";
    }

    validate(raw: unknown): raw is HarEntry {
        if (!raw || typeof raw !== "object") {
            return false;
        }

        const entry = raw as HarEntry;

        // More specific HAR validation
        const hasValidRequest =
            entry.request &&
            typeof entry.request === "object" &&
            typeof entry.request.method === "string" &&
            typeof entry.request.url === "string" &&
            Array.isArray(entry.request.headers) &&
            "httpVersion" in entry.request; // HAR-specific

        const hasValidResponse =
            entry.response &&
            typeof entry.response === "object" &&
            typeof entry.response.status === "number" &&
            Array.isArray(entry.response.headers) &&
            "content" in entry.response && // HAR-specific
            typeof entry.response.content === "object";

        return Boolean(hasValidRequest && hasValidResponse);
    }

    parse(entry: HarEntry): { request: string; response: string } {
        return {
            request: this.parseRequest(entry),
            response: this.parseResponse(entry),
        };
    }
}

export class HttpMessageParser {
    private parsers = new Map<string, HttpParser<any>>();

    registerParser<T>(mimeType: string, parser: HttpParser<T>) {
        this.parsers.set(mimeType, parser);
    }

    parse<T>(input: T, mimeType?: string): { request: string; response: string } {
        // Try specified parser first
        if (mimeType && this.parsers.has(mimeType)) {
            const parser = this.parsers.get(mimeType)!;
            if (parser.validate(input)) {
                console.debug(`Using parser for ${mimeType}`);
                return parser.parse(input);
            }
        }

        // Fallback to auto-detection
        for (const [type, parser] of this.parsers.entries()) {
            if (parser.validate(input)) {
                console.debug(`Auto-detected parser: ${type}`);
                return parser.parse(input);
            }
        }

        throw new Error("Unsupported format");
    }

    async parseAsync<T>(
        input: T,
        mimeType?: string
    ): Promise<{ request: string; response: string }> {
        return new Promise((resolve, reject) => {
            requestIdleCallback(() => {
                try {
                    const result = this.parse(input, mimeType);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}

// Utility function to create default parser with registered formats
export function createDefaultParser() {
    const parser = new HttpMessageParser();
    parser.registerParser("application/har+json", new HarParser());
    parser.registerParser("application/vnd.burp.suite.item", new BurpParser());
    return parser;
}
