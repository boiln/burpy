import { BurpParser, createDefaultParser } from "@/lib/http-parser";
import type { BurpSession } from "@/types/burp";
import type { HarEntry, HarSession } from "@/types/har";

const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB
const SUPPORTED_EXTENSIONS = ["har", "xml"];

/**
 * Validates HAR data structure
 */
export const validateHarData = (data: unknown): data is { log: { entries: HarEntry[] } } => {
    if (!data || typeof data !== "object") {
        return false;
    }

    const harData = data as { log?: { entries?: unknown[] } };

    if (!harData.log || !Array.isArray(harData.log.entries) || harData.log.entries.length === 0) {
        return false;
    }

    const firstEntry = harData.log.entries[0] as HarEntry;
    if (!firstEntry?.request?.method || !firstEntry?.request?.url) {
        return false;
    }

    if (typeof firstEntry?.response?.status !== "number") {
        return false;
    }

    return true;
};

/**
 * Gets file extension from filename
 */
export const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
};

/**
 * Validates file before processing
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: "File size exceeds 250MB limit" };
    }

    const extension = getFileExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: "Unsupported file format. Please upload a .har or .xml file",
        };
    }

    return { valid: true };
};

/**
 * Processes HAR file content into a session
 */
export const processHarContent = (text: string): HarSession => {
    const harData = JSON.parse(text);

    if (!validateHarData(harData)) {
        throw new Error("Invalid HAR file format");
    }

    const parser = createDefaultParser();

    const entries = harData.log.entries.map((entry) => {
        const { request, response } = parser.parse(entry, "application/har+json");
        return {
            ...entry,
            parsedRequest: request,
            parsedResponse: response,
        };
    });

    return { entries };
};

/**
 * Processes Burp XML file content into a session
 */
export const processBurpXmlContent = (text: string): BurpSession => {
    const xmlParser = new DOMParser();
    const doc = xmlParser.parseFromString(text, "text/xml");
    const items = doc.querySelectorAll("item");

    if (!items || items.length === 0) {
        throw new Error("No items found in Burp XML file");
    }

    const parser = createDefaultParser();

    const entries = Array.from(items).map((item, index) => {
        try {
            const burpEntry = BurpParser.parseXmlItem(item.outerHTML);
            const { request, response } = parser.parse(
                burpEntry,
                "application/vnd.burp.suite.item"
            );

            return {
                ...burpEntry,
                parsedRequest: request,
                parsedResponse: response,
            };
        } catch (parseError) {
            console.error(`Failed to parse Burp item ${index + 1}:`, parseError);
            throw parseError;
        }
    });

    if (entries.length === 0) {
        throw new Error("No valid entries found in the file");
    }

    return { entries };
};

/**
 * Processes a file and returns the appropriate session
 */
export const processFile = async (file: File): Promise<BurpSession | HarSession> => {
    const validation = validateFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const text = await file.text();
    const extension = getFileExtension(file.name);

    if (extension === "har") {
        return processHarContent(text);
    }

    return processBurpXmlContent(text);
};

/**
 * Fetches and processes demo HAR file
 */
export const fetchDemoFile = async (): Promise<HarSession> => {
    let response = await fetch("/demo.har");

    if (!response.ok) {
        // Try with repo path for GitHub Pages
        const repoPath = window.location.pathname.split("/")[1];
        response = await fetch(`/${repoPath}/demo.har`);

        if (!response.ok) {
            throw new Error(
                `Failed to load demo file (HTTP ${response.status}): ${response.statusText}`
            );
        }
    }

    const text = await response.text();

    try {
        return processHarContent(text);
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse demo file: Invalid JSON");
        }
        throw error;
    }
};
