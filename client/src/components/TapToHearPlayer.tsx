import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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

const ROLL_OFFSET_SEC = 0.035; // ~35ms between notes in a fast roll — tunable

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
      audioCtxRef.current?.close();
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  };

  // Schedules a tone at a precise, sample-accurate start time on the audio
  // clock — not "play now", but "play exactly at this future instant".
  const scheduleTone = (noteName: string, durationMs: number, startTime: number) => {
    const ctx = getAudioContext();
    const frequency = PREVIEW_FREQUENCIES[noteName] ?? 220;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + durationMs / 1000);
  };

  const stepKey = (step: SequenceStep) => `${step.line_number}-${step.step_order}`;

  // Plays a unit as a fast roll: each note in the group starts ROLL_OFFSET_SEC
  // after the previous one, scheduled on the audio clock for tight, consistent
  // timing. Visual highlighting is staggered to match, via setTimeout — a little
  // JS timer jitter on the *visual* side is imperceptible, unlike on audio.
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
    return <p className="text-muted text-sm">No playable sequence for this mezmur yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        {groupByLine(sequence).map(([lineNumber, steps]) => (
          <div key={lineNumber} className="flex items-center gap-2">
            <span className="text-muted text-xs w-12">Line {lineNumber}</span>
            <div className="flex items-center gap-2">
              {clusterByGroup(steps).map((cluster, ci) => (
                <div
                  key={ci}
                  className={`flex ${cluster.length > 1 ? 'gap-0.5 bg-background rounded-card p-1' : ''}`}
                >
                  {cluster.map((step) => (
                    <motion.button
                      key={stepKey(step)}
                      onClick={() => handleTapStep(step)}
                      whileTap={{ scale: 0.9 }}
                      animate={{ scale: activeKeys.includes(stepKey(step)) ? 1.1 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className={`${cluster.length > 1 ? 'w-8 h-8 text-sm' : 'w-10 h-10'} rounded-card flex items-center justify-center font-medium ${
                        activeKeys.includes(stepKey(step)) ? 'bg-accent text-white' : 'bg-card text-ink'
                      }`}
                    >
                      {step.string_position}
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={isPlayingAll ? handleStop : handlePlayAll}>
        {isPlayingAll ? 'Stop' : 'Play full sequence'}
      </Button>
    </div>
  );
}