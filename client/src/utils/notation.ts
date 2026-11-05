export type TokenType = 'note' | 'roll' | 'phrase_break' | 'rest' | 'invalid';

export interface ParsedNotationToken {
  text: string;
  type: TokenType;
  isValid: boolean;
  positions: number[];
  durationMs: number;
  // Repetition metadata
  isRepeatedSection?: boolean;
  sectionRepeatCount?: number;
  sectionId?: string;
  isSectionStart?: boolean;
  isSectionEnd?: boolean;
}

export interface ParsedNotationLine {
  lineNumber: number;
  rawText: string;
  lineRepeatCount: number;
  lineRepeatTag?: string;
  tokens: ParsedNotationToken[];
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

// Matches inline bracketed notation sections: [1 3 2 4](x2) or [42 3 1](፪ ጊዜ)
export const SECTION_REPEAT_REGEX =
  /\[([^\]]+)\]\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])/gi;

// Matches whole line repeat tag at the end: (x2), (2x), (፪ ጊዜ), etc.
export const LINE_REPEAT_REGEX =
  /\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])\s*$/i;

export function parseRepeatCount(m1?: string, m2?: string, m3?: string, m4?: string): number {
  if (m1) return parseInt(m1, 10);
  if (m2) return parseInt(m2, 10);
  if (m3) return parseInt(m3, 10);
  if (m4) return GEEZ_NUMERAL_MAP[m4] || 2;
  return 2;
}

/**
 * Parses a single notation token string (e.g. "1", "42", "|", "-")
 */
export function parseNotationToken(tokenStr: string): ParsedNotationToken {
  const text = tokenStr.trim();
  if (text === '|') {
    return {
      text: '|',
      type: 'phrase_break',
      isValid: true,
      positions: [],
      durationMs: 700,
    };
  }

  if (/^\-+$/.test(text)) {
    return {
      text,
      type: 'rest',
      isValid: true,
      positions: [],
      durationMs: Math.min(text.length * 500, 3000),
    };
  }

  const digits = text.split('').map((d) => parseInt(d, 10));
  const isAllValidDigits = digits.length > 0 && digits.every((d) => !isNaN(d) && d >= 1 && d <= 5);

  if (isAllValidDigits) {
    const isRoll = digits.length > 1;
    return {
      text,
      type: isRoll ? 'roll' : 'note',
      isValid: true,
      positions: digits,
      durationMs: isRoll ? 250 : 500,
    };
  }

  return {
    text,
    type: 'invalid',
    isValid: false,
    positions: [],
    durationMs: 0,
  };
}

/**
 * Parses full raw notation text into lines of tokens, supporting section repeats [notes](x2) and line repeats (x2).
 */
export function parseRawNotation(raw: string): ParsedNotationLine[] {
  if (!raw.trim()) return [];
  const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return rawLines.map((lineStr, lineIdx) => {
    let workingLine = lineStr;
    let lineRepeatCount = 1;
    let lineRepeatTag: string | undefined = undefined;

    // 1. Check for whole line repeat marker at the end
    const lineRepeatMatch = workingLine.match(LINE_REPEAT_REGEX);
    if (lineRepeatMatch) {
      lineRepeatCount = parseRepeatCount(
        lineRepeatMatch[1],
        lineRepeatMatch[2],
        lineRepeatMatch[3],
        lineRepeatMatch[4]
      );
      lineRepeatTag = lineRepeatMatch[0].trim();
      workingLine = workingLine.replace(LINE_REPEAT_REGEX, '').trim();
    }

    // 2. Check for bracketed section repeats: [1 3 2](x2)
    const matches = Array.from(workingLine.matchAll(SECTION_REPEAT_REGEX));
    const tokens: ParsedNotationToken[] = [];

    if (matches.length > 0) {
      let lastIndex = 0;
      matches.forEach((match, secIdx) => {
        const matchIndex = match.index ?? 0;
        // Text before bracketed match
        if (matchIndex > lastIndex) {
          const preText = workingLine.slice(lastIndex, matchIndex).trim();
          if (preText) {
            const preTokens = preText.split(/[\s,]+/).filter(Boolean);
            preTokens.forEach((tokStr) => tokens.push(parseNotationToken(tokStr)));
          }
        }

        // Bracketed section tokens
        const secContent = match[1].trim();
        const secRepeatCount = parseRepeatCount(match[2], match[3], match[4], match[5]);
        const secTokens = secContent.split(/[\s,]+/).filter(Boolean);
        const sectionId = `sec-${lineIdx}-${secIdx}`;

        secTokens.forEach((tokStr, idx) => {
          const parsed = parseNotationToken(tokStr);
          parsed.isRepeatedSection = true;
          parsed.sectionRepeatCount = secRepeatCount;
          parsed.sectionId = sectionId;
          parsed.isSectionStart = idx === 0;
          parsed.isSectionEnd = idx === secTokens.length - 1;
          tokens.push(parsed);
        });

        lastIndex = matchIndex + match[0].length;
      });

      // Remainder after last match
      if (lastIndex < workingLine.length) {
        const postText = workingLine.slice(lastIndex).trim();
        if (postText) {
          const postTokens = postText.split(/[\s,]+/).filter(Boolean);
          postTokens.forEach((tokStr) => tokens.push(parseNotationToken(tokStr)));
        }
      }
    } else {
      // Normal line with no bracketed sections
      const rawTokens = workingLine.split(/[\s,]+/).filter(Boolean);
      rawTokens.forEach((tokStr) => tokens.push(parseNotationToken(tokStr)));
    }

    return {
      lineNumber: lineIdx + 1,
      rawText: lineStr,
      lineRepeatCount,
      lineRepeatTag,
      tokens,
    };
  });
}

