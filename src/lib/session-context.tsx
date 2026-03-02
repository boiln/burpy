"use client";

import { createContext, useContext, useReducer, ReactNode, useCallback } from "react";

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

interface SessionState {
    selectedEntry: BurpEntry | HarEntry | null;
    selectedEntries: Set<BurpEntry | HarEntry>;
    lastSelectedEntry: BurpEntry | HarEntry | null;
    searchTerm: string;
    currentMatchIndex: number;
    totalMatches: number;
    updateVersion: number;
}

type SessionAction =
    | { type: "select-entry"; entry: BurpEntry | HarEntry }
    | { type: "multi-select-ctrl"; entry: BurpEntry | HarEntry }
    | { type: "multi-select-shift"; entry: BurpEntry | HarEntry }
    | { type: "set-search-term"; term: string }
    | { type: "set-current-match-index"; index: number }
    | { type: "set-total-matches"; count: number }
    | { type: "navigate-next" }
    | { type: "navigate-prev" }
    | { type: "force-update" };

const initialState: SessionState = {
    selectedEntry: null,
    selectedEntries: new Set(),
    lastSelectedEntry: null,
    searchTerm: "",
    currentMatchIndex: 0,
    totalMatches: 0,
    updateVersion: 0,
};

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
    switch (action.type) {
        case "select-entry":
            return {
                ...state,
                selectedEntry: action.entry,
                selectedEntries: new Set([action.entry]),
                lastSelectedEntry: action.entry,
            };

        case "multi-select-ctrl": {
            const newSelectedEntries = new Set(state.selectedEntries);

            if (newSelectedEntries.has(action.entry)) {
                newSelectedEntries.delete(action.entry);
            } else {
                newSelectedEntries.add(action.entry);
            }

            return {
                ...state,
                selectedEntries: newSelectedEntries,
                selectedEntry: action.entry,
                lastSelectedEntry: action.entry,
            };
        }

        case "multi-select-shift":
            return {
                ...state,
                selectedEntry: action.entry,
                lastSelectedEntry: action.entry,
            };

        case "set-search-term":
            if (action.term === state.searchTerm) {
                return state;
            }

            return {
                ...state,
                searchTerm: action.term,
                currentMatchIndex: 0,
            };

        case "set-current-match-index":
            return {
                ...state,
                currentMatchIndex: action.index,
            };

        case "set-total-matches":
            return {
                ...state,
                totalMatches: action.count,
            };

        case "navigate-next":
            if (state.totalMatches === 0) {
                return state;
            }

            return {
                ...state,
                currentMatchIndex: (state.currentMatchIndex + 1) % state.totalMatches,
            };

        case "navigate-prev":
            if (state.totalMatches === 0) {
                return state;
            }

            return {
                ...state,
                currentMatchIndex:
                    (state.currentMatchIndex - 1 + state.totalMatches) % state.totalMatches,
            };

        case "force-update":
            return {
                ...state,
                updateVersion: state.updateVersion + 1,
            };

        default:
            return state;
    }
};

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(sessionReducer, initialState);

    const setTotalMatches = useCallback((count: number) => {
        dispatch({ type: "set-total-matches", count });
    }, []);

    const setSearchTerm = useCallback((term: string) => {
        dispatch({ type: "set-search-term", term });
    }, []);

    const setCurrentMatchIndex = useCallback((index: number) => {
        dispatch({ type: "set-current-match-index", index });
    }, []);

    const navigateToNextMatch = useCallback(() => {
        dispatch({ type: "navigate-next" });
    }, []);

    const navigateToPrevMatch = useCallback(() => {
        dispatch({ type: "navigate-prev" });
    }, []);

    const handleSelectEntry = (entry: BurpEntry | HarEntry) => {
        dispatch({ type: "select-entry", entry });
    };

    const handleMultiSelectEntry = (
        entry: BurpEntry | HarEntry,
        mode: "single" | "ctrl" | "shift"
    ) => {
        if (mode === "single") {
            dispatch({ type: "select-entry", entry });
            return;
        }

        if (mode === "ctrl") {
            dispatch({ type: "multi-select-ctrl", entry });
            return;
        }

        if (mode === "shift" && state.lastSelectedEntry) {
            dispatch({ type: "multi-select-shift", entry });
        }
    };

    const handleHighlightEntry = (entry: BurpEntry | HarEntry, color: HighlightColor | null) => {
        if (state.selectedEntries.has(entry)) {
            state.selectedEntries.forEach((selectedEntry) => {
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

        dispatch({ type: "force-update" });
    };

    const handleCommentEntry = (entry: BurpEntry | HarEntry, comment: string) => {
        if (state.selectedEntries.has(entry)) {
            state.selectedEntries.forEach((selectedEntry) => {
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

        dispatch({ type: "force-update" });
    };

    return (
        <SessionContext.Provider
            value={{
                selectedEntry: state.selectedEntry,
                selectedEntries: state.selectedEntries,
                searchTerm: state.searchTerm,
                setSearchTerm,
                currentMatchIndex: state.currentMatchIndex,
                totalMatches: state.totalMatches,
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
