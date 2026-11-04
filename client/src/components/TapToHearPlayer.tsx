import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import type { SequenceStep } from '../types';
import Button from './Button';

interface Props {
  sequence: SequenceStep[];
  onActiveStringChange?: (pos: number | null) => void;
}

const PREVIEW_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  G: 392.0,
  A: 440.0,
};

const BASE_ROLL_OFFSET_SEC = 0.035; // ~35ms between notes in a fast roll

function groupByLine(sequence: SequenceStep[]) {
  const lines = new Map<number, SequenceStep[]>();
  for (const step of sequence) {
    const existing = lines.get(step.line_number) ?? [];
    existing.push(step);
    lines.set(step.line_number, existing);
  }
  return Array.from(lines.entries()).sort(([a], [b]) => a - b);
}

function clusterByGroup(steps: SequenceStep[]): SequenceStep[][] {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);
  const clusters: SequenceStep[][] = [];
  for (const step of sorted) {
    const last = clusters[clusters.length - 1];
    if (step.group_id !== null && last?.[0]?.group_id === step.group_id) {
      last.push(step);
    } else {
      clusters.push([step]);
    }
  }
  return clusters;
}

function buildPlaybackUnits(sequence: SequenceStep[]): SequenceStep[][] {
  const ordered = [...sequence].sort((a, b) =>
    a.line_number !== b.line_number ? a.line_number - b.line_number : a.step_order - b.step_order
  );
  const units: SequenceStep[][] = [];
  for (const step of ordered) {
    const last = units[units.length - 1];
    if (step.group_id !== null && last?.[0]?.group_id === step.group_id) {
      last.push(step);
    } else {
      units.push([step]);
    }
  }
  return units;
}