/**
 * Expands a parsed notation line into its full sequence of playable tokens,
 * repeating any marked sections and repeating the entire line if lineRepeatCount > 1.
 */
export function expandLineTokensForPlayback(line: ParsedNotationLine): ParsedNotationToken[] {
  // 1. Group line tokens into sequential segments: plain tokens vs section repeat groups
  const segments: { tokens: ParsedNotationToken[]; repeatCount: number }[] = [];
  let currentSecId: string | null = null;
  let currentGroup: ParsedNotationToken[] = [];
  let currentRepCount = 1;

  for (const token of line.tokens) {
    if (token.isRepeatedSection && token.sectionId) {
      if (currentSecId === token.sectionId) {
        currentGroup.push(token);
      } else {
        if (currentGroup.length > 0) {
          segments.push({ tokens: currentGroup, repeatCount: currentRepCount });
        }
        currentSecId = token.sectionId;
        currentGroup = [token];
        currentRepCount = token.sectionRepeatCount || 2;
      }
    } else {
      if (currentSecId !== null) {
        if (currentGroup.length > 0) {
          segments.push({ tokens: currentGroup, repeatCount: currentRepCount });
        }
        currentSecId = null;
        currentGroup = [];
        currentRepCount = 1;
      }
      segments.push({ tokens: [token], repeatCount: 1 });
    }
  }

  if (currentGroup.length > 0) {
    segments.push({ tokens: currentGroup, repeatCount: currentRepCount });
  }

  // 2. Expand section repeats within 1 iteration of the line
  const singleLineExpansion: ParsedNotationToken[] = [];
  for (const seg of segments) {
    for (let r = 0; r < seg.repeatCount; r++) {
      for (const tok of seg.tokens) {
        singleLineExpansion.push(tok);
      }
    }
  }

  // 3. Repeat the line if lineRepeatCount > 1
  const fullExpansion: ParsedNotationToken[] = [];
  const lineReps = Math.max(line.lineRepeatCount, 1);
  for (let lr = 0; lr < lineReps; lr++) {
    for (const tok of singleLineExpansion) {
      fullExpansion.push(tok);
    }
  }

  return fullExpansion;
}

/**
 * Inserts a notation token (e.g. '|', '-') at current cursor position in a textarea.
 */
export function insertNotationTokenAtCursor(
  text: string,
  tokenToInsert: string,
  cursorStart: number,
  cursorEnd: number
): { text: string; nextCursor: number } {
  const before = text.slice(0, cursorStart);
  const after = text.slice(cursorEnd);

  // Ensure clean spacing around token
  const needSpaceBefore = before.length > 0 && !/[\s\n]$/.test(before);
  const needSpaceAfter = after.length > 0 && !/^[\s\n]/.test(after);

  const formatted = `${needSpaceBefore ? ' ' : ''}${tokenToInsert}${needSpaceAfter ? ' ' : ' '}`;
  const updatedText = before + formatted + after;
  const nextCursor = before.length + formatted.length;

  return {
    text: updatedText,
    nextCursor,
  };
}

/**
 * Inserts repeat tag (e.g. '(x2)', '[selected](x2)') at cursor in a notation textarea.
 */
export function insertNotationRepeatAtCursor(
  text: string,
  tag: string,
  cursorStart: number,
  cursorEnd: number,
  isSection = false
): { text: string; nextCursor: number } {
  const before = text.slice(0, cursorStart);
  const selected = text.slice(cursorStart, cursorEnd).trim();
  const after = text.slice(cursorEnd);

  if (isSection) {
    if (selected) {
      const wrapped = `[${selected}]${tag}`;
      const newText = before + wrapped + after;
      return { text: newText, nextCursor: before.length + wrapped.length };
    }
    const placeholder = `[notes]${tag}`;
    const needPreSpace = before.length > 0 && !/[\s\n]$/.test(before);
    const needPostSpace = after.length > 0 && !/^[\s\n]/.test(after);
    const insert = `${needPreSpace ? ' ' : ''}${placeholder}${needPostSpace ? ' ' : ' '}`;
    const newText = before + insert + after;
    return { text: newText, nextCursor: before.length + insert.length };
  }

  // Line repeat
  const needPreSpace = before.length > 0 && !/[\s\n]$/.test(before);
  const needPostSpace = after.length > 0 && !/^[\s\n]/.test(after);
  const insert = `${needPreSpace ? ' ' : ''}${tag}${needPostSpace ? ' ' : ' '}`;
  const newText = before + insert + after;
  return { text: newText, nextCursor: before.length + insert.length };
}
