export interface HarHeader {
    name: string;
    value: string;
}

export interface HarPostData {
    mimeType: string;
    text: string;
    params: any[];
}

export interface HarRequest {
    method: string;
    url: string;
    httpVersion: string;
    headers: HarHeader[];
    queryString: any[];
    cookies: any[];
    headersSize: number;
    bodySize: number;
    postData?: HarPostData;
}

export interface HarContent {
    size: number;
    mimeType: string;
    text?: string;
    encoding?: string;
}

export interface HarResponse {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: HarHeader[];
    cookies: any[];
    content: HarContent;
    redirectURL: string;
    headersSize: number;
    bodySize: number;
}

export interface HarEntry {
    startedDateTime: string;
    time: number;
    request: HarRequest;
    response: HarResponse;
    cache: any;
    timings: any;
    connection?: string;
    comment?: string;
}

export interface HarLog {
    version: string;
    creator: {
        name: string;
        version: string;
    };
    entries: HarEntry[];
}

export interface HarFile {
    log: HarLog;
} 