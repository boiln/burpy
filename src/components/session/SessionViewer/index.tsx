"use client";

import { useState } from "react";

import { useSelectedItem } from "@/hooks/session/useSelectedItem";
import { useSessionPagination } from "@/hooks/session/useSessionPagination";
import { useSessionSearch } from "@/hooks/session/useSessionSearch";
import type { SessionViewerProps } from "@/types/session";

import { SearchBar } from "../shared/SearchBar";

import { ContentPanel } from "./ContentPanel";
import { SessionTable } from "./SessionTable";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BurpItem } from "@/types/burp";

export function SessionViewer({ session }: SessionViewerProps) {
    const [items, setItems] = useState<BurpItem[]>(session.items);
    const { filteredItems, searchTerm, setSearchTerm, filter, setFilter } = useSessionSearch(items);
    const { selectedItem, setSelectedItem } = useSelectedItem();

    const [requestFormat, setRequestFormat] = useState({
        wrap: true,
        prettify: true,
    });

    const [responseFormat, setResponseFormat] = useState({
        wrap: true,
        prettify: true,
    });

    const handleUpdateItem = (updatedItem: BurpItem) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.url === updatedItem.url && item.time === updatedItem.time ? updatedItem : item
            )
        );
    };

    return (
        <div className="flex h-screen flex-col px-4 md:px-6">
            <div className="flex h-full max-h-screen flex-col py-6">
                <ResizablePanelGroup direction="vertical" className="h-full rounded-lg border">
                    <ResizablePanel defaultSize={40} minSize={20} maxSize={80}>
                        <div className="h-full space-y-4 p-4">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                filter={filter}
                                onFilterChange={setFilter}
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {filteredItems.length} requests
                                </p>
                            </div>
                            <SessionTable
                                items={filteredItems}
                                selectedItem={selectedItem}
                                onSelectItem={setSelectedItem}
                                onUpdateItem={handleUpdateItem}
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
