const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  beginner: {
    label: 'Beginner',
    color: '#059669',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  intermediate: {
    label: 'Intermediate',
    color: '#D97706',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  advanced: {
    label: 'Advanced',
    color: '#E11D48',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export default function DifficultyBar({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const cfg = CONFIG[difficulty] ?? CONFIG.beginner;
  const filledIndex = LEVELS.indexOf(difficulty as (typeof LEVELS)[number]) + 1;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex gap-1 items-center">
        {LEVELS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-4 rounded-full transition-colors ${
              i < filledIndex ? 'opacity-100' : 'bg-zinc-200 opacity-60'
            }`}
            style={{ backgroundColor: i < filledIndex ? cfg.color : undefined }}
          />
        ))}
      </div>
      <span
        className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}
      >
        {cfg.label}
      </span>
    </div>
  );
}
