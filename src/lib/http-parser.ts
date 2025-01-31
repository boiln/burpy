import type { BurpEntry } from "@/types/burp";
import type { HarEntry } from "@/types/har";

// Base interface for all HTTP message parsers
export interface HttpParser<T> {
    parseRequest(raw: T): string;
    parseResponse(raw: T): string;
    validate(raw: unknown): raw is T;
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
                return decodedBody;
            }
        }

        // Otherwise construct the request from individual parts
        const headers = entry.request.headers
            .map((header) => this.decodeBase64(header))
            .join("\r\n");
        const protocol = entry.request.protocol || "HTTP/1.1";

        // Clean up the URL - remove any http(s):// prefix and ensure proper path format
        let url = entry.request.url;
        if (url.startsWith("http://") || url.startsWith("https://")) {
            try {
                const urlObj = new URL(url);
                url = urlObj.pathname + urlObj.search;
            } catch (e) {
                url = url.replace(/^https?:\/\/[^\/]+/, "");
            }
        }

        // Ensure the path starts with a forward slash
        url = url.startsWith("/") ? url : `/${url}`;

        // Construct the request line
        const requestLine = `${entry.request.method} ${url} ${protocol}`;

        return [requestLine, headers].join("\r\n");
    }

    parseResponse(entry: BurpEntry): string {
        const headers = entry.response.headers
            .map((header) => this.decodeBase64(header))
            .join("\r\n");
        const protocol = entry.request.protocol || "HTTP/1.1";
        const body = this.decodeBase64(entry.response.body);

        return [`${protocol} ${entry.response.status}`, headers, "", body].join("\r\n");
    }

    validate(raw: unknown): raw is BurpEntry {
        return Boolean((raw as BurpEntry)?.request?.method && (raw as BurpEntry)?.response?.status);
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
                    status: parseInt(getElementContent("status"), 10),
                    statusText: getElementContent("statustext"),
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
        const headers = entry.request.headers.map((h) => `${h.name}: ${h.value}`).join("\r\n");
        const protocol = entry.request.httpVersion;

        return [
            `${entry.request.method} ${entry.request.url} ${protocol}`,
            headers,
            "",
            entry.request.postData?.text || "",
        ].join("\r\n");
    }

    parseResponse(entry: HarEntry): string {
        const headers = entry.response.headers.map((h) => `${h.name}: ${h.value}`).join("\r\n");
        const protocol = entry.response.httpVersion;

        return [
            `${protocol} ${entry.response.statusText}`,
            `Content-Length: ${entry.response.contentLength.toString()}`,
            headers,
            "",
            entry.response.content.text || "",
        ].join("\r\n");
    }

    validate(raw: unknown): raw is HarEntry {
        return Boolean((raw as HarEntry)?.request?.method && (raw as HarEntry)?.response?.status);
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
                return {
                    request: parser.parseRequest(input),
                    response: parser.parseResponse(input),
                };
            }
        }

        // Fallback to auto-detection
        for (const parser of this.parsers.values()) {
            if (parser.validate(input)) {
                return {
                    request: parser.parseRequest(input),
                    response: parser.parseResponse(input),
                };
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
    parser.registerParser("application/vnd.burp.suite.item", new BurpParser());
    parser.registerParser("application/har+json", new HarParser());
    return parser;
}
