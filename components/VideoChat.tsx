"use client";

import { useState } from "react";
import { Send, User as UserIcon, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoChat({ url }: { url: string }) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, history: newMessages }),
      });
      const data = await res.json();
      if (res.ok && data.answer) {
        setMessages([...newMessages, { role: "assistant", content: data.answer }]);
      } else {
        throw new Error(data.error);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Error answering question. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mt-6 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 text-left">Ask Questions About Video</h3>
      <div className="flex flex-col gap-4 mb-4 max-h-80 overflow-y-auto pr-2 text-left">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-purple-500/20 text-purple-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-purple-500/10 text-purple-100 rounded-tr-none border border-purple-500/20" : "bg-white/5 text-gray-300 rounded-tl-none border border-white/10"}`}>
                {msg.content}
              </div>
             </motion.div>
          ))}
          {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-indigo-400 text-sm italic">
                <Bot className="w-4 h-4 animate-pulse" /> AI is thinking...
             </motion.div>
          )}
        </AnimatePresence>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this video..."
          disabled={loading}
          className="flex-grow bg-black/40 backdrop-blur border border-white/10 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button disabled={loading || !input.trim()} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-xl hover:scale-[1.05] transition-transform disabled:opacity-50 disabled:hover:scale-100 shrink-0">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
