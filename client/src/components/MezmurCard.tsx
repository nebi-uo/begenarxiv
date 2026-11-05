import { motion } from 'framer-motion';
import { ArrowUpRight, Activity } from 'lucide-react';
import DifficultyBar from './DifficultyBar';
import type { MezmurListItem } from '../types';

interface Props {
  mezmur: MezmurListItem;
  index: number;
  onClick: () => void;
}

// 5 active plucking positions on the 10-string Begena
const ACTIVE_POSITIONS = [1, 2, 3, 4, 5] as const;

// Traditional note pitches per tuning mode for the 5 active positions
function getTuneNotes(tuneName: string | null): Record<number, string> {
  const lower = (tuneName || '').toLowerCase();
  if (lower.includes('selamta')) {
    return { 1: 'F', 2: 'C', 3: 'D', 4: 'A', 5: 'G' };
  }
  if (lower.includes('anchi')) {
    return { 1: 'F', 2: 'C', 3: 'C#', 4: 'A', 5: 'F#' };
  }
  // Default to Tizita
  return { 1: 'E', 2: 'C', 3: 'D', 4: 'A', 5: 'G' };
}

// Visual amplitude levels for the 5 strings (simulating harmonic registration)
const HARMONIC_BAR_LEVELS: Record<number, number> = {
  1: 4, // Deep fundamental resonance
  2: 2, // Low root
  3: 3, // Mid interval
  4: 4, // Dominant fifth / upper drone
  5: 3, // Upper scale step
};

export default function MezmurCard({ mezmur, index, onClick }: Props) {
  const notes = getTuneNotes(mezmur.tune_name);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.3) }}
      className="group w-full text-left bg-white border border-zinc-200 hover:border-black rounded-xl p-5 md:p-6 transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md"
    >
      <div>
        {/* Top Bar: Archival Catalog ID, Mode Badge & Interactive Action Indicator */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-black tracking-widest transition-colors">
              № {String(mezmur.id).padStart(3, '0')}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 group-hover:bg-black transition-colors" />
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200/80 group-hover:border-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              {mezmur.tune_name ?? 'Tizita'}
            </span>
          </div>

          <div className="w-7 h-7 rounded-md flex items-center justify-center border border-zinc-200 text-zinc-400 group-hover:text-white group-hover:border-black group-hover:bg-black transition-all duration-200 shrink-0">
            <ArrowUpRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>

        {/* Title & Artist Information */}
        <div className="mb-4">
          <h4 className="font-bold text-base md:text-lg text-zinc-950 group-hover:text-black tracking-tight line-clamp-1 mb-1 transition-colors">
            {mezmur.title}
          </h4>
          <p className="text-xs text-zinc-500 font-mono truncate">
            {mezmur.artist_name ? `by ${mezmur.artist_name}` : 'Traditional Begena Hymn'}
          </p>
        </div>

        {/* Cool 5-String Numbers Telemetry Strip (No Begena drawing, pure music instrumentation) */}
        <div className="bg-zinc-50/90 border border-zinc-200/80 group-hover:border-zinc-300 rounded-lg p-3 mb-4 transition-colors">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-2.5">
            <span className="tracking-wider uppercase font-semibold flex items-center gap-1">
              <Activity size={10} className="text-zinc-500 group-hover:text-black transition-colors" />
              5-STRING NOTATION KEY
            </span>
            <span className="text-zinc-500 font-medium">10-STR LYRE</span>
          </div>

          {/* 5 String Positions with Equalizer Harmonic Bars & Liturgical Pitches */}
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {ACTIVE_POSITIONS.map((pos) => {
              const barsCount = HARMONIC_BAR_LEVELS[pos];
              return (
                <div
                  key={pos}
                  className="flex flex-col items-center justify-between bg-white border border-zinc-200/70 group-hover:border-zinc-300 rounded p-1.5 transition-colors"
                >
                  <span className="text-[10px] font-mono font-bold text-zinc-700 group-hover:text-black">
                    [{pos}]
                  </span>

                  {/* Harmonic Resonance Equalizer Bars */}
                  <div className="flex flex-col-reverse items-center gap-[2px] my-1.5 h-6 justify-center">
                    {[1, 2, 3, 4].map((barIdx) => {
                      const isActive = barIdx <= barsCount;
                      return (
                        <span
                          key={barIdx}
                          className={`w-3.5 h-[3px] rounded-[1px] transition-all duration-200 ${
                            isActive
                              ? 'bg-zinc-800 group-hover:bg-black'
                              : 'bg-zinc-100 group-hover:bg-zinc-200'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <span className="text-[10px] font-mono font-bold text-zinc-600 group-hover:text-black bg-zinc-50 px-1 py-0.5 rounded w-full border border-zinc-100">
                    {notes[pos]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer: Difficulty Meter and Study Score CTA */}
      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
        <DifficultyBar difficulty={mezmur.difficulty} />
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-400 group-hover:text-black transition-colors">
          <span>STUDY SCORE</span>
          <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.button>
  );
}
