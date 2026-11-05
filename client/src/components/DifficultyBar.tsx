const LEVELS = ['practice', 'beginner', 'intermediate', 'advanced'] as const;

export default function DifficultyBar({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const levelIdx = LEVELS.indexOf(difficulty.toLowerCase() as (typeof LEVELS)[number]);
  const filledIndex = levelIdx !== -1 ? levelIdx + 1 : 0;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex gap-1 items-center">
        {LEVELS.map((_, i) => (
          <span
            key={i}
            className={`h-1 w-2.5 rounded-full transition-colors ${
              i < filledIndex ? 'bg-zinc-950' : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        {difficulty}
      </span>
    </div>
  );
}
