const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const COLOR: Record<string, string> = {
  beginner: '#1FAE7A',
  intermediate: '#F2A93B',
  advanced: '#D9534F',
};

export default function DifficultyBar({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const filled = LEVELS.indexOf(difficulty as typeof LEVELS[number]) + 1;
  const color = COLOR[difficulty];

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1">
        {LEVELS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-5 rounded-full"
            style={{ backgroundColor: i < filled ? color : '#E9E7E2' }}
          />
        ))}
      </div>
      <span className="text-xs capitalize" style={{ color }}>{difficulty}</span>
    </div>
  );
}