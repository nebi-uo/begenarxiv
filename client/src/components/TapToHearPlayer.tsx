import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Volume2 } from 'lucide-react';
import type { SequenceStep } from '../types';
import Button from './Button';
import { BEGENA_TUNINGS, NOTE_TO_FREQUENCY, type BegenaTuneMode } from '../hooks/useTonePlayer';
import { playBegenaString } from '../audio/begenaSynth';
import {
  parseRawNotation,
  expandLineTokensForPlayback,
  type ParsedNotationToken,
} from '../utils/notation';

interface Props {
  sequence: SequenceStep[];
  mode?: BegenaTuneMode;
  onActiveStringChange?: (pos: number | null) => void;
  rawNotation?: string | null;
}

const BASE_ROLL_OFFSET_SEC = 0.050; // ~50ms between notes in a fast roll (natural finger speed)

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
    if (step.phrase_break || step.is_rest) {
      clusters.push([step]);
      continue;
    }
    const last = clusters[clusters.length - 1];
    if (
      step.group_id !== null &&
      step.group_id !== undefined &&
      last?.[0]?.group_id === step.group_id
    ) {
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
    if (step.phrase_break || step.is_rest) {
      units.push([step]);
      continue;
    }
    const last = units[units.length - 1];
    if (
      step.group_id !== null &&
      step.group_id !== undefined &&
      last?.[0]?.group_id === step.group_id
    ) {
      last.push(step);
    } else {
      clustersPush(units, [step]);
    }
  }
  return units;
}

function clustersPush(units: SequenceStep[][], item: SequenceStep[]) {
  units.push(item);
}

