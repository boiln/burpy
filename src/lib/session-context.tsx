"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useCallback,
    useRef,
} from "react";

import type { BurpEntry, HighlightColor } from "@/types/burp";
import type { HarEntry } from "@/types/har";

interface SessionContextType {
    selectedEntry: BurpEntry | HarEntry | null;
    selectedEntries: Set<BurpEntry | HarEntry>;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    currentMatchIndex: number;
    totalMatches: number;
    setCurrentMatchIndex: (index: number) => void;
    setTotalMatches: (count: number) => void;
    navigateToNextMatch: () => void;
    navigateToPrevMatch: () => void;
    handleSelectEntry: (entry: BurpEntry | HarEntry) => void;
    handleMultiSelectEntry: (
        entry: BurpEntry | HarEntry,
        mode: "single" | "ctrl" | "shift"
    ) => void;
    handleHighlightEntry: (entry: BurpEntry | HarEntry, color: HighlightColor | null) => void;
    handleCommentEntry: (entry: BurpEntry | HarEntry, comment: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
    const [isClient, setIsClient] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<BurpEntry | HarEntry | null>(null);
    const [selectedEntries, setSelectedEntries] = useState<Set<BurpEntry | HarEntry>>(new Set());
    const [lastSelectedEntry, setLastSelectedEntry] = useState<BurpEntry | HarEntry | null>(null);
    const [searchTerm, setSearchTermState] = useState("");
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [totalMatchesState, setTotalMatchesInternal] = useState(0);
    const [, setForceUpdate] = useState({});

    const totalMatchesRef = useRef(0);
    const prevSearchTermRef = useRef("");

    const setTotalMatches = useCallback((count: number) => {
        totalMatchesRef.current = count;
        setTotalMatchesInternal(count);
    }, []);

    const setSearchTerm = useCallback((term: string) => {
        // Only reset counts if the term actually changed
        if (term !== prevSearchTermRef.current) {
            prevSearchTermRef.current = term;
            setSearchTermState(term);
            setCurrentMatchIndex(0);
            // Don't reset totalMatches here - let the navigation hook handle it
        }
    }, []);

    const navigateToNextMatch = useCallback(() => {
        const total = totalMatchesRef.current;
        if (total === 0) return;
        setCurrentMatchIndex((prev) => (prev + 1) % total);
    }, []);

    const navigateToPrevMatch = useCallback(() => {
        const total = totalMatchesRef.current;
        if (total === 0) return;
        setCurrentMatchIndex((prev) => (prev - 1 + total) % total);
    }, []);

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
            return;
        }

        if (mode === "ctrl") {
            const newSelectedEntries = new Set(selectedEntries);

            if (newSelectedEntries.has(entry)) {
                newSelectedEntries.delete(entry);
            } else {
                newSelectedEntries.add(entry);
            }

            setSelectedEntries(newSelectedEntries);
            setSelectedEntry(entry);
            setLastSelectedEntry(entry);
            return;
        }

        if (mode === "shift" && lastSelectedEntry) {
            setSelectedEntry(entry);
            setLastSelectedEntry(entry);
        }
    };

    const handleHighlightEntry = (entry: BurpEntry | HarEntry, color: HighlightColor | null) => {
        if (selectedEntries.has(entry)) {
            selectedEntries.forEach((selectedEntry) => {
                if (color === null) {
                    delete selectedEntry.highlight;
                    return;
                }

                selectedEntry.highlight = color;
            });
        } else {
            if (color === null) {
                delete entry.highlight;
            } else {
                entry.highlight = color;
            }
        }

        setForceUpdate({});
    };

    const handleCommentEntry = (entry: BurpEntry | HarEntry, comment: string) => {
        if (selectedEntries.has(entry)) {
            selectedEntries.forEach((selectedEntry) => {
                if (comment.trim() === "") {
                    delete selectedEntry.comment;
                    return;
                }

                selectedEntry.comment = comment;
            });
        } else {
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
                searchTerm,
                setSearchTerm,
                currentMatchIndex,
                totalMatches: totalMatchesState,
                setCurrentMatchIndex,
                setTotalMatches,
                navigateToNextMatch,
                navigateToPrevMatch,
                handleSelectEntry,
                handleMultiSelectEntry,
                handleHighlightEntry,
                handleCommentEntry,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);

    if (
        typeof window === "undefined" ||
        (typeof window !== "undefined" && typeof window.document === "undefined")
    ) {
        return {
            selectedEntry: null,
            selectedEntries: new Set(),
            searchTerm: "",
            setSearchTerm: () => {},
            currentMatchIndex: 0,
            totalMatches: 0,
            setCurrentMatchIndex: () => {},
            setTotalMatches: () => {},
            navigateToNextMatch: () => {},
            navigateToPrevMatch: () => {},
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
};
