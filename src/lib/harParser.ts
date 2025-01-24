import { BurpSession, BurpItem } from "@/types/burp";
import { HarFile, HarEntry } from "@/types/har";

function convertHarHeadersToString(headers: { name: string; value: string }[]): string {
    return headers.map((header) => `${header.name}: ${header.value}`).join("\n");
}

function buildHttpMessage(entry: HarEntry, type: "request" | "response"): string {
    if (type === "request") {
        const { method, url, httpVersion, headers, postData } = entry.request;
        const firstLine = `${method} ${url} ${httpVersion}`;
        const headerString = convertHarHeadersToString(headers);
        const body = postData?.text || "";
        return `${firstLine}\n${headerString}${body ? "\n\n" + body : ""}`;
    } else {
        const { statusText, httpVersion, headers, content } = entry.response;
        const firstLine = `${httpVersion} ${statusText}`;
        const headerString = convertHarHeadersToString(headers);
        const body = content.text || "";
        return `${firstLine}\n${headerString}${body ? "\n\n" + body : ""}`;
    }
}

// Add validation helper functions
function validateHarStructure(har: any): string | null {
    if (!har?.log) {
        return "Invalid HAR format: Missing 'log' property";
    }
    if (!Array.isArray(har.log.entries)) {
        return "Invalid HAR format: Missing or invalid 'entries' array";
    }
    return null;
}

function validateHarEntry(entry: any, index: number): string | null {
    if (!entry.request || !entry.response) {
        return `Invalid entry at index ${index}: Missing request or response`;
    }
    if (!entry.request.url) {
        return `Invalid entry at index ${index}: Missing request URL`;
    }
    if (!entry.request.method) {
        return `Invalid entry at index ${index}: Missing request method`;
    }
    if (!entry.response.status) {
        return `Invalid entry at index ${index}: Missing response status`;
    }
    return null;
}

export function parseHarToSession(harContent: string): BurpSession {
    try {
        const har: HarFile = JSON.parse(harContent);

        // Validate overall HAR structure
        const structureError = validateHarStructure(har);
        if (structureError) {
            throw new Error(structureError);
        }

        // Validate each entry before processing
        for (let i = 0; i < har.log.entries.length; i++) {
            const entryError = validateHarEntry(har.log.entries[i], i);
            if (entryError) {
                throw new Error(entryError);
            }
        }

        const items: BurpItem[] = har.log.entries.map((entry, index) => {
            try {
                const requestMessage = buildHttpMessage(entry, "request");
                const responseMessage = buildHttpMessage(entry, "response");
                const url = new URL(entry.request.url);

                const formatUrl = (urlObj: URL): string => {
                    return urlObj.pathname + urlObj.search;
                };

                const formatHost = (urlObj: URL): string => {
                    return `${urlObj.protocol}//${urlObj.hostname}`;
                };

                return {
                    time: new Date(entry.startedDateTime).toLocaleString(),
                    url: formatUrl(url),
                    host: {
                        value: formatHost(url),
                        ip: entry.serverIPAddress || "",
                        port: url.port || (url.protocol === "https:" ? "443" : "80"),
                    },
                    port: url.port || (url.protocol === "https:" ? "443" : "80"),
                    protocol: url.protocol.replace(":", ""),
                    method: entry.request.method,
                    path: url.pathname + url.search,
                    extension: url.pathname.split(".").pop() || "",
                    request: {
                        base64: false,
                        value: requestMessage,
                        decodedValue: requestMessage,
                    },
                    status: entry.response.status.toString(),
                    responselength: (entry.response.content.size || 0).toString(),
                    mimetype: entry.response.content.mimeType || "application/octet-stream",
                    response: {
                        base64: false,
                        value: responseMessage,
                        decodedValue: responseMessage,
                    },
                    highlight: null,
                    comment: entry.comment || "",
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                throw new Error(`Failed to process entry ${index}: ${errorMessage}`);
            }
        });

        return {
            exportTime: new Date().toISOString(),
            items,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error parsing HAR file";
        console.error("Failed to parse HAR file:", errorMessage);
        throw new Error(errorMessage);
    }
}
