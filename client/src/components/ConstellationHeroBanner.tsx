import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTonePlayer } from '../hooks/useTonePlayer';

export default function ConstellationHeroBanner() {
  const { pluckString } = useTonePlayer('Tizita');
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // Tizita tuning: 1=E, 2=C, 3=D, 4=A, 5=G
  const nodes = [
    { id: 1, label: '1', note: 'E3', hz: '164.8 Hz', x: 14, y: 55 },
    { id: 2, label: '2', note: 'C3', hz: '130.8 Hz', x: 30, y: 26 },
    { id: 3, label: '3', note: 'D3', hz: '146.8 Hz', x: 48, y: 72 },
    { id: 4, label: '4', note: 'A3', hz: '220.0 Hz', x: 68, y: 32 },
    { id: 5, label: '5', note: 'G3', hz: '196.0 Hz', x: 84, y: 68 },
  ];

  const handleNodeClick = (id: number) => {
    setActiveNode(id);
    pluckString(id);
    setTimeout(() => setActiveNode(null), 300);
  };

  return (
    <div className="relative w-full rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 md:p-10 select-none overflow-hidden">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-zinc-200 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          <span className="font-medium text-zinc-900">TIZITA NOTATION MAP</span>
          <span className="text-zinc-400">/ 10 STRINGS</span>
        </div>
        <span className="text-[11px] text-zinc-400">INTERACTIVE PREVIEW</span>
      </div>

      <div className="relative w-full h-48 md:h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polyline
            points="14%,55% 30%,26% 48%,72% 68%,32% 84%,68% 95%,30%"
            fill="none"
            stroke="#D4D4D8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {nodes.map((node) => {
          const isActive = activeNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              title={`Pluck String ${node.id} (${node.note})`}
            >
              {isActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -inset-2 rounded-full border border-zinc-900 pointer-events-none"
                />
              )}

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white border-2 border-zinc-900 scale-110 shadow-sm'
                    : 'bg-white text-zinc-900 border border-zinc-300 group-hover:border-zinc-900 shadow-xs'
                }`}
              >
                {node.label}
              </div>

              <div className="absolute top-9 left-1/2 -translate-x-1/2 font-mono text-[10px] text-zinc-500 whitespace-nowrap opacity-80 group-hover:opacity-100 group-hover:text-zinc-900">
                {node.note} · {node.hz}
              </div>
            </button>
          );
        })}

        <div className="absolute left-[95%] top-[30%] -translate-x-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-6 border-t border-zinc-200 text-xs text-zinc-500 font-mono">
        <span>Click any node to test string frequency</span>
        <span>Tizita Mode: 1=E · 2=C · 3=D · 4=A · 5=G</span>
      </div>
    </div>
  );
}
