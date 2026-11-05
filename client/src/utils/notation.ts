export type TokenType = 'note' | 'roll' | 'phrase_break' | 'rest' | 'invalid';

export interface ParsedNotationToken {
  text: string;
  type: TokenType;
  isValid: boolean;
  positions: number[];
  durationMs: number;
}

export interface ParsedNotationLine {
  lineNumber: number;
  tokens: ParsedNotationToken[];
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
 * Parses full raw notation text into lines of tokens
 */
export function parseRawNotation(raw: string): ParsedNotationLine[] {
  if (!raw.trim()) return [];
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return lines.map((lineStr, lineIdx) => {
    const rawTokens = lineStr.split(/[\s,]+/).filter(Boolean);
    const tokens = rawTokens.map(parseNotationToken);
    return {
      lineNumber: lineIdx + 1,
      tokens,
    };
  });
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

