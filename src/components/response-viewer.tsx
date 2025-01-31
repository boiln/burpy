"use client";

import { useSession } from "@/lib/session-context";
import { HttpMessageParser } from "@/lib/http-parser";
import { CodeBlock } from "@/components/code-block";

export function ResponseViewer() {
    const { selectedEntry } = useSession();
    const parser = new HttpMessageParser();

    if (!selectedEntry) return null;

    const response = parser.parse(selectedEntry).response;

    return (
        <div className="h-full overflow-auto p-4">
            <CodeBlock language="http" value={response} />
        </div>
    );
}
