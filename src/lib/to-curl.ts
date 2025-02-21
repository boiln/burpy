import { BurpItem } from "@/types/burp";

export function toCurl(item: BurpItem): string {
    const curl_parts: string[] = [];

    // init curl cmd and method
    curl_parts.push(`curl --path-as-is -i -s -k -X $'${item.method}'`);

    // parse req headers and body
    const requestLines = item.request.decodedValue.split("\n");
    const headers: Record<string, string> = {};
    let bodyStartIndex = -1;

    // skip req line
    for (let i = 1; i < requestLines.length; i++) {
        const line = requestLines[i].trim();
        if (line === "") {
            bodyStartIndex = i + 1;
            break;
        }
        const [name, ...valueParts] = line.split(":");
        if (name && valueParts.length > 0) {
            const headerName = name.trim();
            const headerValue = valueParts.join(":").trim();
            headers[headerName] = headerValue;
        }
    }

    // add headers inc cookie
    const headerParts: string[] = [];
    for (const [name, value] of Object.entries(headers)) {
        headerParts.push(`-H $'${name}: ${value}'`);
    }
    if (headerParts.length > 0) {
        curl_parts.push(headerParts.join(" "));
    }

    // handle req body
    if (bodyStartIndex !== -1) {
        const body = requestLines.slice(bodyStartIndex).join("\n").trim();
        if (body) {
            const contentType = headers["content-type"] || headers["Content-Type"];
            if (contentType?.includes("application/json")) {
                // parse json for formatting
                try {
                    const jsonBody = JSON.parse(body);
                    curl_parts.push(`--data $'${JSON.stringify(jsonBody)}'`);
                } catch {
                    // use raw body if parse fails
                    curl_parts.push(`--data $'${body}'`);
                }
            } else {
                curl_parts.push(`--data $'${body}'`);
            }
        }
    }

    curl_parts.push(`$'${item.host.value}${item.url}'`);
    return curl_parts.join(" \\\n    ");
}
