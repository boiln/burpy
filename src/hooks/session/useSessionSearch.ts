import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { BurpItem } from "@/types/burp";
import { FilterType } from "@/types/session";

export function useSessionSearch(items: BurpItem[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [filteredItems, setFilteredItems] = useState<BurpItem[]>(items);
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        // First apply the filter
        let filtered = items;

        if (filter === "highlighted") {
            filtered = items.filter((item) => item.highlight !== null);
        } else if (filter === "commented") {
            filtered = items.filter((item) => item.comment.trim() !== "");
        }

        // Then apply the search
        if (debouncedSearch.trim()) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter((item) => {
                return (
                    // Basic metadata
                    item.url.toLowerCase().includes(searchLower) ||
                    item.method.toLowerCase().includes(searchLower) ||
                    item.status.toLowerCase().includes(searchLower) ||
                    item.mimetype.toLowerCase().includes(searchLower) ||
                    item.comment.toLowerCase().includes(searchLower) ||
                    // Request content
                    item.request.decodedValue.toLowerCase().includes(searchLower) ||
                    // Response content
                    item.response.decodedValue.toLowerCase().includes(searchLower) ||
                    // Additional metadata
                    item.time.toLowerCase().includes(searchLower) ||
                    item.host.value.toLowerCase().includes(searchLower) ||
                    item.path.toLowerCase().includes(searchLower)
                );
            });
        }

        setFilteredItems(filtered);
    }, [debouncedSearch, items, filter]);

    return { filteredItems, searchTerm, setSearchTerm, filter, setFilter };
}
