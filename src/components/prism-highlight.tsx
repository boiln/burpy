"use client";

import { useEffect, useState } from "react";

import Prism from "@/lib/prism";

interface PrismHighlightProps {
    code: string;
    language: string;
}

export const PrismHighlight = (props: PrismHighlightProps) => {
    const { code, language } = props;
    const [highlighted, setHighlighted] = useState(code);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const grammar = Prism.languages[language] || Prism.languages.text;
        setHighlighted(Prism.highlight(code, grammar, language));
    }, [code, language]);

    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
};
