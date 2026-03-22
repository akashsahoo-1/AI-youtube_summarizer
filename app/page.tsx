"use client";

import UrlInputForm from "@/components/UrlInputForm";
import { Youtube } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-indigo-900 text-white relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent)] hover:before:bg-transparent before:transition-all before:duration-1000">
            
            <div className="relative z-10 pt-6 px-6">
                <div className="w-full max-w-5xl mx-auto flex justify-between items-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-6 py-3">
                    <div className="flex items-center gap-2">
                        <Youtube className="w-6 h-6 text-red-500" />
                        <span className="font-bold text-lg tracking-wide">Summarizer AI</span>
                    </div>
                    <AuthButton />
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center space-y-10"
            >
                
                <div className="flex flex-col items-center text-center gap-6 mt-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                    >
                        <Youtube className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent leading-tight">
                        AI YouTube Summarizer
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                        Paste a YouTube video and generate instant AI summaries. Extract knowledge in seconds.
                    </p>
                </div>

                <div className="w-full">
                    <UrlInputForm />
                </div>

            </motion.div>
        </main>
    );
}