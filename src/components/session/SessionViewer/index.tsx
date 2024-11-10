"use client";

import { SearchBar } from "../shared/SearchBar";
import { SessionTable } from "./SessionTable";
import { ContentPanel } from "./ContentPanel";
import { Pagination } from "../shared/Pagination";
import { useSessionSearch } from "~/hooks/session/useSessionSearch";
import { useSessionPagination } from "~/hooks/session/useSessionPagination";
import { useSelectedItem } from "~/hooks/session/useSelectedItem";
import { useState } from "react";
import type { SessionViewerProps } from "~/types/session";

export function SessionViewer({ session }: SessionViewerProps) {
    const { filteredItems, searchTerm, setSearchTerm } =
        useSessionSearch(session);
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
        <div className="flex flex-col h-screen px-4 md:px-6">
            <div className="py-6">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
                <SessionTable
                    items={currentItems}
                    selectedItem={selectedItem}
                    onSelectItem={setSelectedItem}
                />
                <Pagination {...pagination} />
                <div className="flex-grow bg-muted/30">
                    <div className="flex gap-4 p-4 h-full">
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
                    </div>
                </div>
            </div>
        </div>
    );
}
