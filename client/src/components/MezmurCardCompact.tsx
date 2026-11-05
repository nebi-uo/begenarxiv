import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className="group bg-white border border-zinc-200 hover:border-black rounded-lg p-3.5 w-44 shrink-0 text-left snap-start transition-colors cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-end text-[10px] font-mono text-zinc-400 mb-1.5">
          <ArrowUpRight size={12} className="group-hover:text-black transition-colors" />
        </div>
        <p className="text-zinc-950 text-xs font-semibold truncate group-hover:text-black">
          {mezmur.title}
        </p>
        <p className="text-zinc-500 font-mono text-[10px] truncate mt-0.5">
          {mezmur.artist_name || mezmur.tune_name || 'Traditional'}
        </p>
      </div>
    </motion.button>
  );
}
