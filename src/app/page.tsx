"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { RequestTable } from "@/components/request-table";
import { RequestViewer } from "@/components/request-viewer";
import { ResponseViewer } from "@/components/response-viewer";
import FileUpload, { FileUploadRef } from "@/components/file-upload";
import { useSession } from "@/lib/session-context";
import { useSearch } from "@/hooks/use-search";
import { BurpSession } from "@/types/burp";
import { HarSession } from "@/types/har";

type Session = BurpSession | HarSession;

export default function Home() {
    const [session, setSession] = useState<Session | null>(null);
    const fileUploadRef = useRef<FileUploadRef>(null);
    const { searchTerm, setSearchTerm } = useSession();
    const { filteredEntries, isSearching } = useSearch(session?.entries || []);

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
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 w-64 pl-8 pr-8 font-mono text-sm"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                                {isSearching && (
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
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
