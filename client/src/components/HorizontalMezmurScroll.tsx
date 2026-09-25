import MezmurCardCompact from './MezmurCardCompact';
import type { MezmurListItem } from '../types';

interface Props {
  title: string;
  items: MezmurListItem[];
  onSelect: (id: number) => void;
}

export default function HorizontalMezmurScroll({ title, items, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-white/60 text-xs uppercase tracking-wide mb-3">{title}</p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 md:mx-0 md:px-0">
        {items.map((m) => (
          <MezmurCardCompact key={m.id} mezmur={m} onClick={() => onSelect(m.id)} />
        ))}
      </div>
    </div>
  );
}