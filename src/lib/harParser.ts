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
        const { status, statusText, httpVersion, headers, content } = entry.response;
        const firstLine = `${httpVersion} ${status} ${statusText}`;
        const headerString = convertHarHeadersToString(headers);
        const body = content.text || "";
        return `${firstLine}\n${headerString}${body ? "\n\n" + body : ""}`;
    }
}

export function parseHarToSession(harContent: string): BurpSession {
    try {
        const har: HarFile = JSON.parse(harContent);

        const items: BurpItem[] = har.log.entries.map((entry) => {
            const requestMessage = buildHttpMessage(entry, "request");
            const responseMessage = buildHttpMessage(entry, "response");
            const url = new URL(entry.request.url);

            // Extract IP from various possible locations
            let ip = "";
            if (entry.serverIPAddress) {
                ip = entry.serverIPAddress;
            } else {
                // Try to find IP in response headers
                const serverHeader = entry.response.headers.find(
                    (h) =>
                        h.name.toLowerCase() === "server" ||
                        h.name.toLowerCase() === "x-served-by" ||
                        h.name.toLowerCase() === "x-real-ip"
                );
                if (serverHeader) {
                    // Extract IP if it exists in the server header
                    const ipMatch = serverHeader.value.match(
                        /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
                    );
                    if (ipMatch) {
                        ip = ipMatch[0];
                    }
                }
            }

            return {
                time: new Date(entry.startedDateTime).toLocaleString(),
                url: entry.request.url,
                host: {
                    value: url.hostname,
                    ip: ip,
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
                responselength: entry.response.content.size.toString(),
                mimetype: entry.response.content.mimeType,
                response: {
                    base64: false,
                    value: responseMessage,
                    decodedValue: responseMessage,
                },
                highlight: null,
                comment: entry.comment || "",
            };
        });

        return {
            burpVersion: `HAR ${har.log.version}`,
            exportTime: new Date().toISOString(),
            items,
        };
    } catch (error) {
        console.error("Failed to parse HAR file:", error);
        throw new Error("Invalid HAR file format");
    }
}
