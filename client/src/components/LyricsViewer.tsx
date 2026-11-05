import { useMemo } from 'react';
import { Repeat } from 'lucide-react';
import { parseLyrics } from '../utils/lyrics';

interface Props {
  lyrics: string | null | undefined;
  className?: string;
}

export default function LyricsViewer({ lyrics, className = '' }: Props) {
  const parsedLines = useMemo(() => parseLyrics(lyrics), [lyrics]);

  if (parsedLines.length === 0) return null;

  return (
    <div
      className={`p-4 sm:p-5 bg-zinc-50/70 rounded-xl border border-zinc-200 text-zinc-900 text-sm leading-relaxed font-sans space-y-1.5 ${className}`}
    >
      {parsedLines.map((line, idx) => {
        if (line.isEmpty) {
          return <div key={idx} className="h-3.5" aria-hidden="true" />;
        }

        return (
          <div
            key={idx}
            className={`flex items-baseline justify-between gap-4 py-0.5 group ${
              line.repeatCount ? 'bg-zinc-100/50 -mx-2 px-2 rounded' : ''
            }`}
          >
            <span className="text-zinc-900 tracking-wide font-normal">{line.text}</span>

            {line.repeatCount && (
              <span
                title={`Repeat verse ${line.repeatCount} times`}
                className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-white border border-zinc-300 text-zinc-950 font-semibold shrink-0 select-none shadow-2xs"
              >
                <Repeat size={10} className="text-zinc-500" />
                <span>{line.repeatCount}x</span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

