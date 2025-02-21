"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { BurpEntry } from "@/types/burp";
import { HarEntry } from "@/types/har";
import type { HighlightColor } from "@/types/burp";

interface SessionContextType {
    selectedEntry: BurpEntry | HarEntry | null;
    selectedEntries: Set<BurpEntry | HarEntry>;
    handleSelectEntry: (entry: BurpEntry | HarEntry) => void;
    handleMultiSelectEntry: (
        entry: BurpEntry | HarEntry,
        mode: "single" | "ctrl" | "shift"
    ) => void;
    handleHighlightEntry: (entry: BurpEntry | HarEntry, color: HighlightColor | null) => void;
    handleCommentEntry: (entry: BurpEntry | HarEntry, comment: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionContextProvider({ children }: { children: ReactNode }) {
    const [isClient, setIsClient] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<BurpEntry | HarEntry | null>(null);
    const [selectedEntries, setSelectedEntries] = useState<Set<BurpEntry | HarEntry>>(new Set());
    const [lastSelectedEntry, setLastSelectedEntry] = useState<BurpEntry | HarEntry | null>(null);
    const [, setForceUpdate] = useState({});

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSelectEntry = (entry: BurpEntry | HarEntry) => {
        setSelectedEntry(entry);
        setSelectedEntries(new Set([entry]));
        setLastSelectedEntry(entry);
    };

    const handleMultiSelectEntry = (
        entry: BurpEntry | HarEntry,
        mode: "single" | "ctrl" | "shift"
    ) => {
        if (mode === "single") {
            setSelectedEntry(entry);
            setSelectedEntries(new Set([entry]));
            setLastSelectedEntry(entry);
        } else if (mode === "ctrl") {
            const newSelectedEntries = new Set(selectedEntries);
            if (newSelectedEntries.has(entry)) {
                newSelectedEntries.delete(entry);
            } else {
                newSelectedEntries.add(entry);
            }
            setSelectedEntries(newSelectedEntries);
            setSelectedEntry(entry);
            setLastSelectedEntry(entry);
        } else if (mode === "shift" && lastSelectedEntry) {
            // We'll handle the range selection in the table component
            setSelectedEntry(entry);
            setLastSelectedEntry(entry);
        }
    };

    const handleHighlightEntry = (entry: BurpEntry | HarEntry, color: HighlightColor | null) => {
        // Apply highlight to all selected entries if the target entry is selected
        if (selectedEntries.has(entry)) {
            selectedEntries.forEach((selectedEntry) => {
                if (color === null) {
                    delete selectedEntry.highlight;
                } else {
                    selectedEntry.highlight = color;
                }
            });
        } else {
            // If entry is not in selection, only apply to that entry
            if (color === null) {
                delete entry.highlight;
            } else {
                entry.highlight = color;
            }
        }
        setForceUpdate({});
    };

    const handleCommentEntry = (entry: BurpEntry | HarEntry, comment: string) => {
        // Apply comment to all selected entries if the target entry is selected
        if (selectedEntries.has(entry)) {
            selectedEntries.forEach((selectedEntry) => {
                if (comment.trim() === "") {
                    delete selectedEntry.comment;
                } else {
                    selectedEntry.comment = comment;
                }
            });
        } else {
            // If entry is not in selection, only apply to that entry
            if (comment.trim() === "") {
                delete entry.comment;
            } else {
                entry.comment = comment;
            }
        }
        setForceUpdate({});
    };

    return (
        <SessionContext.Provider
            value={{
                selectedEntry: isClient ? selectedEntry : null,
                selectedEntries: isClient ? selectedEntries : new Set(),
                handleSelectEntry,
                handleMultiSelectEntry,
                handleHighlightEntry,
                handleCommentEntry,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (typeof window === "undefined") {
        return {
            selectedEntry: null,
            selectedEntries: new Set(),
            handleSelectEntry: () => {},
            handleMultiSelectEntry: () => {},
            handleHighlightEntry: () => {},
            handleCommentEntry: () => {},
        };
    }
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionContextProvider");
    }
    return context;
}
