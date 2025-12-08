import type { BurpEntry } from "@/types/burp";
import type { HarEntry } from "@/types/har";

export interface RequestData {
    id: string;
    index: number;
    host: string;
    method: string;
    url: string;
    status: number;
    statusText: string;
    mimeType: string;
    length: number;
    time: string;
    cookies: string;
    entry: BurpEntry | HarEntry;
}
