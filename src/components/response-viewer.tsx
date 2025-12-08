"use client";

import { useMemo } from "react";

import { CodeBlock } from "@/components/code-block";
import { CustomScrollbar } from "@/components/ui/custom-scrollbar";
import { getResponseMimeType } from "@/lib/entry-utils";
import { createDefaultParser } from "@/lib/http-parser";
import { useSession } from "@/lib/session-context";

export const ResponseViewer = () => {
    const { selectedEntry } = useSession();
    const parser = useMemo(() => createDefaultParser(), []);

    if (!selectedEntry) return null;

    const mimeType = getResponseMimeType(selectedEntry.response);

    try {
        const { response: parsedResponse } = parser.parse(selectedEntry);

        return (
            <CustomScrollbar className="h-full">
                <div className="p-2">
                    <CodeBlock language="http" value={parsedResponse} mimeType={mimeType} />
                </div>
            </CustomScrollbar>
        );
    } catch (error) {
        console.error("Error parsing response:", error);
        return (
            <div className="h-full overflow-auto p-4 text-sm text-muted-foreground">
                Failed to parse response data
            </div>
        );
    }
};
