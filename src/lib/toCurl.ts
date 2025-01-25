import { BurpItem } from "@/types/burp";

export function toCurl(item: BurpItem): string {
    const curl_parts: string[] = [];

    // Start with the curl command and method
    curl_parts.push(`curl --path-as-is -i -s -k -X $'${item.method}'`);

    // Parse the request headers and body from the decoded request
    const requestLines = item.request.decodedValue.split("\n");
    const headers: Record<string, string> = {};
    let bodyStartIndex = -1;

    // Skip the first line as it's the request line
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

    // Add all headers to curl command including Cookie header
    const headerParts: string[] = [];
    for (const [name, value] of Object.entries(headers)) {
        headerParts.push(`-H $'${name}: ${value}'`);
    }
    if (headerParts.length > 0) {
        curl_parts.push(headerParts.join(" "));
    }

    // Handle request body if it exists
    if (bodyStartIndex !== -1) {
        const body = requestLines.slice(bodyStartIndex).join("\n").trim();
        if (body) {
            const contentType = headers["content-type"] || headers["Content-Type"];
            if (contentType?.includes("application/json")) {
                // If content type is JSON, try to parse and stringify to ensure proper formatting
                try {
                    const jsonBody = JSON.parse(body);
                    curl_parts.push(`--data $'${JSON.stringify(jsonBody)}'`);
                } catch {
                    // If parsing fails, use the raw body
                    curl_parts.push(`--data $'${body}'`);
                }
            } else {
                curl_parts.push(`--data $'${body}'`);
            }
        }
    }

    // Add the URL
    curl_parts.push(`$'${item.host.value}${item.url}'`);

    // Join with line continuation
    return curl_parts.join(" \\\n    ");
}
