import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import type { SequenceStep } from '../types';
import Button from './Button';
import { BEGENA_TUNINGS, NOTE_TO_FREQUENCY, type BegenaTuneMode } from '../hooks/useTonePlayer';
import { playBegenaString } from '../audio/begenaSynth';

interface Props {
  sequence: SequenceStep[];
  mode?: BegenaTuneMode;
  onActiveStringChange?: (pos: number | null) => void;
}

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

export default function TapToHearPlayer({ sequence, mode = 'Tizita', onActiveStringChange }: Props) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [tempoRate, setTempoRate] = useState<number>(1); // 0.75x, 1x, 1.25x
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopRequestedRef = useRef(false);

  const currentTuning = BEGENA_TUNINGS[mode] ?? BEGENA_TUNINGS.Tizita;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      highlightTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const scheduleTone = (stringPos: number, noteName: string, durationMs: number, startTimeOffset = 0) => {
    const frequency =
      currentTuning[stringPos]?.hz ??
      NOTE_TO_FREQUENCY[noteName] ??
      164.81;

    playBegenaString({
      frequency,
      durationMs,
      startTimeOffset,
    });
  };

  const stepKey = (step: SequenceStep) => `${step.line_number}-${step.step_order}`;

  const playUnit = (unit: SequenceStep[], speed: number, onEnded?: () => void) => {
    const duration = (unit[0]?.duration_ms ?? 500) / speed;
    const rollOffset = BASE_ROLL_OFFSET_SEC / speed;

    setActiveKeys([]);
    unit.forEach((step, i) => {
      const offset = i * rollOffset;
      scheduleTone(step.string_position, step.note_name, duration, offset);
      const t = setTimeout(() => {
        setActiveKeys((prev) => [...prev, stepKey(step)]);
        if (onActiveStringChange) onActiveStringChange(step.string_position);
      }, offset * 1000);
      highlightTimeoutsRef.current.push(t);
    });

    const totalDuration = duration + (unit.length - 1) * rollOffset * 1000;
    if (onEnded) timeoutRef.current = setTimeout(onEnded, totalDuration);
  };

  const handleTapStep = useCallback(
    (step: SequenceStep) => {
      stopRequestedRef.current = true;
      setIsPlayingAll(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      highlightTimeoutsRef.current.forEach(clearTimeout);
      setActiveKeys([stepKey(step)]);
      if (onActiveStringChange) onActiveStringChange(step.string_position);

      scheduleTone(
        step.string_position,
        step.note_name,
        step.duration_ms ?? 500,
        0
      );

      setTimeout(() => {
        setActiveKeys((prev) => prev.filter((k) => k !== stepKey(step)));
        if (onActiveStringChange) onActiveStringChange(null);
      }, 280);
    },
    [onActiveStringChange, mode]
  );

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
  }, [sequence, tempoRate, onActiveStringChange, mode]);

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

  if (!sequence || sequence.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-200 rounded-lg">
        NO NOTATION DATA AVAILABLE
      </div>
    );
  }

  const lines = groupByLine(sequence);

  return (
    <div className="space-y-6">
      {/* Playback Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-xs">
        <div className="flex items-center gap-2">
          {isPlayingAll ? (
            <Button
              variant="secondary"
              onClick={handleStop}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <Square size={12} className="fill-current" />
              <span>STOP [SPACE]</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handlePlayAll}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3"
            >
              <Play size={12} className="fill-current" />
              <span>PLAY SONG [SPACE]</span>
            </Button>
          )}

          <div className="h-4 w-px bg-zinc-300 mx-1 hidden sm:block" />

          {/* Speed / Tempo Toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded border border-zinc-200">
            {[0.75, 1, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => setTempoRate(rate)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  tempoRate === rate
                    ? 'bg-zinc-950 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-mono">
          <Volume2 size={13} className="text-zinc-950" />
          <span>{sequence.length} NOTES · {mode.toUpperCase()} · TAP TO HEAR</span>
        </div>
      </div>

      {/* Notation Grid */}
      <div className="space-y-4">
        {lines.map(([lineNumber, steps]) => (
          <div
            key={lineNumber}
            className="p-4 rounded-lg border border-zinc-200 bg-white"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-3 pb-1.5 border-b border-zinc-100">
              <span className="font-semibold text-zinc-950">LINE {lineNumber}</span>
              <span>{steps.length} STEPS</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {clusterByGroup(steps).map((cluster, cIdx) => {
                const isGrouped = cluster.length > 1;

                return (
                  <div
                    key={cIdx}
                    className={`inline-flex items-center gap-1 p-1 rounded transition-colors ${
                      isGrouped
                        ? 'border border-dashed border-zinc-300 bg-zinc-50/80'
                        : ''
                    }`}
                  >
                    {cluster.map((step) => {
                      const isActive = activeKeys.includes(stepKey(step));
                      const displayNote = currentTuning[step.string_position]?.note ?? step.note_name;

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
                              ? 'bg-zinc-950 text-white border border-zinc-950 z-10'
                              : 'bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-950'
                          }`}
                          title={`Line ${step.line_number}, Step ${step.step_order} - String ${step.string_position} (${displayNote})`}
                        >
                          <span>{step.string_position}</span>
                          <span
                            className={`text-[8px] -mt-0.5 ${
                              isActive ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            {displayNote}
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
