export interface LyricSegment {
  type: 'text' | 'repeat_section';
  text: string;
  repeatCount?: number;
  originalTag?: string;
}

export interface ParsedLyricLine {
  segments: LyricSegment[];
  lineRepeatCount?: number;
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

// Matches inline bracketed sections: [words to repeat](x2) or [words to repeat] (x2) or [words to repeat](፪ ጊዜ)
const SECTION_REPEAT_REGEX =
  /\[([^\]]+)\]\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])/gi;

// Matches whole line repeat tag at the end: (x2), (2x), (፪ ጊዜ), etc.
const LINE_REPEAT_REGEX =
  /\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])\s*$/i;

function parseRepeatCount(m1?: string, m2?: string, m3?: string, m4?: string): number {
  if (m1) return parseInt(m1, 10);
  if (m2) return parseInt(m2, 10);
  if (m3) return parseInt(m3, 10);
  if (m4) return GEEZ_NUMERAL_MAP[m4] || 2;
  return 2;
}

/**
 * Parses a single line of lyrics into segments (plain text and/or underlined repeat sections).
 */
export function parseLyricLine(line: string): ParsedLyricLine {
  const trimmed = line.trim();
  if (!trimmed) {
    return { segments: [], isEmpty: true };
  }

  // 1. Check for inline bracketed repeated sections: [words](x2)
  const matches = Array.from(trimmed.matchAll(SECTION_REPEAT_REGEX));
  if (matches.length > 0) {
    const segments: LyricSegment[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      const matchIndex = match.index ?? 0;
      // Text before match
      if (matchIndex > lastIndex) {
        const preText = trimmed.slice(lastIndex, matchIndex);
        if (preText) segments.push({ type: 'text', text: preText });
      }

      const repeatText = match[1];
      const count = parseRepeatCount(match[2], match[3], match[4], match[5]);
      segments.push({
        type: 'repeat_section',
        text: repeatText,
        repeatCount: count,
        originalTag: match[0],
      });

      lastIndex = matchIndex + match[0].length;
    }

    // Remaining text after last match
    if (lastIndex < trimmed.length) {
      const postText = trimmed.slice(lastIndex);
      if (postText) segments.push({ type: 'text', text: postText });
    }

    return {
      segments,
      isEmpty: false,
    };
  }

  // 2. If no bracketed section, check for whole line repeat marker at the end
  const lineMatch = trimmed.match(LINE_REPEAT_REGEX);
  if (lineMatch) {
    const count = parseRepeatCount(lineMatch[1], lineMatch[2], lineMatch[3], lineMatch[4]);
    const cleanText = trimmed.replace(LINE_REPEAT_REGEX, '').trim();

    return {
      segments: [{ type: 'text', text: cleanText }],
      lineRepeatCount: count,
      originalTag: lineMatch[0].trim(),
      isEmpty: false,
    };
  }

  // 3. Regular line
  return {
    segments: [{ type: 'text', text: trimmed }],
    isEmpty: false,
  };
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
 * Inserts a repeat tag (like '(x2)') cleanly at the cursor / selection of a textarea.
 * If user selected words, wraps them in [selected words](x2) to create a partial section repeat.
 */
export function insertRepeatTagAtCursor(
  text: string,
  tag: string,
  cursorStart: number,
  cursorEnd: number,
  forceSection = false
): { text: string; nextCursor: number } {
  const cleanTag = tag.trim().replace(/^[\(\[]|[\)\]]$/g, '');
  const before = text.slice(0, cursorStart);
  const selected = text.slice(cursorStart, cursorEnd);
  const after = text.slice(cursorEnd);

  if (selected.trim() || forceSection) {
    // Wrap selection into bracketed section repeat: [selection](x2)
    const words = selected.trim() || 'words';
    const wrapped = `[${words}](${cleanTag})`;
    const updatedText = before + wrapped + after;
    return {
      text: updatedText,
      nextCursor: before.length + wrapped.length,
    };
  }

  // Append line repeat tag
  const tagWithSpace = ` (${cleanTag})`;
  const updatedText = before + tagWithSpace + after;
  return {
    text: updatedText,
    nextCursor: before.length + tagWithSpace.length,
  };
}
