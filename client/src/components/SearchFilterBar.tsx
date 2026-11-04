import { Search, X } from 'lucide-react';
import type { GroupMode } from './CatalogueHero';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  groupMode: GroupMode;
  onGroupChange: (m: GroupMode) => void;
}

const modes: { key: GroupMode; label: string }[] = [
  { key: 'all', label: 'All Songs' },
  { key: 'artist', label: 'By Artist' },
  { key: 'tune', label: 'By Tune' },
];

export default function SearchFilterBar({
  query,
  onQueryChange,
  groupMode,
  onGroupChange,
}: Props) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-3 md:p-4 mb-8 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input Container */}
      <div className="relative flex-1 flex items-center">
        <Search size={16} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by song title, singer, tune..."
          className="w-full pl-10 pr-9 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 focus:bg-white transition-all"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3 text-zinc-400 hover:text-zinc-700"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Mode Switches */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs text-zinc-400 font-medium px-1 hidden sm:inline">Group:</span>
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onGroupChange(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                groupMode === m.key
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
