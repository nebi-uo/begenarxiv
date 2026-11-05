import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';

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
    <div className="bg-white border border-zinc-200 rounded-lg p-5 sm:p-6 md:p-8 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Mezmur Repertoire
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">
            Mezmur lyrics and numbers you can actually hear, tap by tap, string by string.
          </p>

          <div className="flex items-center gap-2.5 mt-3 text-xs font-mono text-zinc-500">
            <span>{total} Mezmurs</span>
            <span>·</span>
            <span>{artistCount} Artists</span>
            <span>·</span>
            <span>{tuneCount} Tuning Modes</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRandom}
          className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono px-3.5 py-2 rounded transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <Shuffle size={12} />
          <span>Random Mezmur</span>
        </motion.button>
      </div>
    </div>
  );
}
