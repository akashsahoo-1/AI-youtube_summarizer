"use client";

import ReactMarkdown from 'react-markdown';
import { AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  if (!summary) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden mt-6"
    >
      <div className="border-b border-zinc-800/80 bg-zinc-900/50 px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          <AlignLeft className="w-4 h-4 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-white m-0 tracking-wide">Summary Result</h2>
      </div>
      <div className="p-6 md:p-8 prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-white prose-p:text-gray-300 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-li:text-gray-300 prose-strong:text-white">
        <ReactMarkdown>
          {summary}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}