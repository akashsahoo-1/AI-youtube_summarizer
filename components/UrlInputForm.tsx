"use client";

import { useEffect, useState, useRef } from "react";
import SummaryCard from "./SummaryCard";
import SummaryModeSelector, { MODES } from "./SummaryModeSelector";
import Loader from "./Loader";
import RecentSummaries from "./RecentSummaries";
import VideoChat from "./VideoChat";
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
    const [metadata, setMetadata] = useState<{title: string, author: string, thumbnail: string} | null>(null);
    const [isEstimated, setIsEstimated] = useState(false);
    const [length, setLength] = useState("Medium");
    const [language, setLanguage] = useState("English");
    const summaryRef = useRef<HTMLDivElement>(null);

    const handleReset = () => {
        setUrl("");
        setSummary("");
        setError("");
        setIsEstimated(false);
    };

    const loadFromHistory = (item: any) => {
        setUrl(item.video_url);
        setSummary(item.summary);
        setMode(item.mode);
        setError("");
        setIsEstimated(false);
        setTimeout(() => {
             summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

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

    useEffect(() => {
        if (videoId) {
            fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                .then(res => res.json())
                .then(data => {
                    if (data.title) {
                        setMetadata({ title: data.title, author: data.author_name, thumbnail: data.thumbnail_url });
                    } else {
                        setMetadata(null);
                    }
                })
                .catch(() => setMetadata(null));
        } else {
            setMetadata(null);
        }
    }, [videoId]);

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
            setIsEstimated(false);

            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                    mode,
                    length,
                    language,
                    allowFallback: true,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to summarize video");
            }

            setSummary(data.summary);
            setIsEstimated(data.isEstimated || false);
            
            setTimeout(() => {
                summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            if (user) {
                try {
                    await supabase.from('summaries').insert([
                        {
                            user_id: user.id,
                            video_url: url,
                            summary: data.summary,
                            mode: mode
                        }
                    ]);
                } catch (e) {
                    console.error("Failed to save summary to DB", e);
                }
            }

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

                <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-[0_0_30px_rgba(168,85,247,0.2)] focus-within:ring-2 focus-within:ring-purple-500 transition-all">

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
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:scale-105 h-10 md:h-12 px-6 md:px-8 rounded-full font-semibold text-sm md:text-md ml-2 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                        {loading ? "Generating..." : "Summarize"}
                    </button>

                </div>

            </form>

            {!url && !loading && !summary && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => setUrl("https://www.youtube.com/watch?v=aircAruvnKk")}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors hover:scale-105"
                    >
                        Try Demo Video
                    </button>
                </motion.div>
            )}

            {/* VIDEO PREVIEW */}

            <div className="w-full max-w-4xl">

                {videoId && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8 w-full p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl flex flex-col gap-3"
                    >

                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="w-full h-[380px] rounded-xl border-none mb-2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                        {metadata && (
                            <div className="flex bg-black/20 rounded-xl p-3 items-center gap-4 text-left border border-white/5">
                                {metadata.thumbnail && (
                                    <div className="flex-shrink-0">
                                        <img src={metadata.thumbnail} alt={metadata.title} className="w-16 h-auto rounded-lg shadow-sm border border-white/10" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight">{metadata.title}</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">{metadata.author}</p>
                                </div>
                            </div>
                        )}

                    </motion.div>
                )}

                {/* SUMMARY MODES & SETTINGS */}

                <div className="flex flex-col gap-4 items-center mb-8">
                    <SummaryModeSelector
                        selectedMode={mode}
                        onSelect={setMode}
                        disabled={loading}
                    />

                    <div className="flex flex-wrap gap-4 items-center justify-center">
                        <select 
                            value={length} 
                            onChange={(e) => setLength(e.target.value)} 
                            disabled={loading}
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block px-4 py-3 shadow-md transition-all outline-none cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <option value="Short">Short Length</option>
                            <option value="Medium">Medium Length</option>
                            <option value="Long">Long Length</option>
                        </select>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            disabled={loading}
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block px-4 py-3 shadow-md transition-all outline-none cursor-pointer hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="German">German</option>
                        </select>
                    </div>
                </div>

                {/* EMPTY STATE */}

                {!videoId && !loading && !error && !summary && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-400 text-center mt-10"
                    >
                        <p>Paste a YouTube link to generate an AI summary</p>
                    </motion.div>
                )}

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
                        <Loader />
                    </motion.div>
                )}

                {/* SUMMARY */}

                <div ref={summaryRef} className="w-full">
                    {!loading && summary && (
                        <div className="mt-2 flex flex-col items-center">
                            <SummaryCard summary={summary} isEstimated={isEstimated} />
                            
                            <VideoChat url={url} />

                            <div className="flex gap-4 mt-8 mb-8">
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={(e) => handleSummarize(e)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/40 hover:to-indigo-500/40 border border-purple-500/30 rounded-full text-purple-300 font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                    🔄 Regenerate
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    onClick={handleReset}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 font-semibold transition-all duration-300 hover:scale-105"
                                >
                                    Clear
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <RecentSummaries user={user} onSelect={loadFromHistory} />

        </div>

    );

}