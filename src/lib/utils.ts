import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Common MIME type mappings with standardized display formats
const MIME_TYPE_DISPLAY: Record<string, string> = {
    // Application types
    "application/json": "JSON",
    "application/xml": "XML",
    "application/x-www-form-urlencoded": "FORM",
    "application/javascript": "JS",
    "application/x-javascript": "JS",
    "application/x-protobuf": "PROTOBUF",
    "application/x-protobuf-gz": "PROTOBUF GZ",
    "application/octet-stream": "BINARY",
    "application/pdf": "PDF",
    "application/zip": "ZIP",

    // Text types
    "text/plain": "TEXT",
    "text/html": "HTML",
    "text/css": "CSS",
    "text/javascript": "JS",
    "text/csv": "CSV",

    // Image types
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WEBP",
    "image/svg+xml": "SVG",

    // Multipart types
    "multipart/form-data": "FORM",
    "multipart/mixed": "MIXED",
};

export function formatMimeType(mimeType: string): string {
    if (!mimeType) return "";

    // Check predefined mappings first
    const knownType = MIME_TYPE_DISPLAY[mimeType.toLowerCase()];
    if (knownType) return knownType;

    const [type, subtype] = mimeType.split("/");
    if (!type || !subtype) return mimeType.toUpperCase();

    // Handle vendor specific types (vnd.)
    if (subtype.includes("vnd.")) {
        const parts = subtype.split(".");
        return parts[parts.length - 1].toUpperCase();
    }

    // Handle general types
    if (["application", "text", "image", "audio", "video"].includes(type)) {
        const cleanSubtype = subtype.split(";")[0];
        const finalSubtype = cleanSubtype.split("+").pop() || cleanSubtype;
        return finalSubtype.toUpperCase();
    }

    return mimeType.toUpperCase();
}
