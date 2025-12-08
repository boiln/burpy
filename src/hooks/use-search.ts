"use client";

import { useMemo } from "react";

import { useSession } from "@/lib/session-context";
import type { BurpEntry } from "@/types/burp";
import type { HarEntry } from "@/types/har";

type Entry = BurpEntry | HarEntry;

interface SearchResult {
    filteredEntries: Entry[];
}

/**
 * Try to decode base64 string, return original if not base64
 */
const tryDecodeBase64 = (str: string): string => {
    if (!str || typeof str !== "string") return "";

    // Check if it looks like base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str) || str.length < 4) return str;

    try {
        let paddedStr = str;
        while (paddedStr.length % 4 !== 0) {
            paddedStr += "=";
        }
        return atob(paddedStr);
    } catch {
        return str;
    }
};

/**
 * Fast in-memory search using simple string matching.
 */
export const useSearch = (entries: Entry[]): SearchResult => {
    const { searchTerm } = useSession();

    const filteredEntries = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) {
            return entries;
        }

        const lowerSearch = searchTerm.toLowerCase();

        return entries.filter((entry) => {
            const url = entry.request?.url?.toLowerCase() || "";
            if (url.includes(lowerSearch)) return true;

            try {
                const host = new URL(entry.request?.url || "").host.toLowerCase();
                if (host.includes(lowerSearch)) return true;
            } catch {
                // Invalid URL, skip host search
            }

            const comment = (entry as any).comment?.toLowerCase() || "";
            if (comment.includes(lowerSearch)) return true;

            const reqHeaders = (entry.request as any)?.headers;
            if (Array.isArray(reqHeaders)) {
                for (const header of reqHeaders) {
                    if (typeof header === "string") {
                        // Burp format - might be base64 encoded
                        const decoded = tryDecodeBase64(header).toLowerCase();
                        if (decoded.includes(lowerSearch)) return true;
                    }
                    // HAR format - {name, value}
                    if (header?.name?.toLowerCase().includes(lowerSearch)) return true;
                    if (header?.value?.toLowerCase().includes(lowerSearch)) return true;
                }
            }

            // Request body - might be base64 encoded
            const rawReqBody = (entry.request as any)?.body || "";
            const reqBody = tryDecodeBase64(rawReqBody).toLowerCase();
            if (reqBody.includes(lowerSearch)) return true;

            // HAR format post data
            const postData = (entry.request as any)?.postData?.text?.toLowerCase() || "";
            if (postData.includes(lowerSearch)) return true;

            const resHeaders = (entry.response as any)?.headers;
            if (Array.isArray(resHeaders)) {
                for (const header of resHeaders) {
                    if (typeof header === "string") {
                        // Burp format - might be base64 encoded
                        const decoded = tryDecodeBase64(header).toLowerCase();
                        if (decoded.includes(lowerSearch)) return true;
                    }

                    if (header?.name?.toLowerCase().includes(lowerSearch)) return true;
                    if (header?.value?.toLowerCase().includes(lowerSearch)) return true;
                }
            }

            // Response body - might be base64 encoded
            const rawResBody = (entry.response as any)?.body || "";
            const resBody = tryDecodeBase64(rawResBody).toLowerCase();
            if (resBody.includes(lowerSearch)) return true;

            // HAR format content
            const contentText = (entry.response as any)?.content?.text?.toLowerCase() || "";
            if (contentText.includes(lowerSearch)) return true;

            return false;
        });
    }, [entries, searchTerm]);

    return {
        filteredEntries,
    };
};
