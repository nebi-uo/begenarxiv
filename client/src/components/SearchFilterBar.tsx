import { Search } from 'lucide-react';
import type { GroupMode } from './CatalogueHero';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  groupMode: GroupMode;
  onGroupChange: (m: GroupMode) => void;
}

const modes: { key: GroupMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'artist', label: 'Artist' },
  { key: 'tune', label: 'Tune' },
];

export default function SearchFilterBar({ query, onQueryChange, groupMode, onGroupChange }: Props) {
  return (
    <div className="liquid-glass rounded-card p-3 mb-8 flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 flex-1 px-3">
        <Search size={16} className="text-white/50 shrink-0" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search mezmurs, artists, tunes..."
          className="bg-transparent text-white placeholder:text-white/40 text-sm w-full outline-none py-2"
        />
      </div>
      <div className="flex gap-1 bg-white/5 rounded-pill p-1 self-start sm:self-center">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => onGroupChange(m.key)}
            className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors ${
              groupMode === m.key ? 'bg-white text-ink' : 'text-white/60'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}