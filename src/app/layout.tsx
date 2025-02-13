import { JetBrains_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import type { Metadata } from "next";

import "@/app/globals.css";
import "@/app/prism.css";

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    // Include regular and medium weights for better readability
    weight: ["400", "500"],
    // Enable variable font for better performance
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "Burpy",
    description: "HTTP session viewer",
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
            <body className={`${jetbrainsMono.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    <TooltipProvider>
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
