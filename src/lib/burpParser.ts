import { BurpSession, BurpItem } from "../types/burp";

export function decodeBase64(str: string): string {
    try {
        return atob(str);
    } catch (e) {
        console.error("Failed to decode base64:", e);
        return str;
    }
}

export function urlDecode(str: string): string {
    try {
        let decoded = decodeURIComponent(str);

        if (decoded.includes("%")) {
            try {
                decoded = decodeURIComponent(decoded);
            } catch (e) {}
        }

        decoded = decoded.replace(/\+/g, " ");

        decoded = decoded
            .replace(/%20/g, " ")
            .replace(/%3D/g, "=")
            .replace(/%26/g, "&")
            .replace(/%2B/g, "+")
            .replace(/%3F/g, "?")
            .replace(/%2F/g, "/")
            .replace(/%25/g, "%")
            .replace(/%23/g, "#")
            .replace(/%3A/g, ":");

        return decoded;
    } catch (e) {
        console.error("Failed to decode URL:", e);
        return str;
    }
}

export function htmlDecode(str: string): string {
    try {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    } catch (e) {
        console.error("Failed to decode HTML:", e);
        return str;
    }
}

export function jsonFormat(str: string): string {
    try {
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed, null, 4);
    } catch (e) {
        console.error("Failed to format JSON:", e);
        return str;
    }
}

export function jsonMinify(str: string): string {
    try {
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed);
    } catch (e) {
        console.error("Failed to minify JSON:", e);
        return str;
    }
}

function formatTime(timeStr: string): string {
    try {
        const date = new Date(timeStr);
        return date.toLocaleString();
    } catch (e) {
        console.error("Failed to format time:", e);
        return timeStr;
    }
}

function formatUrlParts(urlStr: string): { hostValue: string; urlPath: string } {
    try {
        const url = new URL(urlStr);

        const hostValue = `${url.protocol}//${url.hostname}`;
        const urlPath = url.pathname + url.search;

        return { hostValue, urlPath };
    } catch (e) {
        console.error("Failed to parse URL:", e);
        return { hostValue: urlStr, urlPath: "" };
    }
}

export async function parseBurpXml(xmlContent: string): Promise<BurpSession> {
    console.log("Starting XML parsing");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    console.log("XML parsed");

    const items = xmlDoc.getElementsByTagName("item");
    console.log("Found items:", items.length);
    const parsedItems: BurpItem[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const getElementText = (tagName: string) =>
            item.getElementsByTagName(tagName)[0]?.textContent || "";

        const host = item.getElementsByTagName("host")[0];
        const request = item.getElementsByTagName("request")[0];
        const response = item.getElementsByTagName("response")[0];

        // Pre-decode base64 content for searching
        const requestValue = getElementText("request");
        const responseValue = getElementText("response");
        const isRequestBase64 = request?.getAttribute("base64") === "true";
        const isResponseBase64 = response?.getAttribute("base64") === "true";

        // Create searchable content by decoding base64 if needed
        const decodedRequest = isRequestBase64 ? decodeBase64(requestValue) : requestValue;
        const decodedResponse = isResponseBase64 ? decodeBase64(responseValue) : responseValue;

        const fullUrl = getElementText("url");
        const { hostValue, urlPath } = formatUrlParts(fullUrl);

        parsedItems.push({
            time: formatTime(getElementText("time")),
            url: urlPath,
            host: {
                value: hostValue,
                ip: host?.getAttribute("ip") || "",
            },
            port: getElementText("port"),
            protocol: getElementText("protocol"),
            method: getElementText("method"),
            path: getElementText("path"),
            extension: getElementText("extension"),
            request: {
                base64: isRequestBase64,
                value: requestValue,
                decodedValue: decodedRequest,
            },
            status: getElementText("status"),
            responselength: getElementText("responselength"),
            mimetype: getElementText("mimetype"),
            response: {
                base64: isResponseBase64,
                value: responseValue,
                decodedValue: decodedResponse,
            },
            comment: getElementText("comment"),
            highlight: null,
        });
    }

    console.log("Finished parsing items:", parsedItems.length);
    return {
        exportTime: new Date().toISOString(),
        items: parsedItems,
    };
}
