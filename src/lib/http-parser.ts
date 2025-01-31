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
        try {
            return atob(str);
        } catch (error) {
            console.error("Base64 decoding error:", error);
            return "";
        }
    }

    parseRequest(entry: BurpEntry): string {
        const headers = entry.request.headers.join("\r\n");
        const protocol = entry.request.protocol || "HTTP/1.1";

        return [
            `${entry.request.method} ${entry.request.url} ${protocol}`,
            headers,
            "",
            this.decodeBase64(entry.request.body),
        ].join("\r\n");
    }

    parseResponse(entry: BurpEntry): string {
        const headers = entry.response.headers.join("\r\n");
        const protocol = entry.request.protocol || "HTTP/1.1";

        return [
            `${protocol} ${entry.response.status} ${entry.response.statusText}`,
            headers,
            "",
            this.decodeBase64(entry.response.body),
        ].join("\r\n");
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

            // Decode and parse raw request to get protocol
            const rawRequest = atob(getElementContent("request"));
            const [requestLine] = rawRequest.split("\r\n");
            const [, , protocol] = requestLine.split(" ");

            return {
                startTime: new Date().toISOString(),
                duration: 0,
                request: {
                    method: getElementContent("method"),
                    url: getElementContent("url"),
                    protocol: protocol || "HTTP/1.1",
                    headers: [getElementContent("requestheaders")],
                    body: getElementContent("request"),
                },
                response: {
                    status: parseInt(getElementContent("status"), 10),
                    statusText: getElementContent("statustext"),
                    headers: [getElementContent("responseheaders")],
                    body: getElementContent("response"),
                    mimeType: getElementContent("mimetype"),
                    contentLength: parseInt(getElementContent("contentlength"), 10),
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
            `${protocol} ${entry.response.status} ${entry.response.statusText}`,
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
}

// Utility function to create default parser with registered formats
export function createDefaultParser() {
    const parser = new HttpMessageParser();
    parser.registerParser("application/vnd.burp.suite.item", new BurpParser());
    parser.registerParser("application/har+json", new HarParser());
    return parser;
}
