import PixelBegena from './PixelBegena';

export default function CatalogueHeroBanner() {
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-black bg-black p-6 md:p-8 mb-6 text-white shadow-sm select-none">
      {/* Handcrafted Pure SVG Pixel Dither Background */}
      <svg
        viewBox="0 0 800 140"
        className="absolute inset-0 w-full h-full object-cover pixel-art opacity-25 pointer-events-none"
        shapeRendering="crispEdges"
      >
        <defs>
          <pattern id="catDither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="#FFFFFF" />
            <rect x="2" y="2" width="2" height="2" fill="#FFFFFF" />
          </pattern>
        </defs>
        {/* Sky with dither pattern */}
        <rect x="0" y="0" width="800" height="140" fill="url(#catDither)" opacity="0.3" />
        {/* Mountain ridge outline */}
        <polygon points="0,140 140,60 280,140" fill="#000000" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" />
        <polygon points="220,140 440,30 660,140" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="580,140 700,70 820,140" fill="#000000" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" />
      </svg>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-zinc-300 uppercase tracking-widest">
            <PixelBegena size="icon" />
            <span className="pixel-tag">10-STRING ARCHIVE</span>
            <span>NOTATION REPERTOIRE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Mezmur Repertoire
          </h2>
          <p className="text-zinc-300 text-xs md:text-sm max-w-lg mt-1 font-sans">
            Traditional Begena hymns in Tizita, Selamta, and Anchi-Hoye modes with synchronized numbers notation.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-200 bg-zinc-900 border border-zinc-700 px-3.5 py-2 rounded">
          <span className="text-white font-bold">[ / ]</span>
          <span>FOCUS SEARCH</span>
        </div>
      </div>
    </div>
  );
}
