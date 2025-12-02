"use client";

import { useState } from "react";

export interface useCopyToClipboardProps {
    timeout?: number;
}

export const useCopyToClipboard = (props: useCopyToClipboardProps = {}) => {
    const { timeout = 2000 } = props;
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const copyToClipboard = (value: string) => {
        if (typeof window === "undefined" || !navigator.clipboard?.writeText) return;
        if (!value) return;

        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);

            setTimeout(() => {
                setIsCopied(false);
            }, timeout);
        });
    };

    return { isCopied, copyToClipboard };
};
