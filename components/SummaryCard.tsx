"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlignLeft, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:scale-[1.01] transition-all duration-300 mt-6"
    >
      <div className="border-b border-white/10 pb-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
            <AlignLeft className="w-4 h-4 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-white m-0 tracking-wide">Summary Result</h2>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:text-white"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy Summary"}
        </button>
      </div>
      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-white prose-p:text-gray-300 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-li:text-gray-300 prose-strong:text-white">
        <ReactMarkdown>
          {summary}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}