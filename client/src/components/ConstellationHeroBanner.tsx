import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music } from 'lucide-react';
import { useTonePlayer } from '../hooks/useTonePlayer';

export default function ConstellationHeroBanner() {
  const { pluckString } = useTonePlayer();
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const nodes = [
    { id: 1, label: '1', note: 'C3', x: 12, y: 56 },
    { id: 2, label: '2', note: 'D3', x: 28, y: 22 },
    { id: 3, label: '3', note: 'E3', x: 42, y: 70 },
    { id: 4, label: '4', note: 'G3', x: 68, y: 30 },
    { id: 5, label: '5', note: 'A3', x: 80, y: 75 },
  ];

  const handleNodeClick = (id: number) => {
    setActiveNode(id);
    pluckString(id);
    setTimeout(() => setActiveNode(null), 300);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-lg bg-zinc-950 text-white select-none">
      {/* Background image: Contextual sunset / constellation artwork */}
      <img
        src="/images/contextual-hero.jpg"
        alt="Begena constellation sunset artwork"
        className="w-full h-72 md:h-96 object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105"
      />

      {/* Subtle overlay gradient to ensure clean text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-medium text-white/90">Begena Notation Space</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs text-white/80">
          <Sparkles size={12} className="text-amber-300" />
          <span>Tap Stars to Pluck</span>
        </div>
      </div>

      {/* SVG Interactive Constellation overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Constellation connector lines */}
        <polyline
          points="12%,56% 28%,22% 42%,70% 68%,30% 80%,75% 92%,26%"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Interactive Constellation Nodes */}
      {nodes.map((node) => {
        const isActive = activeNode === node.id;
        return (
          <button
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 focus:outline-none"
            title={`Pluck String ${node.id} (${node.note})`}
          >
            {/* Glowing ring animation on active */}
            <motion.div
              animate={
                isActive
                  ? { scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }
                  : { scale: 1, opacity: 0.4 }
              }
              transition={{ duration: 0.5 }}
              className="absolute -inset-2 rounded-full bg-amber-400/40 pointer-events-none"
            />

            {/* Star Node Dot */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                isActive
                  ? 'bg-amber-400 text-zinc-950 border-white scale-125 shadow-lg'
                  : 'bg-white/90 text-zinc-900 border-white/80 group-hover:bg-amber-300 group-hover:scale-110 shadow'
              }`}
            >
              {node.label}
            </div>

            {/* Note tooltip badge */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap">
              {node.note}
            </div>
          </button>
        );
      })}

      {/* 4-Point Radiant Star at the end (from the Contextual artwork aesthetic) */}
      <div className="absolute left-[92%] top-[26%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="relative flex items-center justify-center"
        >
          {/* Diamond star glow */}
          <div className="w-8 h-8 rounded-full bg-amber-300/30 blur-md absolute" />
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
            <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom Text Content inside the Banner */}
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-8 right-4 md:right-8 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-1.5">
            <Music size={12} /> Liturgical Lyre of Ethiopia
          </span>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white max-w-xl">
            Numbers notation transformed into living sound.
          </h2>
        </div>
        <p className="text-xs md:text-sm text-white/70 max-w-xs leading-relaxed">
          Five standard strings. Instant pitch feedback. Authentic timing for every hymn.
        </p>
      </div>
    </div>
  );
}

