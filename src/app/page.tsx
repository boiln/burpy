import HomePage from "@/components/home-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Burpy",
    description: "HTTP request viewer",
};

export default function Home() {
    return <HomePage />;
}
