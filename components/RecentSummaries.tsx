"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Clock } from "lucide-react";

export default function RecentSummaries({
  user,
  onSelect
}: {
  user: User | null;
  onSelect: (summary: any) => void;
}) {
  const [summaries, setSummaries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchSummaries = async () => {
      const { data } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (data) setSummaries(data);
    };
    fetchSummaries();

  }, [user]);

  if (!user || summaries.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 px-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-semibold text-white">Recent Summaries</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {summaries.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(item)}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/20">{item.mode}</span>
              </div>
              <p className="text-xs text-gray-400 font-medium truncate">{item.video_url}</p>
              <p className="text-gray-300 text-sm line-clamp-3">
                {item.summary.replace(/[#*]/g, '')}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
