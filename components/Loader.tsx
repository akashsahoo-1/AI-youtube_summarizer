"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  text?: string;
}

const defaultSteps = [
  "Fetching transcript...",
  "Analyzing video content...",
  "Generating AI summary..."
];

export default function Loader({ text }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (text) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % defaultSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [text]);

  const displayText = text || defaultSteps[stepIndex];

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
      <div className="h-6 relative w-full flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={displayText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400 font-medium tracking-wide absolute"
          >
            {displayText}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