export default function TapToHearPlayer({
  sequence,
  mode = 'Tizita',
  onActiveStringChange,
  rawNotation,
}: Props) {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [tempoRate, setTempoRate] = useState<number>(1); // 0.75x, 1x, 1.25x
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stopRequestedRef = useRef(false);

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const currentTuning = useMemo(() => {
    return BEGENA_TUNINGS[mode] ?? BEGENA_TUNINGS.Tizita;
  }, [mode]);

  const tuningRef = useRef(currentTuning);
  tuningRef.current = currentTuning;

  // Parse raw notation with repeated sections and lines if provided
  const parsedNotationLines = useMemo(() => {
    if (!rawNotation || !rawNotation.trim()) return [];
    return parseRawNotation(rawNotation);
  }, [rawNotation]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      highlightTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const scheduleTone = useCallback(
    (stringPos: number, noteName: string, durationMs: number, startTimeOffset = 0) => {
      const activeTuning = tuningRef.current ?? BEGENA_TUNINGS[modeRef.current] ?? BEGENA_TUNINGS.Tizita;
      const frequency =
        activeTuning[stringPos]?.hz ??
        NOTE_TO_FREQUENCY[noteName] ??
        164.81;

      playBegenaString({
        frequency,
        durationMs,
        startTimeOffset,
      });
    },
    []
  );

  const stepKey = (step: SequenceStep) => `${step.line_number}-${step.step_order}`;

  // Sequence Step playback unit
  const playUnit = useCallback(
    (unit: SequenceStep[], speed: number, onEnded?: () => void) => {
      const activeTuning = tuningRef.current ?? BEGENA_TUNINGS[modeRef.current] ?? BEGENA_TUNINGS.Tizita;
      const first = unit[0];
      const duration = (first?.duration_ms ?? 500) / speed;

      if (first?.phrase_break || first?.is_rest) {
        setActiveKeys([stepKey(first)]);
        if (onActiveStringChange) onActiveStringChange(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setActiveKeys((prev) => prev.filter((k) => k !== stepKey(first)));
          if (onEnded) onEnded();
        }, duration);
        return;
      }

      const rollOffset = BASE_ROLL_OFFSET_SEC / speed;

      setActiveKeys([]);
      unit.forEach((step, i) => {
        const offset = i * rollOffset;
        const noteName = activeTuning[step.string_position]?.note ?? step.note_name;
        scheduleTone(step.string_position, noteName, duration, offset);
        const t = setTimeout(() => {
          setActiveKeys((prev) => [...prev, stepKey(step)]);
          if (onActiveStringChange) onActiveStringChange(step.string_position);
        }, offset * 1000);
        highlightTimeoutsRef.current.push(t);
      });

      const totalDuration = duration + (unit.length - 1) * rollOffset * 1000;
      if (onEnded) timeoutRef.current = setTimeout(onEnded, totalDuration);
    },
    [onActiveStringChange, scheduleTone]
  );

  // Parsed Token playback unit (when raw notation is active)
  const playParsedToken = useCallback(
    (
      tok: ParsedNotationToken,
      key: string,
      speed: number,
      onEnded?: () => void
    ) => {
      const activeTuning = tuningRef.current ?? BEGENA_TUNINGS[modeRef.current] ?? BEGENA_TUNINGS.Tizita;
      const duration = (tok.durationMs || 500) / speed;

      if (tok.type === 'phrase_break' || tok.type === 'rest') {
        setActiveKeys([key]);
        if (onActiveStringChange) onActiveStringChange(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setActiveKeys((prev) => prev.filter((k) => k !== key));
          if (onEnded) onEnded();
        }, duration);
        return;
      }

      setActiveKeys([key]);
      if (tok.positions.length > 0) {
        if (onActiveStringChange) onActiveStringChange(tok.positions[0]);

        if (tok.type === 'roll') {
          const rollOffset = BASE_ROLL_OFFSET_SEC / speed;
          tok.positions.forEach((pos, i) => {
            const offset = i * rollOffset;
            scheduleTone(pos, activeTuning[pos]?.note ?? '', 220, offset);
            const t = setTimeout(() => {
              if (onActiveStringChange) onActiveStringChange(pos);
            }, offset * 1000);
            highlightTimeoutsRef.current.push(t);
          });
        } else {
          scheduleTone(tok.positions[0], activeTuning[tok.positions[0]]?.note ?? '', duration, 0);
        }
      }

      const totalDuration = tok.type === 'roll' ? 280 / speed : duration;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActiveKeys((prev) => prev.filter((k) => k !== key));
        if (onEnded) onEnded();
      }, totalDuration);
    },
    [onActiveStringChange, scheduleTone]
  );

  const handleTapStep = useCallback(
    (step: SequenceStep) => {
      stopRequestedRef.current = true;
      setIsPlayingAll(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      highlightTimeoutsRef.current.forEach(clearTimeout);
      setActiveKeys([stepKey(step)]);

      if (step.phrase_break || step.is_rest) {
        if (onActiveStringChange) onActiveStringChange(null);
        setTimeout(() => {
          setActiveKeys((prev) => prev.filter((k) => k !== stepKey(step)));
        }, 350);
        return;
      }

      if (onActiveStringChange) onActiveStringChange(step.string_position);

      const activeTuning = tuningRef.current ?? BEGENA_TUNINGS[modeRef.current] ?? BEGENA_TUNINGS.Tizita;
      const noteName = activeTuning[step.string_position]?.note ?? step.note_name;

      scheduleTone(
        step.string_position,
        noteName,
        step.duration_ms ?? 500,
        0
      );

      setTimeout(() => {
        setActiveKeys((prev) => prev.filter((k) => k !== stepKey(step)));
        if (onActiveStringChange) onActiveStringChange(null);
      }, 280);
    },
    [onActiveStringChange, scheduleTone]
  );

  const handleTapParsedToken = useCallback(
    (tok: ParsedNotationToken, key: string) => {
      stopRequestedRef.current = true;
      setIsPlayingAll(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      highlightTimeoutsRef.current.forEach(clearTimeout);
      setActiveKeys([key]);

      if (tok.type === 'phrase_break' || tok.type === 'rest') {
        if (onActiveStringChange) onActiveStringChange(null);
        setTimeout(() => {
          setActiveKeys((prev) => prev.filter((k) => k !== key));
        }, 350);
        return;
      }

      const activeTuning = tuningRef.current ?? BEGENA_TUNINGS[modeRef.current] ?? BEGENA_TUNINGS.Tizita;

      if (tok.positions.length > 0) {
        if (onActiveStringChange) onActiveStringChange(tok.positions[0]);
        if (tok.type === 'roll') {
          tok.positions.forEach((pos, i) => {
            setTimeout(() => {
              scheduleTone(pos, activeTuning[pos]?.note ?? '', 220, 0);
            }, i * 50);
          });
        } else {
          scheduleTone(tok.positions[0], activeTuning[tok.positions[0]]?.note ?? '', tok.durationMs || 500, 0);
        }
      }

      setTimeout(() => {
        setActiveKeys((prev) => prev.filter((k) => k !== key));
        if (onActiveStringChange) onActiveStringChange(null);
      }, 280);
    },
    [onActiveStringChange, scheduleTone]
  );

  const handlePlayAll = useCallback(() => {
    stopRequestedRef.current = false;
    setIsPlayingAll(true);

    if (parsedNotationLines.length > 0) {
      const allTokensToPlay: { token: ParsedNotationToken; key: string }[] = [];
      parsedNotationLines.forEach((line) => {
        const expanded = expandLineTokensForPlayback(line);
        expanded.forEach((tok, expIdx) => {
          const origIdx = line.tokens.indexOf(tok);
          allTokensToPlay.push({
            token: tok,
            key: `${line.lineNumber}-${origIdx >= 0 ? origIdx : expIdx}`,
          });
        });
      });

      const advanceToken = (index: number) => {
        if (stopRequestedRef.current || index >= allTokensToPlay.length) {
          setIsPlayingAll(false);
          setActiveKeys([]);
          if (onActiveStringChange) onActiveStringChange(null);
          return;
        }

        const item = allTokensToPlay[index];
        playParsedToken(item.token, item.key, tempoRate, () => advanceToken(index + 1));
      };

      advanceToken(0);
      return;
    }

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
  }, [
    sequence,
    parsedNotationLines,
    tempoRate,
    onActiveStringChange,
    playParsedToken,
    playUnit,
    mode,
    currentTuning,
  ]);

  const handleStop = useCallback(() => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    highlightTimeoutsRef.current.forEach(clearTimeout);
    setActiveKeys([]);
    if (onActiveStringChange) onActiveStringChange(null);
  }, [onActiveStringChange]);

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

  if ((!sequence || sequence.length === 0) && parsedNotationLines.length === 0) {
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
          <span>
            {parsedNotationLines.length > 0
              ? `${parsedNotationLines.reduce((acc, l) => acc + l.tokens.length, 0)} TOKENS`
              : `${sequence.length} NOTES`} · {mode.toUpperCase()} · TAP TO HEAR
          </span>
        </div>
      </div>

      {/* Notation Grid */}
      <div className="space-y-4">
        {parsedNotationLines.length > 0 ? (
          /* Render from parsed raw notation (with underlined section repeats and line repeats) */
          parsedNotationLines.map((line) => (
            <div
              key={line.lineNumber}
              className="p-4 rounded-lg border border-zinc-200 bg-white"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-3 pb-1.5 border-b border-zinc-100">
                <span className="font-semibold text-zinc-950">LINE {line.lineNumber}</span>
                <span className="flex items-center gap-2">
                  <span>{line.tokens.length} TOKENS</span>
                  {line.lineRepeatCount > 1 && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-900 font-bold">
                      x{line.lineRepeatCount} REPEAT
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono">
                {line.tokens.map((tok, tIdx) => {
                  const key = `${line.lineNumber}-${tIdx}`;
                  const isActive = activeKeys.includes(key);

                  if (tok.type === 'phrase_break') {
                    return (
                      <div
                        key={key}
                        onClick={() => handleTapParsedToken(tok, key)}
                        className={`flex items-center justify-center px-2 py-1 select-none transition-all cursor-pointer ${
                          isActive ? 'scale-125 text-black font-bold' : 'text-zinc-300 hover:text-black'
                        }`}
                        title="Phrase pause (musical breath)"
                      >
                        <span className="font-mono text-xl font-light leading-none">|</span>
                      </div>
                    );
                  }

                  if (tok.type === 'rest') {
                    return (
                      <motion.button
                        key={key}
                        onClick={() => handleTapParsedToken(tok, key)}
                        whileTap={{ scale: 0.94 }}
                        animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`relative flex flex-col items-center justify-center rounded font-mono font-bold cursor-pointer transition-colors w-9 h-9 text-xs ${
                          isActive
                            ? 'bg-zinc-950 text-white border border-zinc-950 z-10'
                            : 'bg-zinc-50 text-zinc-400 border border-dashed border-zinc-300 hover:border-zinc-950 hover:text-zinc-700'
                        }`}
                        title={`Beat rest (${tok.durationMs}ms)`}
                      >
                        <span>—</span>
                        <span className="text-[7px] -mt-0.5 uppercase tracking-tighter">REST</span>
                      </motion.button>
                    );
                  }

                  const displayNote = tok.positions[0] ? currentTuning[tok.positions[0]]?.note : '';

                  return (
                    <div key={key} className="inline-flex items-center gap-1">
                      <motion.button
                        onClick={() => handleTapParsedToken(tok, key)}
                        whileTap={{ scale: 0.94 }}
                        animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`relative flex flex-col items-center justify-center rounded font-mono font-bold cursor-pointer transition-colors ${
                          tok.type === 'roll' ? 'w-10 h-9 text-xs border border-dashed border-zinc-400' : 'w-9 h-9 text-xs border border-zinc-200 bg-white'
                        } ${
                          tok.isRepeatedSection
                            ? 'border-b-2 border-black underline underline-offset-4 decoration-black bg-zinc-100 font-extrabold'
                            : ''
                        } ${
                          isActive
                            ? 'bg-zinc-950 text-white border-zinc-950 z-10'
                            : 'text-zinc-900 hover:border-zinc-950'
                        }`}
                        title={
                          tok.isRepeatedSection
                            ? `Repeated section note (x${tok.sectionRepeatCount})`
                            : `String ${tok.text}`
                        }
                      >
                        <span>{tok.text}</span>
                        {displayNote && (
                          <span
                            className={`text-[8px] -mt-0.5 ${
                              isActive ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            {displayNote}
                          </span>
                        )}
                      </motion.button>

                      {tok.isSectionEnd && (
                        <span
                          className="px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[9px] font-mono font-bold tracking-tight"
                          title={`Repeat section x${tok.sectionRepeatCount}`}
                        >
                          x{tok.sectionRepeatCount}
                        </span>
                      )}
                    </div>
                  );
                })}

                {line.lineRepeatCount > 1 && (
                  <div className="ml-auto pl-2 flex items-center">
                    <span
                      className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-mono text-[10px] font-bold border border-zinc-300"
                      title={`Entire line repeated ${line.lineRepeatCount} times`}
                    >
                      x{line.lineRepeatCount} Line
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Fallback: render from database sequence steps */
          lines.map(([lineNumber, steps]) => (
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
                  if (cluster[0].phrase_break) {
                    const isActive = activeKeys.includes(stepKey(cluster[0]));
                    return (
                      <div
                        key={cIdx}
                        className={`flex items-center justify-center px-2 py-1 select-none transition-all ${
                          isActive ? 'scale-125 text-black font-bold' : 'text-zinc-300'
                        }`}
                        title="Phrase pause (musical breath)"
                      >
                        <span className="font-mono text-xl font-light leading-none">|</span>
                      </div>
                    );
                  }

                  if (cluster[0].is_rest) {
                    const isActive = activeKeys.includes(stepKey(cluster[0]));
                    return (
                      <motion.button
                        key={cIdx}
                        onClick={() => handleTapStep(cluster[0])}
                        whileTap={{ scale: 0.94 }}
                        animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`relative flex flex-col items-center justify-center rounded font-mono font-bold cursor-pointer transition-colors w-9 h-9 text-xs ${
                          isActive
                            ? 'bg-zinc-950 text-white border border-zinc-950 z-10'
                            : 'bg-zinc-50 text-zinc-400 border border-dashed border-zinc-300 hover:border-zinc-950 hover:text-zinc-700'
                        }`}
                        title={`Beat rest (${cluster[0].duration_ms ?? 500}ms)`}
                      >
                        <span>—</span>
                        <span className="text-[7px] -mt-0.5 uppercase tracking-tighter">REST</span>
                      </motion.button>
                    );
                  }

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
          ))
        )}
      </div>
    </div>
  );
}
