import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "~/components/ThemeProvider";
import "~/app/globals.css";
import "~/app/prism.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Burpy",
    description: "View burp suite saved sessions",
    icons: {
        icon: "favicon.ico",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="favicon.ico" sizes="any" />
            </head>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
