"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  text?: string;
}

export default function Loader({ text = "Analyzing video and generating summary..." }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
        <div className="relative bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-xl flex items-center justify-center overflow-hidden">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 font-medium tracking-wide animate-pulse"
      >
        {text}
      </motion.p>
    </motion.div>
  );
}
