import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
      className="group w-full text-left bg-white border border-zinc-200 hover:border-black rounded-xl p-5 transition-colors cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-end text-xs font-mono text-zinc-400 mb-2">
          <ArrowUpRight
            size={14}
            className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>

        <h3 className="font-semibold text-base text-zinc-950 group-hover:text-black line-clamp-1 mb-1">
          {mezmur.title}
        </h3>

        <p className="text-xs text-zinc-500 font-mono truncate">
          {mezmur.artist_name || 'Traditional'} · {mezmur.tune_name ?? 'Tizita'}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono">
        <DifficultyBar difficulty={mezmur.difficulty} />
        {mezmur.contributor_name && mezmur.contributor_name.toLowerCase() !== 'begenarxiv' ? (
          <span className="text-zinc-600 truncate max-w-[120px]" title={`Contributed by ${mezmur.contributor_name}`}>
            by {mezmur.contributor_name}
          </span>
        ) : (
          <span className="text-zinc-400">Begenarxiv</span>
        )}
      </div>
    </motion.button>
  );
}
