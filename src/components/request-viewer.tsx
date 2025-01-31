"use client";

import { useSession } from "@/lib/session-context";
import { HttpMessageParser } from "@/lib/http-parser";
import { CodeBlock } from "@/components/code-block";

export function RequestViewer() {
    const { selectedEntry } = useSession();
    const parser = new HttpMessageParser();

    if (!selectedEntry) return null;

    const request = parser.parse(selectedEntry).request;

    return (
        <div className="h-full overflow-auto p-4">
            <CodeBlock language="http" value={request} />
        </div>
    );
}
