import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { GroupMode } from './CatalogueHero';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  groupMode: GroupMode;
  onGroupChange: (m: GroupMode) => void;
}

const modes: { key: GroupMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'artist', label: 'By Artist' },
  { key: 'tune', label: 'By Tune' },
];

export default function SearchFilterBar({
  query,
  onQueryChange,
  groupMode,
  onGroupChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Press "/" to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1 flex items-center">
        <Search size={14} className="absolute left-3 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search hymns, artists, tunes... (Press / to focus)"
          className="w-full pl-9 pr-8 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors font-mono"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-2.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Mode Switches */}
      <div className="flex items-center gap-1 font-mono text-xs">
        <span className="text-zinc-400 text-[10px] uppercase mr-1 hidden sm:inline">Group:</span>
        <div className="flex bg-zinc-100 p-0.5 rounded border border-zinc-200">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onGroupChange(m.key)}
              className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                groupMode === m.key
                  ? 'bg-zinc-950 text-white font-medium'
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
