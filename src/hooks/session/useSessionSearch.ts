import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { BurpSession, BurpItem } from "@/types/burp";

export function useSessionSearch(session: BurpSession) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<BurpItem[]>(session.items);
    const debouncedSearch = useDebounce(searchTerm, 300);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        console.log("Initializing search worker");
        // Create worker from public directory
        workerRef.current = new Worker("/workers/search.worker.js");

        // Initialize the search index
        console.log("Sending items to worker:", session.items.length);
        workerRef.current.postMessage({
            type: "initialize",
            payload: session.items,
        });

        // Handle worker messages
        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            console.log("Received message from worker:", type);
            if (type === "searchResults") {
                console.log("Setting filtered items:", payload.length);
                setFilteredItems(payload);
            }
        };

        // Handle worker errors
        workerRef.current.onerror = (error) => {
            console.error("Worker error:", error);
        };

        return () => {
            console.log("Cleaning up worker");
            workerRef.current?.terminate();
        };
    }, [session.items]);

    useEffect(() => {
        if (!workerRef.current) return;

        console.log("Sending search request:", debouncedSearch);
        workerRef.current.postMessage({
            type: "search",
            payload: debouncedSearch,
        });
    }, [debouncedSearch]);

    return { filteredItems, searchTerm, setSearchTerm };
}
