export default function BegenaStrings() {
  // A simplified, stylized line-art rendering of the Begena's string frame —
  // five vertical strings of varying length anchored to a rounded body,
  // used as the landing page's visual identity instead of generic decoration.
  const strings = [
    { x: 60, height: 140 },
    { x: 100, height: 180 },
    { x: 140, height: 210 },
    { x: 180, height: 180 },
    { x: 220, height: 140 },
  ];

  return (
    <svg viewBox="0 0 280 260" className="w-full h-full">
      <rect x="20" y="20" width="240" height="16" rx="8" fill="var(--color-ink)" />
      {strings.map((s, i) => (
        <line
          key={i}
          x1={s.x}
          y1={36}
          x2={s.x}
          y2={36 + s.height}
          stroke={i === 2 ? 'var(--color-accent)' : 'var(--color-ink)'}
          strokeWidth={i === 2 ? 3 : 2}
          strokeOpacity={i === 2 ? 1 : 0.25}
          strokeLinecap="round"
        />
      ))}
      <path
        d="M 30 230 Q 140 260 250 230 L 250 250 Q 140 275 30 250 Z"
        fill="var(--color-ink)"
        fillOpacity={0.08}
      />
    </svg>
  );
}