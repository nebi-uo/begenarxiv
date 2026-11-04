import { useEffect, useRef, useCallback } from 'react';

export type BegenaTuneMode = 'Tizita' | 'Selamta' | 'Anchi-Hoye';

// Frequencies for the 3 traditional Begena tuning modes (Qenets)
// Tizita tuning: String 1 = E, String 2 = C, String 3 = D, String 4 = A, String 5 = G
export const BEGENA_TUNINGS: Record<
  BegenaTuneMode,
  Record<number, { note: string; hz: number; previewHz: number }>
> = {
  Tizita: {
    1: { note: 'E', hz: 164.81, previewHz: 329.63 },
    2: { note: 'C', hz: 130.81, previewHz: 261.63 },
    3: { note: 'D', hz: 146.83, previewHz: 293.66 },
    4: { note: 'A', hz: 220.00, previewHz: 440.00 },
    5: { note: 'G', hz: 196.00, previewHz: 392.00 },
  },
  Selamta: {
    1: { note: 'C', hz: 130.81, previewHz: 261.63 },
    2: { note: 'D', hz: 146.83, previewHz: 293.66 },
    3: { note: 'E', hz: 164.81, previewHz: 329.63 },
    4: { note: 'G', hz: 196.00, previewHz: 392.00 },
    5: { note: 'A', hz: 220.00, previewHz: 440.00 },
  },
  'Anchi-Hoye': {
    1: { note: 'D', hz: 146.83, previewHz: 293.66 },
    2: { note: 'F', hz: 174.61, previewHz: 349.23 },
    3: { note: 'G', hz: 196.00, previewHz: 392.00 },
    4: { note: 'A', hz: 220.00, previewHz: 440.00 },
    5: { note: 'C', hz: 261.63, previewHz: 523.25 },
  },
};

// Default is Tizita
export const STRING_FREQUENCIES = BEGENA_TUNINGS.Tizita;

export const NOTE_TO_FREQUENCY: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.00,
  A: 440.00,
};

export const ROLL_OFFSET_SEC = 0.035; // ~35ms between notes in a fast ornament roll

export function useTonePlayer(mode: BegenaTuneMode = 'Tizita') {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
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
  }, []);

  const playTone = useCallback(
    (frequencyOrNote: number | string, durationMs = 500, startTimeOffset = 0) => {
      try {
        const ctx = getAudioContext();
        let freq = 329.63; // Default E4
        if (typeof frequencyOrNote === 'number') {
          const tuningMap = BEGENA_TUNINGS[mode] ?? BEGENA_TUNINGS.Tizita;
          freq = tuningMap[frequencyOrNote]?.previewHz ?? frequencyOrNote;
        } else if (typeof frequencyOrNote === 'string') {
          freq = NOTE_TO_FREQUENCY[frequencyOrNote] ?? 329.63;
        }

        const startTime = ctx.currentTime + startTimeOffset;
        const durationSec = durationMs / 1000;

        // Fundamental triangle wave for warm string body
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        // Overtone sine wave for acoustic resonance
        const overtone = ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2, startTime);

        // Gain envelope with sharp attack and natural exponential release
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.28, startTime + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.07, startTime);
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
        console.warn('Audio error:', e);
      }
    },
    [getAudioContext, mode]
  );

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
    currentTuning: BEGENA_TUNINGS[mode] ?? BEGENA_TUNINGS.Tizita,
  };
}
