import { BurpEntry } from "@/types/burp";
import { HarEntry, HarHeader } from "@/types/har";

type Entry = BurpEntry | HarEntry;

function isHarEntry(entry: Entry): entry is HarEntry {
    return "httpVersion" in entry.request;
}

function getHeaders(entry: Entry): Record<string, string> {
    const headers: Record<string, string> = {};

    if (isHarEntry(entry)) {
        entry.request.headers.forEach((header: HarHeader) => {
            headers[header.name] = header.value;
        });
    } else {
        entry.request.headers.forEach((header: string) => {
            try {
                const decoded = atob(header);
                const [name, ...valueParts] = decoded.split(":");
                if (name && valueParts.length > 0) {
                    headers[name.trim()] = valueParts.join(":").trim();
                }
            } catch {
                // If not base64, try parsing directly
                const [name, ...valueParts] = header.split(":");
                if (name && valueParts.length > 0) {
                    headers[name.trim()] = valueParts.join(":").trim();
                }
            }
        });
    }

    return headers;
}

function getBody(entry: Entry): string {
    if (isHarEntry(entry)) {
        return entry.request.postData?.text || "";
    } else {
        try {
            return atob(entry.request.body);
        } catch {
            return entry.request.body;
        }
    }
}

function getUrl(entry: Entry): string {
    return entry.request.url;
}

export function toCurl(entry: Entry): string {
    const curl_parts: string[] = [];

    // init curl cmd and method
    curl_parts.push(`curl --path-as-is -i -s -k -X $'${entry.request.method}'`);

    // add headers
    const headers = getHeaders(entry);
    const headerParts: string[] = [];
    for (const [name, value] of Object.entries(headers)) {
        headerParts.push(`-H $'${name}: ${value}'`);
    }
    if (headerParts.length > 0) {
        curl_parts.push(headerParts.join(" "));
    }

    // handle body
    const body = getBody(entry);
    if (body) {
        const contentType = headers["content-type"] || headers["Content-Type"];
        if (contentType?.includes("application/json")) {
            // parse json for formatting
            try {
                const jsonBody = JSON.parse(body);
                curl_parts.push(`--data $'${JSON.stringify(jsonBody)}'`);
            } catch {
                // use raw body if parse fails
                curl_parts.push(`--data $'${body}'`);
            }
        } else {
            curl_parts.push(`--data $'${body}'`);
        }
    }

    // add URL
    curl_parts.push(`$'${getUrl(entry)}'`);

    return curl_parts.join(" \\\n    ");
}
