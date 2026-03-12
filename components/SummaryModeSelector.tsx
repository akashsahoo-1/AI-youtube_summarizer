"use client";

interface Props {
  selectedMode: string;
  onSelect: (mode: string) => void;
  disabled?: boolean;
}

export const MODES = [
  { id: "short", label: "Short" },
  { id: "detailed", label: "Detailed" },
  { id: "bullets", label: "Bullet Points" },
  { id: "study", label: "Study Notes" },
  { id: "timestamp", label: "Timestamps" }
];

export default function SummaryModeSelector({ selectedMode, onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {MODES.map((mode) => {
        const isActive = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            disabled={disabled}
            onClick={() => onSelect(mode.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isActive 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                : "bg-zinc-900 border-zinc-800 text-gray-400 hover:bg-zinc-800 hover:text-gray-200 disabled:opacity-50 disabled:hover:bg-zinc-900"
            }`}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}