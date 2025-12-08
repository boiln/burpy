"use client";

import { useEffect, useCallback, useRef } from "react";

import { useSession } from "@/lib/session-context";

/**
 * Hook to count search matches and handle navigation between them.
 */
export const useSearchNavigation = () => {
    const {
        searchTerm,
        currentMatchIndex,
        totalMatches,
        setTotalMatches,
        navigateToNextMatch,
        navigateToPrevMatch,
    } = useSession();

    const lastCountRef = useRef(0);
    const searchTermRef = useRef(searchTerm);

    useEffect(() => {
        if (searchTerm !== searchTermRef.current) {
            searchTermRef.current = searchTerm;
            lastCountRef.current = 0;
            if (!searchTerm || searchTerm.length < 2) {
                setTotalMatches(0);
            }
        }
    }, [searchTerm, setTotalMatches]);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) return;

        const countMatches = () => {
            const matches = document.querySelectorAll("mark.search-match");
            if (matches.length > 0 && matches.length !== lastCountRef.current) {
                lastCountRef.current = matches.length;
                setTotalMatches(matches.length);
            }
        };

        const interval = setInterval(countMatches, 200);
        setTimeout(countMatches, 100);

        return () => clearInterval(interval);
    }, [searchTerm, setTotalMatches]);

    useEffect(() => {
        if (totalMatches === 0) return;

        const matches = document.querySelectorAll("mark.search-match");
        if (matches.length === 0) return;

        matches.forEach((match) => match.classList.remove("search-match-active"));

        const currentMatch = matches[currentMatchIndex];
        if (currentMatch) {
            currentMatch.classList.add("search-match-active");
            currentMatch.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
        }
    }, [currentMatchIndex, totalMatches]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "F3" || ((e.ctrlKey || e.metaKey) && e.key === "g")) {
                e.preventDefault();
                if (e.shiftKey) {
                    navigateToPrevMatch();
                } else {
                    navigateToNextMatch();
                }
            }
            if (e.key === "Enter" && (e.target as HTMLElement)?.tagName === "INPUT") {
                e.preventDefault();
                if (e.shiftKey) {
                    navigateToPrevMatch();
                } else {
                    navigateToNextMatch();
                }
            }
        },
        [navigateToNextMatch, navigateToPrevMatch]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return {
        currentMatchIndex,
        totalMatches,
        navigateToNextMatch,
        navigateToPrevMatch,
    };
};
