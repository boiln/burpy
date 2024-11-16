import { useState, useMemo } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import type { BurpSession, BurpItem } from "@/types/burp";

export function useSessionSearch(session: BurpSession) {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    const filteredItems = useMemo(() => {
        if (!debouncedSearch) return session.items;
        return session.items.filter((item: BurpItem) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(debouncedSearch.toLowerCase())
            )
        );
    }, [session.items, debouncedSearch]);

    return { filteredItems, searchTerm, setSearchTerm };
}
