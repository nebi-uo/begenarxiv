import { motion } from 'framer-motion';
import { LayoutGrid, User, Music2, Shuffle } from 'lucide-react';

export type GroupMode = 'all' | 'artist' | 'tune';

interface Props {
  total: number;
  artistCount: number;
  tuneCount: number;
  groupMode: GroupMode;
  onGroupChange: (mode: GroupMode) => void;
  onRandom: () => void;
}

const actions = [
  { key: 'all' as const, label: 'All', icon: LayoutGrid },
  { key: 'artist' as const, label: 'Artist', icon: User },
  { key: 'tune' as const, label: 'Tune', icon: Music2 },
  { key: 'random' as const, label: 'Random', icon: Shuffle },
];

export default function CatalogueHero({ total, artistCount, tuneCount, groupMode, onGroupChange, onRandom }: Props) {
  return (
    <div className="liquid-glass rounded-card p-10 mb-12 text-white">
      <p className="text-white/60 text-sm mb-2">Explore</p>
      <p className="text-l mb-8" style={{ fontFamily: 'var(--font-display)' }}>
        {total} mezmurs · {artistCount} artists · {tuneCount} tunes
      </p>
      <div className="flex justify-between">
        {actions.map(({ key, label, icon: Icon }) => {
          const active = key === groupMode;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              onClick={() => (key === 'random' ? onRandom() : onGroupChange(key))}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  active ? 'bg-accent' : 'bg-white/15'
                }`}
              >
                <Icon size={18} color="white" />
              </div>
              <span className="text-xs text-white/70">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}