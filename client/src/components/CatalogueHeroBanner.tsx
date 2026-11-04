import PixelBegena from './PixelBegena';

export default function CatalogueHeroBanner() {
  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950 p-6 md:p-8 mb-6 text-white shadow-sm">
      {/* Real pixel art landscape image as subtle background */}
      <img
        src="/images/pixel-night-landscape.jpg"
        alt="Pixel art night scenery"
        className="absolute inset-0 w-full h-full object-cover object-center pixel-art opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-sky-400 uppercase tracking-widest">
            <PixelBegena size="icon" />
            <span>10-STRING NOTATION REPERTOIRE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Mezmur Repertoire
          </h2>
          <p className="text-zinc-300 text-xs md:text-sm max-w-lg mt-1 font-sans">
            Traditional hymns in Tizita, Selamta, and Anchi-Hoye modes with synchronized numbers notation.
          </p>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-300 bg-black/60 border border-zinc-700 px-3 py-1.5 rounded">
          <span>PRESS [/] TO FOCUS SEARCH</span>
        </div>
      </div>
    </div>
  );
}
