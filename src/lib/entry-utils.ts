/**
 * Utility functions for working with Burp and HAR entries
 */

import type { BurpSession, BurpEntry, BurpResponse } from "@/types/burp";
import type { HarSession, HarEntry, HarResponse } from "@/types/har";

/**
 * Type guard to check if session is HAR format
 */
export const isHarSession = (session: BurpSession | HarSession): session is HarSession => {
    if (!session?.entries?.[0]) return false;

    const entry = session.entries[0];

    return (
        "request" in entry &&
        "httpVersion" in entry.request &&
        "response" in entry &&
        typeof entry.response === "object" &&
        "content" in (entry.response || {})
    );
};

/**
 * Type guard to check if entry is HAR format
 */
export const isHarEntry = (entry: BurpEntry | HarEntry): entry is HarEntry => {
    return "httpVersion" in entry.request;
};

/**
 * Type guard to check if response is HAR format
 */
export const isHarResponse = (response: unknown): response is HarResponse => {
    if (!response || typeof response !== "object") return false;
    return "content" in response && "headers" in response;
};

/**
 * Get timestamp from entry
 */
export const getEntryTime = (entry: BurpEntry | HarEntry): string => {
    const timestamp = "startTime" in entry ? entry.startTime : entry.startedDateTime;
    if (!timestamp) return "-";

    const date = new Date(timestamp);
    const time = date.toLocaleTimeString();
    const month = date.toLocaleDateString(undefined, { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${time} ${month} ${day}, ${year}`;
};

/**
 * Get unique ID from entry
 */
export const getEntryId = (entry: BurpEntry | HarEntry): string => {
    return "startTime" in entry ? entry.startTime : entry.startedDateTime;
};

/**
 * Parse URL safely, with fallback for malformed URLs
 */
export const parseUrl = (url: string): { host: string; pathname: string; search: string } => {
    try {
        const urlObj = new URL(url);
        return {
            host: urlObj.host,
            pathname: urlObj.pathname,
            search: urlObj.search,
        };
    } catch {
        const urlParts = url.split("/");

        if (urlParts.length >= 3) {
            return {
                host: urlParts[2],
                pathname: "/" + urlParts.slice(3).join("/"),
                search: "",
            };
        }

        return {
            host: url,
            pathname: "/",
            search: "",
        };
    }
};

/**
 * Get MIME type and content length from entry response
 */
export const getResponseInfo = (
    entry: BurpEntry | HarEntry
): { mimeType: string; contentLength: number } => {
    if (!entry.response) {
        return { mimeType: "unknown", contentLength: 0 };
    }

    if (isHarResponse(entry.response)) {
        return {
            mimeType: entry.response.content.mimeType || "unknown",
            contentLength: entry.response.contentLength || entry.response.content.text?.length || 0,
        };
    }

    return {
        mimeType: entry.response.mimeType || "unknown",
        contentLength: entry.response.contentLength || 0,
    };
};

/**
 * Get response mimeType from entry
 */
export const getResponseMimeType = (response: BurpResponse | HarResponse): string | undefined => {
    if ("content" in response) {
        return response.content?.mimeType;
    }
    return response.mimeType;
};

/**
 * Get request mimeType from entry (for POST data)
 */
export const getRequestMimeType = (entry: BurpEntry | HarEntry): string | undefined => {
    if (isHarEntry(entry)) {
        return entry.request.postData?.mimeType;
    }
    return undefined;
};

/**
 * Get cookies from response headers
 */
export const getEntryCookies = (entry: BurpEntry | HarEntry): string => {
    if (!entry.response) return "";

    if (isHarEntry(entry)) {
        const headers = entry.response.headers || [];
        const setCookieHeaders = headers.filter((h) => h.name.toLowerCase() === "set-cookie");

        if (setCookieHeaders.length === 0) return "";

        const cookies = setCookieHeaders.map((h) => {
            const cookiePart = h.value.split(";")[0].trim();
            return cookiePart;
        });

        return cookies.join("; ");
    }

    const responseText = entry.parsedResponse || entry.response.body || "";

    const lines = responseText.split(/\r?\n/);
    const cookies: string[] = [];

    for (const line of lines) {
        if (line.trim() === "") break;

        if (line.toLowerCase().startsWith("set-cookie:")) {
            const value = line.substring(11).trim();
            const cookiePart = value.split(";")[0].trim();
            cookies.push(cookiePart);
        }
    }

    return cookies.join("; ");
};
