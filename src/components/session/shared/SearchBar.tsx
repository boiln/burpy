"use client";

import { Search, Paintbrush2, MessageCircle, ListFilter } from "lucide-react";
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
        icon: ListFilter,
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
        <div className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2">
            <div className="flex flex-1 items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search .."
                    className="h-8 border-0 p-0 text-sm shadow-none focus:outline-none focus-visible:ring-0"
                />
            </div>
            <Select value={filter} onValueChange={onFilterChange}>
                <SelectTrigger
                    className="h-8 w-[140px] border-0 bg-transparent text-sm hover:bg-transparent 
                    focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
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
