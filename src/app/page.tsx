"use client";

import { useEffect, useState, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { RequestTable } from "@/components/request-table";
import { RequestViewer } from "@/components/request-viewer";
import { ResponseViewer } from "@/components/response-viewer";
import FileUpload, { FileUploadRef } from "@/components/file-upload";
import { BurpSession } from "@/types/burp";

export default function Home() {
    const [session, setSession] = useState<BurpSession | null>(null);
    const fileUploadRef = useRef<FileUploadRef>(null);

    useEffect(() => {
        if (!session && fileUploadRef.current) {
            fileUploadRef.current.loadDemoFile();
        }
    }, [session]);

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header with file upload */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center px-4">
                    <div className="flex flex-1 items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-sm font-medium">HTTP Traffic Viewer</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <FileUpload ref={fileUploadRef} onSessionLoaded={setSession} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
                <ResizablePanelGroup
                    direction="vertical"
                    className="min-h-[calc(100vh-4rem)] rounded-lg border"
                >
                    <ResizablePanel defaultSize={35} minSize={30}>
                        <div className="h-full p-3">
                            <RequestTable session={session} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    <ResizablePanel defaultSize={40}>
                        <ResizablePanelGroup direction="horizontal">
                            <ResizablePanel defaultSize={50}>
                                <div className="h-full overflow-hidden">
                                    <div className="h-full">
                                        <RequestViewer />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle />

                            <ResizablePanel defaultSize={50}>
                                <div className="h-full overflow-hidden">
                                    <div className="h-full">
                                        <ResponseViewer />
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
