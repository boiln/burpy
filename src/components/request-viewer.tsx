"use client";

import { useSession } from "@/lib/session-context";
import { createDefaultParser } from "@/lib/http-parser";
import { CodeBlock } from "@/components/code-block";
import { useMemo } from "react";

export function RequestViewer() {
    const { selectedEntry } = useSession();
    const parser = useMemo(() => createDefaultParser(), []);

    if (!selectedEntry) return null;

    try {
        const { request } = parser.parse(selectedEntry);
        return (
            <div className="h-full overflow-auto p-2">
                <CodeBlock language="http" value={request} />
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
}
