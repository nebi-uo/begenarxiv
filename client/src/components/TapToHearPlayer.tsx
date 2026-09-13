import { useEffect, useRef, useState } from 'react';
import type { SequenceStep } from '../types';

interface Props {
  sequence: SequenceStep[];
}

export default function TapToHearPlayer({ sequence }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount: stop any playing audio, clear any pending timeout
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const playStep = (index: number, onEnded?: () => void) => {
    const step = sequence[index];
    if (!step) return;

    audioRef.current?.pause();
    const audio = new Audio(step.audio_file_url);
    audioRef.current = audio;
    setActiveIndex(index);

    audio.play().catch((err) => console.error('Playback failed:', err));

    if (onEnded) {
      const duration = step.duration_ms ?? 500;
      timeoutRef.current = setTimeout(onEnded, duration);
    }
  };

  // Tap a single step manually — just hear that one string
  const handleTapStep = (index: number) => {
    setIsPlayingAll(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    playStep(index);
  };

  // Play the full sequence in order, respecting each step's duration
  const handlePlayAll = () => {
    setIsPlayingAll(true);
    const advance = (index: number) => {
      if (index >= sequence.length) {
        setIsPlayingAll(false);
        setActiveIndex(null);
        return;
      }
      playStep(index, () => advance(index + 1));
    };
    advance(0);
  };

  const handleStop = () => {
    setIsPlayingAll(false);
    audioRef.current?.pause();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveIndex(null);
  };

  if (sequence.length === 0) {
    return <p className="text-muted text-sm">No playable sequence for this mezmur yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {sequence.map((step, index) => (
          <button
            key={`${step.step_order}-${index}`}
            onClick={() => handleTapStep(index)}
            className={`w-14 h-14 rounded-card flex items-center justify-center font-medium transition-colors ${
              activeIndex === index
                ? 'bg-ink text-white'
                : 'bg-background text-ink'
            }`}
          >
            {step.note_name}
          </button>
        ))}
      </div>

      <button
        onClick={isPlayingAll ? handleStop : handlePlayAll}
        className="bg-ink text-white text-sm px-5 py-2 rounded-pill"
      >
        {isPlayingAll ? 'Stop' : 'Play full sequence'}
      </button>
    </div>
  );
}