export default function TapToHearPlayer({ sequence, onActiveStringChange }: Props) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [tempoRate, setTempoRate] = useState<number>(1); // 0.75x, 1x, 1.25x
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      highlightTimeoutsRef.current.forEach(clearTimeout);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const scheduleTone = (noteName: string, durationMs: number, startTime: number) => {
    const ctx = getAudioContext();
    const frequency = PREVIEW_FREQUENCIES[noteName] ?? 261.63;
    const durationSec = durationMs / 1000;

    const oscillator = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(frequency * 2, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

    oscillator.connect(gain);
    overtone.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    overtone.start(startTime);
    oscillator.stop(startTime + durationSec);
    overtone.stop(startTime + durationSec);
  };

  const stepKey = (step: SequenceStep) => `${step.line_number}-${step.step_order}`;

  const playUnit = (unit: SequenceStep[], speed: number, onEnded?: () => void) => {
    const ctx = getAudioContext();
    const duration = ((unit[0]?.duration_ms ?? 500) / speed);
    const rollOffset = BASE_ROLL_OFFSET_SEC / speed;
    const startBase = ctx.currentTime;

    setActiveKeys([]);
    unit.forEach((step, i) => {
      const offset = i * rollOffset;
      scheduleTone(step.note_name, duration, startBase + offset);
      const t = setTimeout(() => {
        setActiveKeys((prev) => [...prev, stepKey(step)]);
        if (onActiveStringChange) onActiveStringChange(step.string_position);
      }, offset * 1000);
      highlightTimeoutsRef.current.push(t);
    });

    const totalDuration = duration + (unit.length - 1) * rollOffset * 1000;
    if (onEnded) timeoutRef.current = setTimeout(onEnded, totalDuration);
  };

  const handleTapStep = useCallback((step: SequenceStep) => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    highlightTimeoutsRef.current.forEach(clearTimeout);
    setActiveKeys([stepKey(step)]);
    if (onActiveStringChange) onActiveStringChange(step.string_position);

    scheduleTone(step.note_name, step.duration_ms ?? 500, getAudioContext().currentTime);

    setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== stepKey(step)));
      if (onActiveStringChange) onActiveStringChange(null);
    }, 280);
  }, [onActiveStringChange]);

  const handlePlayAll = useCallback(() => {
    stopRequestedRef.current = false;
    setIsPlayingAll(true);
    const units = buildPlaybackUnits(sequence);

    const advance = (index: number) => {
      if (stopRequestedRef.current || index >= units.length) {
        setIsPlayingAll(false);
        setActiveKeys([]);
        if (onActiveStringChange) onActiveStringChange(null);
        return;
      }
      playUnit(units[index], tempoRate, () => advance(index + 1));
    };

    advance(0);
  }, [sequence, tempoRate, onActiveStringChange]);

  const handleStop = useCallback(() => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    highlightTimeoutsRef.current.forEach(clearTimeout);
    setActiveKeys([]);
    if (onActiveStringChange) onActiveStringChange(null);
  }, [onActiveStringChange]);

  // Keyboard shortcut listener: Space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlayingAll) {
          handleStop();
        } else {
          handlePlayAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingAll, handlePlayAll, handleStop]);

  if (sequence.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 text-xs font-mono bg-zinc-50 rounded border border-zinc-200">
        <Volume2 size={20} className="mx-auto text-zinc-400 mb-2" />
        <p>No playable notation sequence for this mezmur yet.</p>
      </div>
    );
  }

  const lines = groupByLine(sequence);

  return (
    <div className="space-y-4">
      {/* Control & Speed Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Button
            onClick={isPlayingAll ? handleStop : handlePlayAll}
            variant={isPlayingAll ? 'secondary' : 'primary'}
            className="text-xs px-3.5 py-1.5"
          >
            {isPlayingAll ? (
              <>
                <Square size={11} className="fill-current" /> Stop
              </>
            ) : (
              <>
                <Play size={11} className="fill-current" /> Play Full Sequence
              </>
            )}
          </Button>

          {isPlayingAll && (
            <span className="text-xs font-mono text-zinc-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse" />
              Playing...
            </span>
          )}
        </div>

        {/* Speed / Tempo Toggle */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-zinc-400 text-[10px] uppercase mr-1">Speed:</span>
          {[0.75, 1, 1.25].map((rate) => (
            <button
              key={rate}
              onClick={() => setTempoRate(rate)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                tempoRate === rate
                  ? 'bg-zinc-950 text-white font-bold'
                  : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Notation Grid */}
      <div className="space-y-2.5">
        {lines.map(([lineNumber, steps]) => (
          <div
            key={lineNumber}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded border border-zinc-200 bg-white"
          >
            {/* Line Number Badge */}
            <div className="sm:w-16 shrink-0">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                LINE {lineNumber}
              </span>
            </div>

            {/* Note Tokens */}
            <div className="flex flex-wrap items-center gap-1.5">
              {clusterByGroup(steps).map((cluster, ci) => {
                const isGrouped = cluster.length > 1;

                return (
                  <div
                    key={ci}
                    className={`inline-flex items-center ${
                      isGrouped ? 'p-0.5 rounded bg-zinc-100 border border-zinc-200 gap-0.5' : ''
                    }`}
                  >
                    {cluster.map((step) => {
                      const isActive = activeKeys.includes(stepKey(step));

                      return (
                        <motion.button
                          key={stepKey(step)}
                          onClick={() => handleTapStep(step)}
                          whileTap={{ scale: 0.94 }}
                          animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className={`relative flex flex-col items-center justify-center rounded font-mono font-bold cursor-pointer transition-colors ${
                            isGrouped ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-xs'
                          } ${
                            isActive
                              ? 'bg-zinc-950 text-white border border-zinc-950 z-10 shadow-xs'
                              : 'bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-950'
                          }`}
                          title={`Line ${step.line_number}, Step ${step.step_order} - Note ${step.note_name}`}
                        >
                          <span>{step.string_position}</span>
                          <span
                            className={`text-[8px] -mt-0.5 ${
                              isActive ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            {step.note_name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
