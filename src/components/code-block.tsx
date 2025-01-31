"use client";

import { useEffect, useRef } from "react";
import Prism from "@/lib/prism";

export function CodeBlock({ language, value }: { language: string; value: string }) {
    const ref = useRef<HTMLPreElement>(null);

    useEffect(() => {
        if (ref.current) {
            Prism.highlightElement(ref.current);
        }
    }, [value]);

    return (
        <pre className="language-http rounded-md !bg-muted/50 p-4" tabIndex={0}>
            <code ref={ref} className={`language-${language}`}>
                {value}
            </code>
        </pre>
    );
}
