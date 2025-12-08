"use client";

import { useEffect, useState, useRef } from "react";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

import FileUpload, { FileUploadRef } from "@/components/file-upload";
import { RequestTable } from "@/components/request-table";
import { RequestViewer } from "@/components/request-viewer";
import { ResponseViewer } from "@/components/response-viewer";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearch } from "@/hooks/use-search";
import { useSearchNavigation } from "@/hooks/use-search-navigation";
import { useSession } from "@/lib/session-context";
import { BurpSession } from "@/types/burp";
import { HarSession } from "@/types/har";

type Session = BurpSession | HarSession;

export default function Home() {
    const [session, setSession] = useState<Session | null>(null);
    const fileUploadRef = useRef<FileUploadRef>(null);
    const { searchTerm, setSearchTerm } = useSession();

    const [inputValue, setInputValue] = useState(searchTerm);
    const debouncedInputValue = useDebounce(inputValue, 200);

    // Show spinner while debounce is pending
    const isDebouncing = inputValue !== debouncedInputValue;

    useEffect(() => {
        setSearchTerm(debouncedInputValue);
    }, [debouncedInputValue, setSearchTerm]);

    useEffect(() => {
        if (searchTerm === "" && inputValue !== "") {
            setInputValue("");
        }
    }, [searchTerm]);

    const { filteredEntries } = useSearch(session?.entries || []);
    const { currentMatchIndex, totalMatches, navigateToNextMatch, navigateToPrevMatch } =
        useSearchNavigation();

    useEffect(() => {
        if (!session && fileUploadRef.current) {
            fileUploadRef.current.loadDemoFile();
        }
    }, [session]);

    const handleSessionLoaded = (newSession: Session) => {
        setSession(newSession);
    };

    const filteredSession = session ? ({ ...session, entries: filteredEntries } as Session) : null;

    return (
        <div className="flex h-screen flex-col">
            {/* Header with file upload */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center px-4">
                    <div className="flex flex-1 items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-sm font-medium">Burpy</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Search Input with Navigation */}
                            <div className="flex items-center">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search requests..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="h-9 w-64 rounded-r-none pl-8 pr-8 font-mono text-sm"
                                    />
                                    {inputValue && (
                                        <button
                                            onClick={() => setInputValue("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    {isDebouncing && (
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                                        </div>
                                    )}
                                </div>
                                {/* Match count and navigation */}
                                {searchTerm && searchTerm.length >= 2 && (
                                    <div className="flex h-9 items-center border border-l-0 border-input bg-background px-2">
                                        <span className="min-w-[60px] text-center text-xs text-muted-foreground">
                                            {totalMatches > 0
                                                ? `${currentMatchIndex + 1}/${totalMatches}`
                                                : "0/0"}
                                        </span>
                                        <div className="ml-1 flex">
                                            <button
                                                onClick={navigateToPrevMatch}
                                                disabled={totalMatches === 0}
                                                className="rounded p-0.5 hover:bg-accent disabled:opacity-50"
                                                title="Previous match (Shift+Enter)"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={navigateToNextMatch}
                                                disabled={totalMatches === 0}
                                                className="rounded p-0.5 hover:bg-accent disabled:opacity-50"
                                                title="Next match (Enter)"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <FileUpload ref={fileUploadRef} onSessionLoaded={handleSessionLoaded} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="vertical" className="h-full rounded-lg border">
                    <ResizablePanel defaultSize={35} minSize={30}>
                        <div className="h-full p-3">
                            <RequestTable session={filteredSession} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    <ResizablePanel defaultSize={40}>
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={50}>
                                <div className="h-full overflow-hidden">
                                    <RequestViewer />
                                </div>
                            </ResizablePanel>

                            <ResizableHandle />

                            <ResizablePanel defaultSize={50}>
                                <div className="h-full overflow-hidden">
                                    <ResponseViewer />
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
