"use client";

import { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import SummaryModeSelector, { MODES } from "./SummaryModeSelector";
import Loader from "./Loader";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";

function getVideoId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}

export default function UrlInputForm() {

    const [url, setUrl] = useState("");
    const [mode, setMode] = useState(MODES[0].id);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

        return () => subscription.unsubscribe();

    }, []);

    const videoId = getVideoId(url);

    async function handleSummarize(e?: React.FormEvent) {

        if (e) e.preventDefault();

        if (!url.trim()) {
            setError("Please paste a valid YouTube URL");
            return;
        }

        if (!user) {
            setError("Please login with Google to summarize videos.");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setSummary("");

            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                    mode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to summarize video");
            }

            setSummary(data.summary);

        } catch (err) {

            console.error(err);

            const message =
                err instanceof Error ? err.message : "Something went wrong";

            setError(message);

        } finally {

            setLoading(false);

        }

    }

    return (

        <div className="w-full flex flex-col items-center">

            {/* URL INPUT */}

            <form
                onSubmit={handleSummarize}
                className="w-full mb-8 relative group"
            >

                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                <div className="relative flex items-center bg-zinc-900 border border-zinc-700/50 rounded-full p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-2xl">

                    <Search className="w-6 h-6 text-gray-400 mx-4" />

                    <input
                        type="url"
                        placeholder="Paste YouTube Video URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-grow bg-transparent border-none text-white text-lg h-12 outline-none placeholder-gray-500"
                        disabled={loading}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="bg-white text-black hover:bg-gray-200 h-10 md:h-12 px-6 md:px-8 rounded-full font-semibold text-sm md:text-md ml-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {loading ? "Generating..." : "Summarize"}
                    </button>

                </div>

            </form>

            {/* VIDEO PREVIEW */}

            <div className="w-full max-w-4xl">

                {videoId && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8 w-full p-2 rounded-2xl border border-zinc-800 shadow-2xl bg-zinc-900"
                    >

                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="w-full h-[380px] rounded-xl border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                    </motion.div>
                )}

                {/* SUMMARY MODES */}

                <SummaryModeSelector
                    selectedMode={mode}
                    onSelect={setMode}
                    disabled={loading}
                />

                {/* ERROR */}

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center shadow-lg"
                    >
                        {error}
                    </motion.div>
                )}

                {/* LOADING */}

                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8"
                    >
                        <Loader text="Analyzing video and generating summary..." />
                    </motion.div>
                )}

                {/* SUMMARY */}

                {!loading && summary && (
                    <div className="mt-2">
                        <SummaryCard summary={summary} />
                    </div>
                )}

            </div>

        </div>

    );

}