"use client";

import { useState } from "react";

import { FileUpload } from "@/components/FileUpload";
import { SessionViewer } from "@/components/session/SessionViewer";
import { Toaster } from "@/components/ui/toaster";
import { BurpSession } from "@/types/burp";

export default function Home() {
    const [session, setSession] = useState<BurpSession | null>(null);

    return (
        <main className="min-h-screen bg-background">
            <div className={!session ? "flex h-screen items-center justify-center" : ""}>
                {!session ? (
                    <FileUpload onSessionLoaded={setSession} />
                ) : (
                    <SessionViewer session={session} />
                )}
            </div>
            <Toaster />
        </main>
    );
}
