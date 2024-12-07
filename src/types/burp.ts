export interface BurpItem {
    time: string;
    url: string;
    host: {
        value: string;
        ip: string;
    };
    port: string;
    protocol: string;
    method: string;
    path: string;
    extension: string;
    request: {
        base64: boolean;
        value: string;
        decodedValue: string;
    };
    status: string;
    responselength: string;
    mimetype: string;
    response: {
        base64: boolean;
        value: string;
        decodedValue: string;
    };
    comment: string;
}

export interface BurpSession {
    burpVersion: string;
    exportTime: string;
    items: BurpItem[];
}
