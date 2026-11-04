import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="bg-white border border-zinc-200 hover:border-zinc-950 rounded-lg p-3.5 w-44 shrink-0 text-left snap-start transition-colors cursor-pointer flex flex-col justify-between"
    >
      <div>
        <span className="text-[9px] font-mono text-zinc-400 block mb-1">HYMN</span>
        <p className="text-zinc-950 text-xs font-semibold truncate">
          {mezmur.title}
        </p>
        <p className="text-zinc-500 font-mono text-[10px] truncate mt-0.5">
          {mezmur.artist_name ?? mezmur.tune_name ?? 'Begena Hymn'}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span>OPEN</span>
        <ArrowRight size={11} />
      </div>
    </motion.button>
  );
}
