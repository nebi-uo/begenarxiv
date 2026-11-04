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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3 font-mono">
        <h4 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
          {title}
        </h4>
        <span className="text-[10px] text-zinc-400">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
        {items.map((m, i) => (
          <MezmurCardCompact key={m.id} mezmur={m} index={i} onClick={() => onSelect(m.id)} />
        ))}
      </div>
    </div>
  );
}
