import { Music, ChevronRight } from 'lucide-react';
import DifficultyBar from './DifficultyBar';
import type { MezmurListItem } from '../types';

export default function MezmurCard({ mezmur, onClick }: { mezmur: MezmurListItem; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left liquid-glass rounded-card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
          <Music size={18} className="text-accent" />
        </div>
        <ChevronRight size={16} className="text-white/40" />
      </div>
      <p className="text-white font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>
        {mezmur.title}
      </p>
      <p className="text-white/60 text-sm truncate mt-0.5">
        {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
      </p>
      <div className="mt-auto pt-3">
        <DifficultyBar difficulty={mezmur.difficulty} />
      </div>
    </button>
  );
}