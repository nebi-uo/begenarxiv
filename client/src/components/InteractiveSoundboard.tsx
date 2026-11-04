import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import { useTonePlayer, type BegenaTuneMode, BEGENA_TUNINGS, ROLL_OFFSET_SEC } from '../hooks/useTonePlayer';

interface DemoStep {
  position: number;
  durationMs: number;
  isOrnament?: boolean;
}

const SAMPLE_DEMO_SEQUENCE: DemoStep[] = [
  { position: 1, durationMs: 400 },
  { position: 3, durationMs: 400 },
  { position: 2, durationMs: 400 },
  { position: 4, durationMs: 300 },
  { position: 2, durationMs: 300 },
  { position: 1, durationMs: 450 },
  // Fast roll ornament (42)
  { position: 4, durationMs: 200, isOrnament: true },
  { position: 2, durationMs: 200, isOrnament: true },
  { position: 1, durationMs: 600 },
];

interface Props {
  initialMode?: BegenaTuneMode;
}

export default function InteractiveSoundboard({ initialMode = 'Tizita' }: Props) {
  const [mode, setMode] = useState<BegenaTuneMode>(initialMode);
  const { pluckString, currentTuning } = useTonePlayer(mode);
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
      }, 220);
    },
    [pluckString]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
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

      const nextDelay = step.isOrnament ? ROLL_OFFSET_SEC * 1000 + 140 : step.durationMs;
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

  const modes: BegenaTuneMode[] = ['Tizita', 'Selamta', 'Anchi-Hoye'];

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-5 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-950" />
            <h3 className="font-semibold text-zinc-950 text-sm md:text-base tracking-tight">
              10-String Begena Audio Board
            </h3>
            <span className="pixel-tag-blue">
              MODE: {mode.toUpperCase()}
            </span>
          </div>
          <p className="text-zinc-500 text-xs mt-1">
            Tap string pads or press keyboard keys 1 to 5.
          </p>
        </div>

        {/* Tune Mode Switcher & Auto-Play Demo */}
        <div className="flex items-center gap-2">
          {/* 3 Modes */}
          <div className="flex bg-zinc-100 p-0.5 rounded border border-zinc-200 font-mono text-xs">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  mode === m
                    ? 'bg-zinc-950 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={isPlayingDemo ? stopDemo : playDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              isPlayingDemo
                ? 'bg-zinc-950 text-white'
                : 'bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-950'
            }`}
          >
            {isPlayingDemo ? (
              <>
                <Square size={11} className="fill-current" /> Stop
              </>
            ) : (
              <>
                <Play size={11} className="fill-current" /> Roll Demo
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Playing String Columns (Tizita: 1=E, 2=C, 3=D, 4=A, 5=G) */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 py-6">
        {[1, 2, 3, 4, 5].map((pos) => {
          const info = currentTuning[pos] ?? BEGENA_TUNINGS.Tizita[pos];
          const isActive = activeString === pos;

          return (
            <motion.button
              key={pos}
              onClick={() => handlePluck(pos)}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center justify-between p-3 md:p-5 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-400 text-zinc-900'
              }`}
            >
              {/* String Number Badge */}
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center font-mono font-bold text-xs md:text-sm border transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-700'
                    : 'bg-white text-zinc-900 border border-zinc-200'
                }`}
              >
                {pos}
              </div>

              {/* Plucked String Line Graphic */}
              <div className="w-full flex items-center justify-center py-5 md:py-7">
                <motion.div
                  animate={
                    isActive
                      ? { scaleX: [1, 2.5, 0.8, 1.8, 1], backgroundColor: '#38BDF8' }
                      : { scaleX: 1, backgroundColor: '#D4D4D8' }
                  }
                  transition={{ duration: 0.25 }}
                  className="w-0.5 h-12 md:h-16 rounded-full"
                />
              </div>

              {/* Note Details */}
              <div className="text-center font-mono">
                <span className={`block font-bold text-xs ${isActive ? 'text-white' : 'text-zinc-950'}`}>
                  {info.note}
                </span>
                <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  {info.hz} Hz
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Demo Active Bar */}
      <AnimatePresence>
        {isPlayingDemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-2"
          >
            <div className="bg-zinc-950 text-white rounded-lg p-3 flex items-center justify-between text-xs font-mono border border-zinc-800">
              <div className="flex items-center gap-2">
                <Volume2 size={13} className="text-sky-400" />
                <span className="text-zinc-400">PLAYING [{mode.toUpperCase()}]:</span>
                <div className="flex items-center gap-1">
                  {SAMPLE_DEMO_SEQUENCE.map((s, idx) => (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        currentDemoIndex === idx
                          ? 'bg-white text-zinc-950 font-bold'
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
