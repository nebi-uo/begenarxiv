import { Music } from 'lucide-react';

export default function CatalogueHeroBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-44 md:h-56 mb-8 border border-zinc-200 bg-zinc-950 shadow-sm">
      <img
        src="/images/contextual-hero.jpg"
        alt="Begena Archive Banner"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-85"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
          <Music size={12} /> Begenarxiv Archive
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Explore the Complete Catalogue
        </h2>
        <p className="text-white/70 text-xs md:text-sm max-w-md mt-1">
          Every mezmur is mapped to numbers notation with sample-accurate ornament roll timings.
        </p>
      </div>
    </div>
  );
}
