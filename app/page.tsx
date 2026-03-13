"use client";

import UrlInputForm from "@/components/UrlInputForm";
import { Youtube } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white relative">
            
            <div className="w-full max-w-5xl flex justify-end absolute top-0 p-6 md:p-8 right-0 z-10">
                <AuthButton />
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto px-6 py-12 space-y-10"
            >
                
                <div className="flex flex-col items-center text-center gap-6 mt-16 pt-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/10"
                    >
                        <Youtube className="w-8 h-8 text-red-500" />
                    </motion.div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        AI YouTube Summarizer
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl">
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