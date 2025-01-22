"use client";

import { Search, Paintbrush2, MessageCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SearchBarProps, FilterType, FilterOption } from "@/types/session";

const filterOptions: FilterOption[] = [
    {
        value: "all",
        label: "All Requests",
        icon: Search,
    },
    {
        value: "highlighted",
        label: "Highlighted",
        icon: Paintbrush2,
    },
    {
        value: "commented",
        label: "Commented",
        icon: MessageCircle,
    },
];

export function SearchBar({ value, onChange, filter, onFilterChange }: SearchBarProps) {
    return (
        <div className="flex gap-1">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input
                    placeholder="Search"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-7 pl-7 text-xs"
                />
            </div>
            <Select value={filter} onValueChange={onFilterChange}>
                <SelectTrigger className="h-7 w-[140px] text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {filterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                <option.icon className="h-4 w-4" />
                                <span>{option.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
