import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { BurpItem, BurpSession } from "@/types/burp";

export function useSessionSearch(items: BurpItem[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<BurpItem[]>(items);
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setFilteredItems(items);
            return;
        }

        const searchLower = debouncedSearch.toLowerCase();
        const filtered = items.filter((item) => {
            return (
                item.url.toLowerCase().includes(searchLower) ||
                item.method.toLowerCase().includes(searchLower) ||
                item.status.toLowerCase().includes(searchLower) ||
                item.mimetype.toLowerCase().includes(searchLower) ||
                item.comment.toLowerCase().includes(searchLower)
            );
        });

        setFilteredItems(filtered);
    }, [debouncedSearch, items]);

    return { filteredItems, searchTerm, setSearchTerm };
}
