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
    <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-1 block">
            DIGITAL NOTATION ARCHIVE
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950">
            Mezmur Repertoire
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">
            Transcriptions with synchronized numbers notation and tap-to-hear audio.
          </p>

          <div className="flex items-center gap-3 mt-4 text-xs font-mono text-zinc-500">
            <span>{total} Songs</span>
            <span>/</span>
            <span>{artistCount} Artists</span>
            <span>/</span>
            <span>{tuneCount} Tunes</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRandom}
          className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono px-3.5 py-2 rounded-md transition-colors cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Shuffle size={12} />
          <span>Random Song</span>
        </motion.button>
      </div>
    </div>
  );
}
