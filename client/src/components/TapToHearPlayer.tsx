import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import type { SequenceStep } from '../types';
import Button from './Button';

interface Props {
  sequence: SequenceStep[];
}

const PREVIEW_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  G: 392.0,
  A: 440.0,
};

const ROLL_OFFSET_SEC = 0.035; // ~35ms between notes in a fast roll

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

export default function TapToHearPlayer({ sequence }: Props) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

    // Plucked string harmonic synthesis (triangle + sine overtone)
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

  const playUnit = (unit: SequenceStep[], onEnded?: () => void) => {
    const ctx = getAudioContext();
    const duration = unit[0]?.duration_ms ?? 500;
    const startBase = ctx.currentTime;

    setActiveKeys([]);
    unit.forEach((step, i) => {
      const offset = i * ROLL_OFFSET_SEC;
      scheduleTone(step.note_name, duration, startBase + offset);
      const t = setTimeout(() => {
        setActiveKeys((prev) => [...prev, stepKey(step)]);
      }, offset * 1000);
      highlightTimeoutsRef.current.push(t);
    });

    const totalDuration = duration + (unit.length - 1) * ROLL_OFFSET_SEC * 1000;
    if (onEnded) timeoutRef.current = setTimeout(onEnded, totalDuration);
  };

  const handleTapStep = (step: SequenceStep) => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    highlightTimeoutsRef.current.forEach(clearTimeout);
    setActiveKeys([stepKey(step)]);
    scheduleTone(step.note_name, step.duration_ms ?? 500, getAudioContext().currentTime);

    setTimeout(() => {
      setActiveKeys((prev) => prev.filter((k) => k !== stepKey(step)));
    }, 300);
  };

  const handlePlayAll = () => {
    stopRequestedRef.current = false;
    setIsPlayingAll(true);
    const units = buildPlaybackUnits(sequence);

    const advance = (index: number) => {
      if (stopRequestedRef.current || index >= units.length) {
        setIsPlayingAll(false);
        setActiveKeys([]);
        return;
      }
      playUnit(units[index], () => advance(index + 1));
    };

    advance(0);
  };

  const handleStop = () => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    highlightTimeoutsRef.current.forEach(clearTimeout);
    setActiveKeys([]);
  };

  if (sequence.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 text-sm bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
        <Volume2 size={24} className="mx-auto text-zinc-400 mb-2" />
        <p>No playable notation sequence for this mezmur yet.</p>
      </div>
    );
  }

  const lines = groupByLine(sequence);

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Button
            onClick={isPlayingAll ? handleStop : handlePlayAll}
            variant={isPlayingAll ? 'secondary' : 'primary'}
            className="shadow-xs"
          >
            {isPlayingAll ? (
              <>
                <Square size={14} className="fill-current text-rose-500" /> Stop
              </>
            ) : (
              <>
                <Play size={14} className="fill-current text-amber-400" /> Play Full Sequence
              </>
            )}
          </Button>

          {isPlayingAll && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Playing notation…</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded border border-zinc-300 bg-white flex items-center justify-center text-[10px] font-bold text-zinc-800">
              1
            </span>
            <span>Solo Note</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-[10px] font-bold">
              1 2
            </span>
            <span>Fast Roll (~35ms)</span>
          </div>
        </div>
      </div>

      {/* Notation Grid grouped by line */}
      <div className="space-y-4">
        {lines.map(([lineNumber, steps]) => (
          <div
            key={lineNumber}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl border border-zinc-150 bg-white hover:border-zinc-300 transition-colors"
          >
            {/* Line Number Badge */}
            <div className="flex items-center gap-2 sm:w-20 shrink-0">
              <span className="text-[11px] font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-1 rounded border border-zinc-200">
                L{lineNumber}
              </span>
            </div>

            {/* Note Tokens */}
            <div className="flex flex-wrap items-center gap-2">
              {clusterByGroup(steps).map((cluster, ci) => {
                const isGrouped = cluster.length > 1;

                return (
                  <div
                    key={ci}
                    className={`inline-flex items-center ${
                      isGrouped
                        ? 'p-1 rounded-xl bg-amber-50/70 border border-amber-200/80 gap-1'
                        : ''
                    }`}
                  >
                    {cluster.map((step) => {
                      const isActive = activeKeys.includes(stepKey(step));

                      return (
                        <motion.button
                          key={stepKey(step)}
                          onClick={() => handleTapStep(step)}
                          whileTap={{ scale: 0.92 }}
                          animate={
                            isActive
                              ? { scale: 1.12 }
                              : { scale: 1 }
                          }
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          className={`relative flex flex-col items-center justify-center rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                            isGrouped
                              ? 'w-9 h-9 text-xs'
                              : 'w-11 h-11 text-sm'
                          } ${
                            isActive
                              ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400/40 z-10'
                              : 'bg-white text-zinc-950 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 shadow-xs'
                          }`}
                          title={`Line ${step.line_number}, Step ${step.step_order} - Note ${step.note_name} (String ${step.string_position})`}
                        >
                          <span>{step.string_position}</span>
                          <span
                            className={`text-[8px] font-sans -mt-0.5 ${
                              isActive ? 'text-amber-100' : 'text-zinc-400'
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
