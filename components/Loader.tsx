"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  text?: string;
}

const defaultSteps = [
  "Fetching transcript...",
  "Analyzing video content...",
  "Generating AI summary...",
  "Almost done..."
];

export default function Loader({ text }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (text) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % defaultSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [text]);

  const displayText = text || defaultSteps[stepIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center my-8"
    >
      <div className="bg-zinc-900/60 backdrop-blur-lg border border-zinc-800 rounded-2xl p-10 shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center min-w-[320px]">
        
        {/* Animated Gradient Spinner Container */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-8">
          
          {/* Subtle Pulse Background Animation */}
          <motion.div 
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 blur-2xl rounded-full"
          />

          {/* Outer Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-purple-500 border-r-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          />

          {/* Inner Counter-Rotating Ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-2.5 rounded-full border-[3px] border-transparent border-l-pink-500 border-b-purple-400 opacity-80"
          />

          {/* Core Glow Dot */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#fff]"
          />

        </div>

        {/* Animated Text */}
        <div className="h-6 relative w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.p 
              key={displayText}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="text-gray-300 font-medium tracking-wide absolute text-center text-sm md:text-base w-full bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent"
            >
              {displayText}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
