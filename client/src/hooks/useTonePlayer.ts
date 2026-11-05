import { useCallback } from 'react';
import { playBegenaString, getAudioContext } from '../audio/begenaSynth';

export type BegenaTuneMode = 'Tizita' | 'Selamta' | 'Anchi-Hoye';

// Frequencies for the 3 traditional Begena tuning modes (Qenets)
// Tizita: String 1 = E, String 2 = C, String 3 = D, String 4 = A, String 5 = G
// Selamta: String 1 = F, String 2 = C, String 3 = D, String 4 = A, String 5 = G
// Anchi-Hoye: String 1 = F, String 2 = C, String 3 = C#, String 4 = A, String 5 = F#
export const BEGENA_TUNINGS: Record<
  BegenaTuneMode,
  Record<number, { note: string; hz: number; previewHz: number }>
> = {
  Tizita: {
    1: { note: 'E', hz: 164.81, previewHz: 164.81 },
    2: { note: 'C', hz: 130.81, previewHz: 130.81 },
    3: { note: 'D', hz: 146.83, previewHz: 146.83 },
    4: { note: 'A', hz: 220.00, previewHz: 220.00 },
    5: { note: 'G', hz: 196.00, previewHz: 196.00 },
  },
  Selamta: {
    1: { note: 'F', hz: 174.61, previewHz: 174.61 },
    2: { note: 'C', hz: 130.81, previewHz: 130.81 },
    3: { note: 'D', hz: 146.83, previewHz: 146.83 },
    4: { note: 'A', hz: 220.00, previewHz: 220.00 },
    5: { note: 'G', hz: 196.00, previewHz: 196.00 },
  },
  'Anchi-Hoye': {
    1: { note: 'F', hz: 174.61, previewHz: 174.61 },
    2: { note: 'C', hz: 130.81, previewHz: 130.81 },
    3: { note: 'C#', hz: 138.59, previewHz: 138.59 },
    4: { note: 'A', hz: 220.00, previewHz: 220.00 },
    5: { note: 'F#', hz: 185.00, previewHz: 185.00 },
  },
};

export const STRING_FREQUENCIES = BEGENA_TUNINGS.Tizita;

export const NOTE_TO_FREQUENCY: Record<string, number> = {
  C: 130.81,
  'C#': 138.59,
  Db: 138.59,
  D: 146.83,
  'D#': 155.56,
  Eb: 155.56,
  E: 164.81,
  F: 174.61,
  'F#': 185.00,
  Gb: 185.00,
  G: 196.00,
  'G#': 207.65,
  Ab: 207.65,
  A: 220.00,
  'A#': 233.08,
  Bb: 233.08,
  B: 246.94,
};

export const ROLL_OFFSET_SEC = 0.050; // ~50ms between notes in a fast ornament roll (natural finger speed)

export function useTonePlayer(mode: BegenaTuneMode = 'Tizita') {
  const playTone = useCallback(
    (frequencyOrNote: number | string, durationMs = 600, startTimeOffset = 0) => {
      let freq = 164.81; // Default E3
      if (typeof frequencyOrNote === 'number') {
        const tuningMap = BEGENA_TUNINGS[mode] ?? BEGENA_TUNINGS.Tizita;
        freq = tuningMap[frequencyOrNote]?.hz ?? frequencyOrNote;
      } else if (typeof frequencyOrNote === 'string') {
        freq = NOTE_TO_FREQUENCY[frequencyOrNote] ?? 164.81;
      }

      playBegenaString({
        frequency: freq,
        durationMs,
        startTimeOffset,
      });
    },
    [mode]
  );

  const pluckString = useCallback(
    (position: number, durationMs = 600) => {
      playTone(position, durationMs, 0);
    },
    [playTone]
  );

  return {
    playTone,
    pluckString,
    getAudioContext,
    currentTuning: BEGENA_TUNINGS[mode] ?? BEGENA_TUNINGS.Tizita,
  };
}
