"use client";

import { useState } from "react";
import { FileUpload } from "~/components/FileUpload";
import { SessionViewer } from "~/components/session/SessionViewer";
import { BurpSession } from "~/types/burp";
import { Toaster } from "~/components/ui/toaster";

export default function Home() {
    const [session, setSession] = useState<BurpSession | null>(null);

    return (
        <main className="min-h-screen bg-background p-4">
            <div
                className={
                    !session ? "h-screen flex items-center justify-center" : ""
                }
            >
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
