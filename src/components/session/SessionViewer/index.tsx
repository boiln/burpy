"use client";

import { useState } from "react";

import { useSelectedItem } from "@/hooks/session/useSelectedItem";
import { useSessionPagination } from "@/hooks/session/useSessionPagination";
import { useSessionSearch } from "@/hooks/session/useSessionSearch";
import type { SessionViewerProps } from "@/types/session";

import { Pagination } from "../shared/Pagination";
import { SearchBar } from "../shared/SearchBar";

import { ContentPanel } from "./ContentPanel";
import { SessionTable } from "./SessionTable";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export function SessionViewer({ session }: SessionViewerProps) {
    const { filteredItems, searchTerm, setSearchTerm } = useSessionSearch(session);
    const { currentItems, pagination } = useSessionPagination(filteredItems);
    const { selectedItem, setSelectedItem } = useSelectedItem();

    const [requestFormat, setRequestFormat] = useState({
        wrap: true,
        prettify: true,
    });

    const [responseFormat, setResponseFormat] = useState({
        wrap: true,
        prettify: true,
    });

    return (
        <div className="flex h-screen flex-col px-4 md:px-6">
            <div className="flex h-full max-h-screen flex-col py-6">
                <ResizablePanelGroup direction="vertical" className="h-full rounded-lg border">
                    <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
                        <div className="h-full space-y-4 p-4">
                            <SearchBar value={searchTerm} onChange={setSearchTerm} />
                            <SessionTable
                                items={currentItems}
                                selectedItem={selectedItem}
                                onSelectItem={setSelectedItem}
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={60}>
                        <ResizablePanelGroup direction="horizontal" className="h-full">
                            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                                <ContentPanel
                                    item={selectedItem}
                                    type="request"
                                    wrap={requestFormat.wrap}
                                    setWrap={(wrap) =>
                                        setRequestFormat((prev) => ({ ...prev, wrap }))
                                    }
                                    prettify={requestFormat.prettify}
                                    setPrettify={(prettify) => {
                                        setRequestFormat((prev) => ({
                                            ...prev,
                                            prettify,
                                        }));
                                    }}
                                />
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                                <ContentPanel
                                    item={selectedItem}
                                    type="response"
                                    wrap={responseFormat.wrap}
                                    setWrap={(wrap) =>
                                        setResponseFormat((prev) => ({ ...prev, wrap }))
                                    }
                                    prettify={responseFormat.prettify}
                                    setPrettify={(prettify) => {
                                        setResponseFormat((prev) => ({
                                            ...prev,
                                            prettify,
                                        }));
                                    }}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
