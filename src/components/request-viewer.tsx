"use client";

import { useMemo } from "react";

import { CodeBlock } from "@/components/code-block";
import { getRequestMimeType } from "@/lib/entry-utils";
import { createDefaultParser } from "@/lib/http-parser";
import { useSession } from "@/lib/session-context";

export const RequestViewer = () => {
    const { selectedEntry } = useSession();
    const parser = useMemo(() => createDefaultParser(), []);

    if (!selectedEntry) return null;

    const mimeType = getRequestMimeType(selectedEntry);

    try {
        const { request: parsedRequest } = parser.parse(selectedEntry);

        return (
            <div className="h-full overflow-auto p-2">
                <CodeBlock language="http" value={parsedRequest} mimeType={mimeType} />
            </div>
        );
    } catch (error) {
        console.error("Error parsing request:", error);
        return (
            <div className="h-full overflow-auto p-4 text-sm text-muted-foreground">
                Failed to parse request data
            </div>
        );
    }
};
