import { BurpSession, BurpItem } from "@/types/burp";

export interface SessionViewerProps {
    session: BurpSession;
}

export interface SessionTableProps {
    items: BurpItem[];
    selectedItem: BurpItem | null;
    onSelectItem: (item: BurpItem) => void;
    onUpdateItem: (item: BurpItem) => void;
}

export interface ContentPanelProps {
    item: BurpItem | null;
    type: "request" | "response";
    wrap: boolean;
    setWrap: (wrap: boolean) => void;
    prettify: boolean;
    setPrettify: (prettify: boolean) => void;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export type FilterType = "all" | "highlighted" | "commented";

export interface FilterOption {
    value: FilterType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    filter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}
