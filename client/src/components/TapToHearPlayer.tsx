import { useEffect, useRef, useState } from 'react';
import type { SequenceStep } from '../types';
import { motion } from 'framer-motion';
import Button from './Button';

interface Props {
  sequence: SequenceStep[];
}

// Temporary stand-in frequencies until real per-string recordings exist.
// Swappable later for real <audio> playback without touching sequencing logic below.
const PREVIEW_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  G: 392.0,
  A: 440.0,
};

function groupByLine(sequence: SequenceStep[]) {
  const lines = new Map<number, SequenceStep[]>();
  for (const step of sequence) {
    const existing = lines.get(step.line_number) ?? [];
    existing.push(step);
    lines.set(step.line_number, existing);
  }
  return Array.from(lines.entries()).sort(([a], [b]) => a - b);
}

export default function TapToHearPlayer({ sequence }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const getAudioContext = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  };

  const playTone = (noteName: string, durationMs: number) => {
    const ctx = getAudioContext();
    const frequency = PREVIEW_FREQUENCIES[noteName] ?? 220;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Envelope: quick fade-out instead of an abrupt cutoff, which would click/pop
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + durationMs / 1000);
  };

  const stepKey = (step: SequenceStep) => `${step.line_number}-${step.step_order}`;

  const handleTapStep = (step: SequenceStep) => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveKey(stepKey(step));
    playTone(step.note_name, step.duration_ms ?? 500);
  };

  const handlePlayAll = () => {
    stopRequestedRef.current = false;
    setIsPlayingAll(true);

    const ordered = [...sequence].sort((a, b) =>
      a.line_number !== b.line_number ? a.line_number - b.line_number : a.step_order - b.step_order
    );

    const advance = (index: number) => {
      if (stopRequestedRef.current || index >= ordered.length) {
        setIsPlayingAll(false);
        setActiveKey(null);
        return;
      }
      const step = ordered[index];
      setActiveKey(stepKey(step));
      const duration = step.duration_ms ?? 500;
      playTone(step.note_name, duration);
      timeoutRef.current = setTimeout(() => advance(index + 1), duration);
    };

    advance(0);
  };

  const handleStop = () => {
    stopRequestedRef.current = true;
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveKey(null);
  };

  if (sequence.length === 0) {
    return <p className="text-muted text-sm">No playable string sequence for this mezmur yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        {groupByLine(sequence).map(([lineNumber, steps]) => (
          <div key={lineNumber} className="flex items-center gap-2">
            <span className="text-muted text-xs w-12">Line {lineNumber}</span>
            <div className="flex gap-2">
              {steps
                .sort((a, b) => a.step_order - b.step_order)
                .map((step) => (
                  <motion.button
                    key={stepKey(step)}
                    onClick={() => handleTapStep(step)}
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: activeKey === stepKey(step) ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className={`w-10 h-10 rounded-card flex items-center justify-center font-medium ${
                      activeKey === stepKey(step) ? 'bg-accent text-white' : 'bg-background text-ink'
                    }`}
                  >
                    {step.string_position}
                  </motion.button>
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