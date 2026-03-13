"use client";

import { motion } from "framer-motion";

interface Props {
  selectedMode: string;
  onSelect: (mode: string) => void;
  disabled?: boolean;
}

export const MODES = [
  { id: "short", label: "Short Summary" },
  { id: "detailed", label: "Detailed Summary" },
  { id: "bullets", label: "Bullet Notes" },
  { id: "study", label: "Study Notes" }
];

export default function SummaryModeSelector({ selectedMode, onSelect, disabled }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap gap-3 justify-center mb-8"
    >
      {MODES.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            disabled={disabled}
            onClick={() => onSelect(mode.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
              isActive 
                ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-105" 
                : "bg-zinc-900 border-zinc-700 text-gray-300 hover:border-zinc-500 hover:text-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:border-zinc-700 disabled:hover:text-gray-300"
            }`}
          >
            {mode.label}
          </button>
        );
      })}
    </motion.div>
  );
}