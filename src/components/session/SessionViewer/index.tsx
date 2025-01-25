"use client";

import { useState } from "react";

import { useSelectedItem } from "@/hooks/session/useSelectedItem";
import { useSessionSearch } from "@/hooks/session/useSessionSearch";
import { useContentFormat } from "@/hooks/session/useContentFormat";
import type { SessionViewerProps } from "@/types/session";

import { SearchBar } from "../shared/SearchBar";

import { ContentPanel } from "./ContentPanel";
import { SessionTable } from "./SessionTable";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BurpItem } from "@/types/burp";
import { TooltipProvider } from "@/components/ui/tooltip";

export function SessionViewer({ session }: SessionViewerProps) {
    const [items, setItems] = useState<BurpItem[]>(session.items);
    const { filteredItems, searchTerm, setSearchTerm, filter, setFilter } = useSessionSearch(items);
    const { selectedItem, setSelectedItem } = useSelectedItem();

    const {
        format: requestFormat,
        setWrap: setRequestWrap,
        setPrettify: setRequestPrettify,
    } = useContentFormat();
    const {
        format: responseFormat,
        setWrap: setResponseWrap,
        setPrettify: setResponsePrettify,
    } = useContentFormat();

    const handleUpdateItem = (updatedItem: BurpItem) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.url === updatedItem.url && item.time === updatedItem.time ? updatedItem : item
            )
        );
    };

    return (
        <TooltipProvider>
            <div className="flex h-screen flex-col">
                <div className="border-b p-4">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        filter={filter}
                        onFilterChange={setFilter}
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                        {filteredItems.length} requests
                    </div>
                </div>
                <ResizablePanelGroup direction="vertical" className="flex-1">
                    <ResizablePanel defaultSize={40} minSize={20}>
                        <div className="h-full overflow-hidden">
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
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={50}>
                                <ContentPanel
                                    item={selectedItem}
                                    type="request"
                                    wrap={requestFormat.wrap}
                                    setWrap={setRequestWrap}
                                    prettify={requestFormat.prettify}
                                    setPrettify={setRequestPrettify}
                                />
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={50}>
                                <ContentPanel
                                    item={selectedItem}
                                    type="response"
                                    wrap={responseFormat.wrap}
                                    setWrap={setResponseWrap}
                                    prettify={responseFormat.prettify}
                                    setPrettify={setResponsePrettify}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </TooltipProvider>
    );
}
