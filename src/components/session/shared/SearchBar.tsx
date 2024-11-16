"use client";

import { Input } from "@/components/ui/input";
import type { SearchBarProps } from "@/types/session";

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="mb-4">
            <Input
                placeholder="Search .."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="max-w-sm"
            />
        </div>
    );
}
