"use client";

import { useSession } from "@/lib/session-context";
import { createDefaultParser } from "@/lib/http-parser";
import { CodeBlock } from "@/components/code-block";
import { useMemo } from "react";

export function ResponseViewer() {
    const { selectedEntry } = useSession();
    const parser = useMemo(() => createDefaultParser(), []);

    if (!selectedEntry) return null;

    try {
        const { response } = parser.parse(selectedEntry);
        return (
            <div className="h-full overflow-auto p-4">
                <CodeBlock language="http" value={response} />
            </div>
        );
    } catch (error) {
        console.error("Error parsing response:", error);
        return (
            <div className="h-full overflow-auto p-4 text-sm text-muted-foreground">
                Failed to parse response data
            </div>
        );
    }
}
