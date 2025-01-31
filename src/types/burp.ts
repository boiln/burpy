export type HighlightColor =
    | "red"
    | "green"
    | "blue"
    | "cyan"
    | "yellow"
    | "pink"
    | "purple"
    | "orange";

export interface BurpRequest {
    method: string;
    url: string;
    protocol?: string;
    headers: string[];
    body: string;
}

export interface BurpResponse {
    status: number;
    statusText: string;
    headers: string[];
    body: string;
    mimeType: string;
    contentLength: number;
}

export interface BurpEntry {
    startTime: string;
    duration: number;
    request: BurpRequest;
    response: BurpResponse;
    highlight?: HighlightColor;
    comment?: string;
}

export interface BurpSession {
    entries: BurpEntry[];
}
