import { Loader2 } from "lucide-react";

interface Props {
  text?: string;
}

export default function Loader({ text = "Generating summary..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-[#18181b] p-4 rounded-full border border-gray-800 shadow-xl mb-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
      <p className="text-gray-400 font-medium animate-pulse">{text}</p>
    </div>
  );
}
