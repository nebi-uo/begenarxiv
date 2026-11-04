import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import DifficultyBar from './DifficultyBar';
import PixelBegena from './PixelBegena';
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      className="group w-full text-left bg-white border border-zinc-200 hover:border-zinc-950 rounded-xl p-5 transition-all flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-950 transition-colors">
            <PixelBegena size="icon" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              HYMN #{mezmur.id}
            </span>
          </div>
          <ArrowUpRight size={14} className="text-zinc-400 group-hover:text-zinc-950 transition-colors" />
        </div>

        <h4 className="font-semibold text-sm md:text-base text-zinc-950 line-clamp-1 mb-1.5">
          {mezmur.title}
        </h4>

        <p className="text-xs text-zinc-500 font-mono truncate mb-4">
          {mezmur.artist_name ?? 'Unknown artist'} · {mezmur.tune_name ?? 'Standard Tune'}
        </p>
      </div>

      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
        <DifficultyBar difficulty={mezmur.difficulty} />
      </div>
    </motion.button>
  );
}
