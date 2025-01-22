import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMimeType(mimeType: string): string {
    // Common MIME type mappings
    const mimeMap: Record<string, string> = {
        "application/json": "JSON",
        "application/xml": "XML",
        "application/x-www-form-urlencoded": "Form Data",
        "application/javascript": "JS",
        "application/x-javascript": "JS",
        "text/javascript": "JS",
        "text/html": "HTML",
        "text/plain": "Text",
        "text/css": "CSS",
        "text/csv": "CSV",
        "image/jpeg": "JPEG",
        "image/png": "PNG",
        "image/gif": "GIF",
        "image/webp": "WebP",
        "image/svg+xml": "SVG",
        "application/x-protobuf": "Protobuf",
        "application/x-protobuf-gz": "Protobuf GZ",
        "application/octet-stream": "Binary",
        "application/pdf": "PDF",
        "application/zip": "ZIP",
        "multipart/form-data": "Form Data",
    };

    // Check for direct mapping
    if (mimeType in mimeMap) {
        return mimeMap[mimeType];
    }

    // Handle vendor specific types
    if (mimeType.includes("vnd.")) {
        const parts = mimeType.split(".");
        return parts[parts.length - 1].toUpperCase();
    }

    // Handle general cases
    const [type, subtype] = mimeType.split("/");

    // If it's a common main type, use the subtype
    if (["application", "text", "image", "audio", "video"].includes(type)) {
        // Remove any parameters (everything after ;)
        const cleanSubtype = subtype.split(";")[0];
        // Remove any vendor prefixes
        const finalSubtype = cleanSubtype.split("+").pop() || cleanSubtype;
        return finalSubtype.toUpperCase();
    }

    // Fallback: return the subtype or the full mime type if no subtype
    return subtype ? subtype.toUpperCase() : mimeType;
}
