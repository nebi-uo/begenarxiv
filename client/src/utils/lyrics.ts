export interface ParsedLyricLine {
  text: string;
  repeatCount?: number;
  originalTag?: string;
  isEmpty: boolean;
}

const GEEZ_NUMERAL_MAP: Record<string, number> = {
  '፩': 1,
  '፪': 2,
  '፫': 3,
  '፬': 4,
  '፭': 5,
  '፮': 6,
  '፯': 7,
  '፰': 8,
  '፱': 9,
  '፲': 10,
};

// Matches: (x2), (2x), [x2], [2x], (x 2), (2 times), (2 ጊዜ), (፪ ጊዜ), (፪x), (፪), (2) at the end of a line
const REPEAT_REGEX =
  /\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])\s*$/i;

/**
 * Parses a single line of lyrics into text and repeat count (if any).
 */
export function parseLyricLine(line: string): ParsedLyricLine {
  const trimmed = line.trim();
  if (!trimmed) {
    return { text: '', isEmpty: true };
  }

  const match = trimmed.match(REPEAT_REGEX);
  if (match) {
    let count = 2;
    if (match[1]) count = parseInt(match[1], 10);
    else if (match[2]) count = parseInt(match[2], 10);
    else if (match[3]) count = parseInt(match[3], 10);
    else if (match[4]) count = GEEZ_NUMERAL_MAP[match[4]] || 2;

    const cleanText = trimmed.replace(REPEAT_REGEX, '').trim();
    return {
      text: cleanText,
      repeatCount: count,
      originalTag: match[0].trim(),
      isEmpty: false,
    };
  }

  return { text: trimmed, isEmpty: false };
}

/**
 * Parses full lyrics string into structured lines with repeat metadata.
 */
export function parseLyrics(rawLyrics: string | null | undefined): ParsedLyricLine[] {
  if (!rawLyrics) return [];
  const lines = rawLyrics.split(/\r?\n/);
  return lines.map(parseLyricLine);
}

/**
 * Inserts a repeat tag (like '(x2)') cleanly at the cursor / current line of a textarea.
 */
export function insertRepeatTagAtCursor(
  text: string,
  tag: string,
  cursorStart: number,
  cursorEnd: number
): { text: string; nextCursor: number } {
  const tagWithSpace = ` ${tag.trim()}`;

  // If text is selected, replace or append to selection
  const before = text.slice(0, cursorStart);
  const after = text.slice(cursorEnd);

  const updatedText = before + tagWithSpace + after;
  const nextCursor = cursorStart + tagWithSpace.length;

  return {
    text: updatedText,
    nextCursor,
  };
}

