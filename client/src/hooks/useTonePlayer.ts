import { useEffect, useRef, useCallback } from 'react';

// Standard 5-string Begena frequencies (Hz) in standard tuning
// Position 1: C3 (130.81 Hz), 2: D3 (146.83 Hz), 3: E3 (164.81 Hz), 4: G3 (196.00 Hz), 5: A3 (220.00 Hz)
// Higher octave preview frequencies for crisp headphone listening:
export const STRING_FREQUENCIES: Record<number, { note: string; hz: number; previewHz: number }> = {
  1: { note: 'C', hz: 130.81, previewHz: 261.63 },
  2: { note: 'D', hz: 146.83, previewHz: 293.66 },
  3: { note: 'E', hz: 164.81, previewHz: 329.63 },
  4: { note: 'G', hz: 196.00, previewHz: 392.00 },
  5: { note: 'A', hz: 220.00, previewHz: 440.00 },
};

export const NOTE_TO_FREQUENCY: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  G: 392.00,
  A: 440.00,
};

export const ROLL_OFFSET_SEC = 0.035; // ~35ms between notes in a fast ornament roll

export function useTonePlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Plays a rich acoustic-like plucked string tone using Web Audio synthesis
  const playTone = useCallback(
    (frequencyOrNote: number | string, durationMs = 500, startTimeOffset = 0) => {
      try {
        const ctx = getAudioContext();
        let freq = 261.63;
        if (typeof frequencyOrNote === 'number') {
          freq = STRING_FREQUENCIES[frequencyOrNote]?.previewHz ?? frequencyOrNote;
        } else if (typeof frequencyOrNote === 'string') {
          freq = NOTE_TO_FREQUENCY[frequencyOrNote] ?? 261.63;
        }

        const startTime = ctx.currentTime + startTimeOffset;
        const durationSec = durationMs / 1000;

        // Fundamental oscillator (triangle wave has natural soft string harmonics)
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        // Sub/harmonic overtone for acoustic string richness
        const overtone = ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2, startTime);

        // Gain envelope for pluck (sharp attack, exponential release)
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, startTime);
        // Instant attack (pluck)
        gainNode.gain.exponentialRampToValueAtTime(0.3, startTime + 0.008);
        // Natural exponential decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

        // Soft overtone blend
        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.08, startTime);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec * 0.4);

        osc.connect(gainNode);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startTime);
        overtone.start(startTime);
        osc.stop(startTime + durationSec);
        overtone.stop(startTime + durationSec);
      } catch (e) {
        console.warn('Audio playback error:', e);
      }
    },
    [getAudioContext]
  );

  // Plucks a specific string position (1 to 5)
  const pluckString = useCallback(
    (position: number, durationMs = 500) => {
      playTone(position, durationMs, 0);
    },
    [playTone]
  );

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    playTone,
    pluckString,
    getAudioContext,
  };
}

