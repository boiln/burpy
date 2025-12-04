import { JetBrains_Mono , Inter } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";

import { ErrorBoundary } from "~/src/components/error-boundary";

import type { Metadata } from "next";

import "@/styles/globals.css";
import "@/styles/prism.css";
import "@/styles/resizable-panels.css";
import { SessionContextProvider } from "@/lib/session-context";

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Burpy",
    description: "HTTP request viewer",
    icons: {
        icon: "favicon.ico",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="favicon.ico" sizes="any" />
            </head>
            <body className={`${jetbrainsMono.variable} antialiased ${inter.className}`}>
                <SessionContextProvider>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        <TooltipProvider>
                            <ErrorBoundary>{children}</ErrorBoundary>
                        </TooltipProvider>
                    </ThemeProvider>
                </SessionContextProvider>
            </body>
        </html>
    );
}
