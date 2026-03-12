import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI YouTube Summarizer",
    description: "Summarize YouTube videos with AI instantly",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[#0a0a0a] text-gray-100 min-h-screen font-sans antialiased selection:bg-indigo-500/30">
                {children}
            </body>
        </html>
    );
}