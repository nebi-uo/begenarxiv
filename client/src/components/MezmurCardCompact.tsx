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
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group bg-white border border-zinc-200 hover:border-black rounded-lg p-3.5 w-48 shrink-0 text-left snap-start transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-sm"
    >
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 group-hover:text-black mb-1.5 transition-colors">
          <span className="font-bold">№ {String(mezmur.id).padStart(3, '0')}</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
            {mezmur.tune_name ?? 'Tizita'}
          </span>
        </div>
        <p className="text-zinc-950 text-xs font-bold truncate group-hover:text-black">
          {mezmur.title}
        </p>
        <p className="text-zinc-500 font-mono text-[10px] truncate mt-0.5">
          {mezmur.artist_name ?? 'Traditional'}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400 group-hover:text-black transition-colors">
        <span>SCORE</span>
        <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.button>
  );
}
