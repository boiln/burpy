"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { BurpEntry } from "@/types/burp";

type SessionContextType = {
    session: {
        entries: BurpEntry[];
    };
    selectedEntry: BurpEntry | null;
    handleSelectEntry: (entry: BurpEntry) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionContextProvider({ children }: { children: ReactNode }) {
    const [entries] = useState<BurpEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<BurpEntry | null>(null);

    const handleSelectEntry = (entry: BurpEntry) => {
        setSelectedEntry(entry);
    };

    return (
        <SessionContext.Provider
            value={{
                session: { entries },
                selectedEntry,
                handleSelectEntry,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionContextProvider");
    }
    return context;
}
