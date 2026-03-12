import ReactMarkdown from 'react-markdown';
import { AlignLeft } from 'lucide-react';

interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="w-full bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl mt-6">
      <div className="border-b border-zinc-800 bg-black/40 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
          <AlignLeft className="w-4 h-4 text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-100 m-0">Summary Result</h2>
      </div>
      <div className="p-6 md:p-8 prose prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
        <ReactMarkdown>
          {summary}
        </ReactMarkdown>
      </div>
    </div>
  );
}