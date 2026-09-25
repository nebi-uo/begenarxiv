import { motion } from 'framer-motion';
import { Music, ChevronRight } from 'lucide-react';
import DifficultyBar from './DifficultyBar';
import type { MezmurListItem } from '../types';

interface Props {
  mezmur: MezmurListItem;
  index: number;
  onClick: () => void;
}

export default function MezmurCard({ mezmur, index, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.05 }}
      className="w-full text-left liquid-glass rounded-card p-5 h-full flex flex-col"
    >
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
    </motion.button>
  );
}