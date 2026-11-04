import { motion } from 'framer-motion';
import { Music, ArrowUpRight, User, Disc } from 'lucide-react';
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
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, delay: Math.min(index * 0.04, 0.4) }}
      className="group w-full text-left bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Icon & Direct Link Arrow */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
            <Music size={18} className="text-zinc-700 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-950 group-hover:bg-zinc-100 transition-colors">
            <ArrowUpRight size={16} />
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-base text-zinc-950 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
          {mezmur.title}
        </h4>

        {/* Meta badges: Artist & Tune */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mb-4">
          <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded-md">
            <User size={11} className="text-zinc-400" />
            <span className="truncate max-w-[120px]">{mezmur.artist_name ?? 'Unknown artist'}</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded-md">
            <Disc size={11} className="text-zinc-400" />
            <span className="truncate max-w-[120px]">{mezmur.tune_name ?? 'Standard Tune'}</span>
          </span>
        </div>
      </div>

      {/* Bottom Difficulty Bar */}
      <div className="pt-3 border-t border-zinc-100">
        <DifficultyBar difficulty={mezmur.difficulty} />
      </div>
    </motion.button>
  );
}
