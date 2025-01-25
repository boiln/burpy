import { useState } from "react";

interface ContentFormat {
    wrap: boolean;
    prettify: boolean;
}

interface UseContentFormatReturn {
    format: ContentFormat;
    setWrap: (wrap: boolean) => void;
    setPrettify: (prettify: boolean) => void;
}

export function useContentFormat(initialFormat?: Partial<ContentFormat>): UseContentFormatReturn {
    const [format, setFormat] = useState<ContentFormat>({
        wrap: initialFormat?.wrap ?? true,
        prettify: initialFormat?.prettify ?? true,
    });

    const setWrap = (wrap: boolean) => setFormat((prev) => ({ ...prev, wrap }));
    const setPrettify = (prettify: boolean) => setFormat((prev) => ({ ...prev, prettify }));

    return {
        format,
        setWrap,
        setPrettify,
    };
}
