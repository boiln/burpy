import { useState, useMemo } from "react";

import type { BurpItem } from "~/types/burp";

const ITEMS_PER_PAGE = 1000;

export function useSessionPagination(items: BurpItem[]) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return items.slice(start, start + ITEMS_PER_PAGE);
    }, [items, currentPage]);

    return {
        currentItems,
        pagination: {
            currentPage,
            totalPages,
            itemsPerPage: ITEMS_PER_PAGE,
            totalItems: items.length,
            onPageChange: setCurrentPage,
        },
    };
}
