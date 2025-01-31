export type HighlightColor =
    | "red"
    | "green"
    | "blue"
    | "cyan"
    | "yellow"
    | "pink"
    | "purple"
    | "orange";

export interface HarHeader {
    name: string;
    value: string;
}

export interface HarRequest {
    method: string;
    url: string;
    httpVersion: string;
    headers: HarHeader[];
    postData?: {
        mimeType: string;
        text: string;
    };
}

export interface HarResponse {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: HarHeader[];
    contentLength: number;
    content: {
        mimeType: string;
        text?: string;
    };
}

export interface HarEntry {
    startedDateTime: string;
    time: number;
    request: HarRequest;
    response: HarResponse;
    highlight?: HighlightColor;
    comment?: string;
}

export interface HarSession {
    id: string;
    name: string;
    entries: HarEntry[];
}
