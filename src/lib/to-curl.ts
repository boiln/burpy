import type { BurpEntry } from "@/types/burp";
import type { HarEntry, HarHeader } from "@/types/har";

type Entry = BurpEntry | HarEntry;

const isHarEntry = (entry: Entry): entry is HarEntry => {
    return "httpVersion" in entry.request;
};

const getHeaders = (entry: Entry): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (isHarEntry(entry)) {
        entry.request.headers.forEach((header: HarHeader) => {
            headers[header.name] = header.value;
        });
        return headers;
    }

    entry.request.headers.forEach((header: string) => {
        try {
            const decoded = atob(header);
            const [name, ...valueParts] = decoded.split(":");
            if (!name || valueParts.length === 0) return;

            headers[name.trim()] = valueParts.join(":").trim();
        } catch {
            const [name, ...valueParts] = header.split(":");
            if (!name || valueParts.length === 0) return;

            headers[name.trim()] = valueParts.join(":").trim();
        }
    });

    return headers;
};

const getBody = (entry: Entry): string => {
    if (isHarEntry(entry)) {
        return entry.request.postData?.text || "";
    }

    try {
        return atob(entry.request.body);
    } catch {
        return entry.request.body;
    }
};

const getUrl = (entry: Entry): string => {
    return entry.request.url;
};

export const toCurl = (entry: Entry): string => {
    const curlParts: string[] = [];

    curlParts.push(`curl --path-as-is -i -s -k -X $'${entry.request.method}'`);

    const headers = getHeaders(entry);
    const headerParts: string[] = [];

    for (const [name, value] of Object.entries(headers)) {
        headerParts.push(`-H $'${name}: ${value}'`);
    }

    if (headerParts.length > 0) {
        curlParts.push(headerParts.join(" "));
    }

    const body = getBody(entry);
    if (body) {
        const contentType = headers["content-type"] || headers["Content-Type"];

        if (contentType?.includes("application/json")) {
            try {
                const jsonBody = JSON.parse(body);
                curlParts.push(`--data $'${JSON.stringify(jsonBody)}'`);
            } catch {
                curlParts.push(`--data $'${body}'`);
            }
        } else {
            curlParts.push(`--data $'${body}'`);
        }
    }

    curlParts.push(`$'${getUrl(entry)}'`);

    return curlParts.join(" \\\n    ");
};
