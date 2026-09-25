import { Music } from 'lucide-react';
import type { MezmurListItem } from '../types';

export default function MezmurCardCompact({ mezmur, onClick }: { mezmur: MezmurListItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="liquid-glass rounded-card p-4 w-40 shrink-0 text-left snap-start"
    >
      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-3">
        <Music size={16} className="text-accent" />
      </div>
      <p className="text-white text-sm font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>
        {mezmur.title}
      </p>
      <p className="text-white/50 text-xs truncate mt-0.5">{mezmur.artist_name ?? mezmur.tune_name}</p>
    </button>
  );
}