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
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mt-6 flex flex-col"
    >
      <h3 className="text-lg font-semibold text-white mb-4 text-left">Ask Questions About Video</h3>
      <div className="flex flex-col gap-6 mb-4 max-h-[400px] overflow-y-auto pr-2 text-left scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1 ${msg.role === "user" ? "bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg" : "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg"}`}>
                  {msg.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-3xl text-[15px] leading-relaxed shadow-md ${msg.role === "user" ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-[4px]" : "bg-white/10 text-gray-100 rounded-bl-[4px] border border-white/5 backdrop-blur-md"}`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full justify-start mt-2">
               <div className="flex items-center gap-3 bg-white/5 px-5 py-3.5 rounded-3xl rounded-bl-[4px] border border-white/5 text-gray-400 text-sm backdrop-blur-md shadow-sm">
                  <Bot className="w-4 h-4 animate-pulse text-indigo-400" />
                  <span className="tracking-wide animate-pulse">AI is typing...</span>
               </div>
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
        <button disabled={loading || !input.trim()} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shrink-0 shadow-lg">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
}
