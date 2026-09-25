import { motion } from 'framer-motion';
import { Music, ChevronRight } from 'lucide-react';
import DifficultyBar from './DifficultyBar';
import type { MezmurListItem } from '../types';

interface Props {
  mezmur: MezmurListItem;
  index: number;
  onClick: () => void;
}

export default function MezmurRow({ mezmur, index, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left liquid-glass rounded-card p-4 flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <Music size={18} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-white font-medium truncate" style={{ fontFamily: 'var(--font-display)' }}>
            {mezmur.title}
          </p>
          <ChevronRight size={16} className="text-white/50 shrink-0" />
        </div>
        <p className="text-white/60 text-sm truncate">
          {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Unknown tune'}
        </p>
        <DifficultyBar difficulty={mezmur.difficulty} />
      </div>
    </motion.button>
  );
}