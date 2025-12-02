/**
 * Utility functions for working with Burp and HAR entries
 */

import type { BurpSession, BurpEntry } from "@/types/burp";
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
 * Type guard to check if response is HAR format
 */
export const isHarResponse = (response: unknown): response is HarResponse => {
    if (!response || typeof response !== "object") return false;
    return "content" in response && "headers" in response;
};

/**
 * Get timestamp from entry (handles both Burp and HAR formats)
 */
export const getEntryTime = (entry: BurpEntry | HarEntry): string => {
    const timestamp = "startTime" in entry ? entry.startTime : entry.startedDateTime;
    return timestamp ? new Date(timestamp).toLocaleTimeString() : "-";
};

/**
 * Get unique ID from entry (handles both Burp and HAR formats)
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
