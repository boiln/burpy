"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BurpEntry } from "@/types/burp";
import { HarEntry } from "@/types/har";
import type { HighlightColor } from "@/types/burp";

interface SessionContextType {
    selectedEntry: BurpEntry | HarEntry | null;
    handleSelectEntry: (entry: BurpEntry | HarEntry) => void;
    handleHighlightEntry: (entry: BurpEntry | HarEntry, color: HighlightColor | null) => void;
    handleCommentEntry: (entry: BurpEntry | HarEntry, comment: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionContextProvider({ children }: { children: ReactNode }) {
    const [selectedEntry, setSelectedEntry] = useState<BurpEntry | HarEntry | null>(null);
    const [, setForceUpdate] = useState({});

    const handleSelectEntry = (entry: BurpEntry | HarEntry) => {
        setSelectedEntry(entry);
    };

    const handleHighlightEntry = (entry: BurpEntry | HarEntry, color: HighlightColor | null) => {
        if (color === null) {
            delete entry.highlight;
        } else {
            entry.highlight = color;
        }

        setForceUpdate({});
    };

    const handleCommentEntry = (entry: BurpEntry | HarEntry, comment: string) => {
        if (comment.trim() === "") {
            delete entry.comment;
        } else {
            entry.comment = comment;
        }

        setForceUpdate({});
    };

    return (
        <SessionContext.Provider
            value={{
                selectedEntry,
                handleSelectEntry,
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
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionContextProvider");
    }
    return context;
}
