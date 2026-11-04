import { motion } from 'framer-motion';
import { Music, ArrowRight } from 'lucide-react';
import type { MezmurListItem } from '../types';

interface Props {
  mezmur: MezmurListItem;
  index: number;
  onClick: () => void;
}

export default function MezmurCardCompact({ mezmur, index, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, delay: index * 0.05 }}
      className="bg-white border border-zinc-200 hover:border-zinc-900 rounded-xl p-4 w-48 shrink-0 text-left snap-start shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-2.5 text-zinc-700">
          <Music size={14} className="text-amber-600" />
        </div>
        <p className="text-zinc-950 text-sm font-semibold truncate">
          {mezmur.title}
        </p>
        <p className="text-zinc-500 text-xs truncate mt-0.5">
          {mezmur.artist_name ?? mezmur.tune_name ?? 'Begena Hymn'}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
        <span>View Song</span>
        <ArrowRight size={12} className="text-zinc-400" />
      </div>
    </motion.button>
  );
}
