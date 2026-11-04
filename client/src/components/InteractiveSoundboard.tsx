import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import { useTonePlayer, STRING_FREQUENCIES, ROLL_OFFSET_SEC } from '../hooks/useTonePlayer';

interface DemoStep {
  position: number;
  durationMs: number;
  isOrnament?: boolean;
}

const SAMPLE_DEMO_SEQUENCE: DemoStep[] = [
  { position: 1, durationMs: 450 },
  { position: 3, durationMs: 450 },
  { position: 2, durationMs: 450 },
  { position: 4, durationMs: 350 },
  { position: 2, durationMs: 350 },
  { position: 1, durationMs: 500 },
  // Ornament roll: 4 then 2 fast
  { position: 4, durationMs: 250, isOrnament: true },
  { position: 2, durationMs: 250, isOrnament: true },
  { position: 1, durationMs: 650 },
];

export default function InteractiveSoundboard() {
  const { pluckString } = useTonePlayer();
  const [activeString, setActiveString] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [currentDemoIndex, setCurrentDemoIndex] = useState<number | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRequestedRef = useRef(false);

  const handlePluck = useCallback(
    (position: number) => {
      setActiveString(position);
      pluckString(position);
      setTimeout(() => {
        setActiveString((current) => (current === position ? null : current));
      }, 250);
    },
    [pluckString]
  );

  // Keyboard shortcut listener: keys 1 to 5
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const pos = parseInt(e.key, 10);
        handlePluck(pos);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePluck]);

  const stopDemo = useCallback(() => {
    stopRequestedRef.current = true;
    setIsPlayingDemo(false);
    setCurrentDemoIndex(null);
    setActiveString(null);
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
  }, []);

  const playDemo = useCallback(() => {
    stopRequestedRef.current = false;
    setIsPlayingDemo(true);

    const runStep = (index: number) => {
      if (stopRequestedRef.current || index >= SAMPLE_DEMO_SEQUENCE.length) {
        setIsPlayingDemo(false);
        setCurrentDemoIndex(null);
        setActiveString(null);
        return;
      }

      const step = SAMPLE_DEMO_SEQUENCE[index];
      setCurrentDemoIndex(index);
      setActiveString(step.position);
      pluckString(step.position, step.durationMs);

      const nextDelay = step.isOrnament ? ROLL_OFFSET_SEC * 1000 + 150 : step.durationMs;
      demoTimeoutRef.current = setTimeout(() => {
        runStep(index + 1);
      }, nextDelay);
    };

    runStep(0);
  }, [pluckString]);

  useEffect(() => {
    return () => {
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 md:p-7 shadow-sm">
      {/* Top Header of Soundboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-semibold text-zinc-950 text-sm md:text-base tracking-tight">
              Interactive Begena Soundboard
            </h3>
            <span className="text-[11px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md border border-zinc-200">
              Web Audio Synthesizer
            </span>
          </div>
          <p className="text-zinc-500 text-xs mt-1">
            Tap any string or press keys <kbd className="px-1 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-mono text-[10px] text-zinc-800">1</kbd> to <kbd className="px-1 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-mono text-[10px] text-zinc-800">5</kbd> on your keyboard.
          </p>
        </div>

        {/* Quick Demo Play/Stop Button */}
        <button
          onClick={isPlayingDemo ? stopDemo : playDemo}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            isPlayingDemo
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          {isPlayingDemo ? (
            <>
              <Square size={12} className="fill-current" /> Stop Demo
            </>
          ) : (
            <>
              <Play size={12} className="fill-current text-amber-600" /> Auto-Play Roll Sample
            </>
          )}
        </button>
      </div>

      {/* Strings Row Visualizer */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 py-6">
        {[1, 2, 3, 4, 5].map((pos) => {
          const info = STRING_FREQUENCIES[pos];
          const isActive = activeString === pos;

          return (
            <motion.button
              key={pos}
              onClick={() => handlePluck(pos)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className={`relative flex flex-col items-center justify-between p-3 md:p-5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70 hover:border-zinc-300'
              }`}
            >
              {/* String Number Pill */}
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm md:text-base transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-zinc-900 border border-zinc-200'
                }`}
              >
                {pos}
              </div>

              {/* Plucked String Line Graphic */}
              <div className="w-full flex items-center justify-center py-5 md:py-8">
                <motion.div
                  animate={
                    isActive
                      ? {
                          scaleX: [1, 2.5, 0.7, 1.8, 1],
                          backgroundColor: ['#D97706', '#B45309', '#D97706'],
                        }
                      : { scaleX: 1, backgroundColor: '#D4D4D8' }
                  }
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-0.5 md:w-1 h-14 md:h-20 rounded-full"
                />
              </div>

              {/* Note Name & Frequency */}
              <div className="text-center">
                <span className="block font-bold text-xs md:text-sm text-zinc-900">
                  {info.note}
                </span>
                <span className="block font-mono text-[10px] text-zinc-400 mt-0.5">
                  {info.hz} Hz
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Demo Roll Preview Banner */}
      <AnimatePresence>
        {isPlayingDemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-2"
          >
            <div className="bg-zinc-900 text-white rounded-xl p-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Volume2 size={14} className="text-amber-400 animate-pulse" />
                <span>PLAYING DEMO SEQUENCE:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {SAMPLE_DEMO_SEQUENCE.map((s, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        currentDemoIndex === idx
                          ? 'bg-amber-500 text-zinc-950 font-bold scale-110'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {s.position}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">35ms fast rolls</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
