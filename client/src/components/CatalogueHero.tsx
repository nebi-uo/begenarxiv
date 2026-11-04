import { motion } from 'framer-motion';
import { Shuffle, Sparkles } from 'lucide-react';

export type GroupMode = 'all' | 'artist' | 'tune';

interface Props {
  total: number;
  artistCount: number;
  tuneCount: number;
  onRandom: () => void;
}

export default function CatalogueHero({
  total,
  artistCount,
  tuneCount,
  onRandom,
}: Props) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 mb-8 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Header and Metrics */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 text-zinc-700 border border-zinc-200 mb-2">
            <Sparkles size={11} className="text-amber-500" />
            <span>Digital Notation Archive</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
            Mezmur Song Catalogue
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Browse authentic transcriptions with synchronized numbers and tap-to-hear audio.
          </p>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-4 mt-4 text-xs font-medium text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-950 text-sm">{total}</span> Songs Available
            </span>
            <span className="text-zinc-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-950 text-sm">{artistCount}</span> Artists
            </span>
            <span className="text-zinc-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-950 text-sm">{tuneCount}</span> Musical Modes
            </span>
          </div>
        </div>

        {/* Random Song Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRandom}
          className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Shuffle size={14} className="text-amber-400" />
          <span>Random Song</span>
        </motion.button>
      </div>
    </div>
  );
}
