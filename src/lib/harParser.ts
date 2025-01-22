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
        const firstLine = `${httpVersion} ${statusText}`;
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

            return {
                time: new Date(entry.startedDateTime).toLocaleString(),
                url: entry.request.url,
                host: {
                    value: url.hostname,
                    ip: entry.serverIPAddress || "",
                    port: url.port.toString(),
                },
                port: url.port.toString(),
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
