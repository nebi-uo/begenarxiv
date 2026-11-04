import { useTonePlayer, type BegenaTuneMode } from '../hooks/useTonePlayer';

interface Props {
  activeString?: number | null;
  onPluck?: (position: number) => void;
  size?: 'hero' | 'compact' | 'icon';
  interactive?: boolean;
  mode?: BegenaTuneMode;
}

export default function PixelBegena({
  activeString = null,
  onPluck,
  size = 'hero',
  interactive = true,
  mode = 'Tizita',
}: Props) {
  const { pluckString, currentTuning } = useTonePlayer(mode);

  const handleStringClick = (pos: number) => {
    if (!interactive) return;
    pluckString(pos);
    if (onPluck) onPluck(pos);
  };

  // Exact 10 strings matching authentic Begena:
  // String 1, skip 2, String 2, skip 1, String 3, skip 1, String 4, skip 1, String 5
  const stringPositions = [
    { id: 1, posIndex: 1, yokeX: 104, bridgeX: 104, isPrimary: true },
    { id: 2, posIndex: null, yokeX: 117, bridgeX: 117, isPrimary: false },
    { id: 3, posIndex: null, yokeX: 130, bridgeX: 130, isPrimary: false },
    { id: 4, posIndex: 2, yokeX: 143, bridgeX: 143, isPrimary: true },
    { id: 5, posIndex: null, yokeX: 156, bridgeX: 156, isPrimary: false },
    { id: 6, posIndex: 3, yokeX: 169, bridgeX: 169, isPrimary: true },
    { id: 7, posIndex: null, yokeX: 182, bridgeX: 182, isPrimary: false },
    { id: 8, posIndex: 4, yokeX: 195, bridgeX: 195, isPrimary: true },
    { id: 9, posIndex: null, yokeX: 208, bridgeX: 208, isPrimary: false },
    { id: 10, posIndex: 5, yokeX: 221, bridgeX: 221, isPrimary: true },
  ];

  const primaryPlayingStrings = [
    { pos: 1, note: currentTuning[1]?.note ?? 'E' },
    { pos: 2, note: currentTuning[2]?.note ?? 'C' },
    { pos: 3, note: currentTuning[3]?.note ?? 'D' },
    { pos: 4, note: currentTuning[4]?.note ?? 'A' },
    { pos: 5, note: currentTuning[5]?.note ?? 'G' },
  ];

  // Exact scaled-down Begena SVG for app logo
  if (size === 'icon') {
    return (
      <svg
        viewBox="0 0 320 520"
        className="w-8 h-10 pixel-art select-none inline-block shrink-0"
        shapeRendering="crispEdges"
      >
        {/* Top Scroll Horns */}
        <g fill="#000000">
          <rect x="34" y="52" width="26" height="26" />
          <rect x="22" y="38" width="18" height="20" />
          <rect x="24" y="24" width="24" height="18" />
          <rect x="42" y="16" width="30" height="14" />
          <rect x="68" y="22" width="14" height="20" />
          <rect x="62" y="36" width="14" height="14" />

          <rect x="260" y="52" width="26" height="26" />
          <rect x="280" y="38" width="18" height="20" />
          <rect x="272" y="24" width="24" height="18" />
          <rect x="248" y="16" width="30" height="14" />
          <rect x="238" y="22" width="14" height="20" />
          <rect x="244" y="36" width="14" height="14" />

          {/* Yoke */}
          <rect x="46" y="56" width="228" height="22" />

          {/* 10 Pegs */}
          {stringPositions.map((s) => (
            <rect key={s.id} x={s.yokeX - 2} y="24" width="4.5" height="32" />
          ))}
        </g>

        {/* Hanging Weight */}
        <line x1="236" y1="78" x2="236" y2="230" stroke="#000000" strokeWidth="2.5" strokeDasharray="3 3" />
        <rect x="228" y="230" width="16" height="24" rx="2" fill="#000000" />

        {/* Arms */}
        <polygon points="62,78 80,78 106,346 88,346" fill="#000000" />
        <polygon points="238,78 256,78 230,346 212,346" fill="#000000" />

        {/* Soundbox (Light subtle parchment fill so strings stand out cleanly) */}
        <polygon points="84,346 234,346 242,466 76,466" fill="#FAFAFA" stroke="#000000" strokeWidth="3.5" />
        <rect x="90" y="352" width="138" height="4" fill="#000000" opacity="0.15" />

        {/* Bridge */}
        <rect x="92" y="402" width="134" height="16" fill="#000000" rx="1" />
        {/* String Notches on Bridge */}
        <g fill="#FFFFFF">
          {stringPositions.map((s) => (
            <rect key={`notch-${s.id}`} x={s.bridgeX - 1} y="403" width="2" height="14" />
          ))}
        </g>

        {/* Tailpiece */}
        <rect x="96" y="452" width="126" height="8" fill="#000000" rx="1" />

        {/* Feet */}
        <polygon points="102,466 116,466 112,498 100,498" fill="#000000" />
        <polygon points="202,466 216,466 218,498 206,498" fill="#000000" />

        {/* 10 Strings: String 1, skip 2, String 2, skip 1, String 3, skip 1, String 4, skip 1, String 5 */}
        {stringPositions.map((s) => (
          <line
            key={`str-${s.id}`}
            x1={s.yokeX}
            y1={56}
            x2={s.bridgeX}
            y2={452}
            stroke="#000000"
            strokeWidth={s.isPrimary ? 3.2 : 1.5}
            opacity={s.isPrimary ? 1 : 0.6}
          />
        ))}
      </svg>
    );
  }

  // Responsive width & height
  const containerMaxWidth = size === 'hero' ? 'max-w-[280px] sm:max-w-[300px]' : 'max-w-[190px] sm:max-w-[210px]';

  return (
    <div className={`relative inline-flex flex-col items-center select-none w-full ${containerMaxWidth}`}>
      <svg
        viewBox="0 0 320 520"
        className="w-full h-auto pixel-art select-none"
        shapeRendering="crispEdges"
      >
        <defs>
          <pattern id="parchmentDither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="#000000" opacity="0.08" />
            <rect x="2" y="2" width="2" height="2" fill="#000000" opacity="0.08" />
          </pattern>
        </defs>

        {/* Framing border */}
        <rect
          x="12"
          y="8"
          width="296"
          height="504"
          fill="#FAFAFA"
          stroke="#E4E4E7"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* 1. TOP CURVED SCROLL HORNS */}
        <g>
          <rect x="36" y="52" width="24" height="26" fill="#000000" />
          <rect x="26" y="38" width="16" height="20" fill="#000000" />
          <rect x="28" y="24" width="22" height="18" fill="#000000" />
          <rect x="44" y="18" width="28" height="14" fill="#000000" />
          <rect x="66" y="24" width="14" height="18" fill="#000000" />
          <rect x="62" y="36" width="12" height="12" fill="#000000" />
          <rect x="46" y="28" width="10" height="10" fill="#FAFAFA" />
          <rect x="50" y="32" width="2" height="2" fill="#000000" />
        </g>

        <g>
          <rect x="260" y="52" width="24" height="26" fill="#000000" />
          <rect x="278" y="38" width="16" height="20" fill="#000000" />
          <rect x="270" y="24" width="22" height="18" fill="#000000" />
          <rect x="248" y="18" width="28" height="14" fill="#000000" />
          <rect x="240" y="24" width="14" height="18" fill="#000000" />
          <rect x="246" y="36" width="12" height="12" fill="#000000" />
          <rect x="264" y="28" width="10" height="10" fill="#FAFAFA" />
          <rect x="268" y="32" width="2" height="2" fill="#000000" />
        </g>

        {/* 2. TOP CROSSBAR (YOKE) */}
        <rect x="48" y="56" width="224" height="22" fill="#000000" />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect
            key={i}
            x={58 + i * 9}
            y="65"
            width="4"
            height="4"
            fill="#FFFFFF"
            opacity={i % 2 === 0 ? 0.8 : 0.2}
          />
        ))}

        {/* 3. 10 WOODEN TUNING PEGS */}
        {stringPositions.map((s) => (
          <g key={s.id}>
            <rect x={s.yokeX - 3} y="26" width="7" height="6" fill="#000000" />
            <rect x={s.yokeX - 1} y="22" width="3" height="4" fill="#000000" />
            <rect x={s.yokeX - 2} y="32" width="5" height="24" fill="#000000" />
            <rect x={s.yokeX - 1} y="32" width="1" height="24" fill="#71717A" />
            <rect x={s.yokeX - 3} y="58" width="7" height="18" fill="#18181B" />
            <rect x={s.yokeX - 2} y="62" width="5" height="2" fill="#FFFFFF" opacity="0.3" />
            <rect x={s.yokeX - 2} y="70" width="5" height="2" fill="#FFFFFF" opacity="0.3" />
          </g>
        ))}

        {/* 4. HANGING LEATHER TUNING WEIGHT (Korkoro) */}
        <line
          x1="236"
          y1="78"
          x2="236"
          y2="236"
          stroke="#000000"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <polygon points="236,234 229,248 243,248" fill="#000000" />
        <rect x="228" y="248" width="16" height="22" rx="2" fill="#000000" />
        <polygon points="229,270 243,270 236,278" fill="#000000" />
        <rect x="230" y="250" width="12" height="18" fill="#27272A" />

        {/* 5. TALL SLENDER UPRIGHT ARMS */}
        <polygon points="64,78 80,78 104,350 88,350" fill="#000000" />
        {Array.from({ length: 14 }).map((_, i) => {
          const cy = 96 + i * 18;
          const cx = 72 + (i / 13) * 24;
          return (
            <polygon
              key={i}
              points={`${cx},${cy - 4} ${cx + 3},${cy} ${cx},${cy + 4} ${cx - 3},${cy}`}
              fill="#FFFFFF"
              opacity="0.35"
            />
          );
        })}

        <polygon points="240,78 256,78 232,350 216,350" fill="#000000" />
        {Array.from({ length: 14 }).map((_, i) => {
          const cy = 96 + i * 18;
          const cx = 248 - (i / 13) * 24;
          return (
            <polygon
              key={i}
              points={`${cx},${cy - 4} ${cx + 3},${cy} ${cx},${cy + 4} ${cx - 3},${cy}`}
              fill="#FFFFFF"
              opacity="0.35"
            />
          );
        })}

        {/* 6. SOUNDBOX */}
        <polygon points="84,346 236,346 242,468 78,468" fill="#000000" />
        <polygon points="90,352 230,352 236,462 84,462" fill="#F4F4F5" />
        <polygon points="90,352 230,352 236,462 84,462" fill="url(#parchmentDither)" />

        {/* Center Ge'ez Diamond Cross */}
        <g transform="translate(160, 380)">
          <rect x="-6" y="-6" width="12" height="12" fill="#000000" />
          <rect x="-10" y="-2" width="20" height="4" fill="#000000" />
          <rect x="-2" y="-10" width="4" height="20" fill="#000000" />
          <rect x="-2" y="-2" width="4" height="4" fill="#FAFAFA" />
        </g>

        {/* 7. WIDE BRIDGE WITH 10 DAMPERS */}
        <rect x="94" y="404" width="134" height="14" fill="#000000" />
        <rect x="96" y="406" width="130" height="4" fill="#27272A" />
        {stringPositions.map((s) => (
          <rect
            key={`damper-${s.id}`}
            x={s.bridgeX - 3}
            y="402"
            width="6"
            height="5"
            fill="#71717A"
            stroke="#000000"
            strokeWidth="0.5"
          />
        ))}

        {/* 8. TAILPIECE */}
        <rect x="98" y="454" width="126" height="8" fill="#000000" />
        {stringPositions.map((s) => (
          <rect
            key={`knot-${s.id}`}
            x={s.bridgeX - 2}
            y="456"
            width="4"
            height="4"
            fill="#FFFFFF"
            opacity={s.isPrimary ? 0.6 : 0.25}
          />
        ))}

        {/* 9. POINTED IVORY FEET */}
        <polygon
          points="104,468 116,468 112,498 102,498"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        <rect x="105" y="488" width="4" height="8" fill="#000000" opacity="0.3" />

        <polygon
          points="204,468 216,468 218,498 208,498"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        <rect x="211" y="488" width="4" height="8" fill="#000000" opacity="0.3" />

        {/* 10. 10 STRINGS (1, skip 2, 2, skip 1, 3, skip 1, 4, skip 1, 5) */}
        {stringPositions.map((str) => {
          const isPrimary = str.isPrimary;
          const posNum = str.posIndex;
          const isPlucked = posNum !== null && activeString === posNum;

          return (
            <g
              key={str.id}
              className={interactive && posNum !== null ? 'cursor-pointer group' : ''}
              onClick={() => posNum !== null && handleStringClick(posNum)}
            >
              {interactive && posNum !== null && (
                <rect
                  x={str.yokeX - 8}
                  y="76"
                  width="16"
                  height="380"
                  fill="transparent"
                />
              )}

              {isPlucked ? (
                <g>
                  <line
                    x1={str.yokeX - 3}
                    y1="78"
                    x2={str.bridgeX - 3}
                    y2="456"
                    stroke="#000000"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                  <line
                    x1={str.yokeX + 3}
                    y1="78"
                    x2={str.bridgeX + 3}
                    y2="456"
                    stroke="#000000"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                  <line
                    x1={str.yokeX}
                    y1="78"
                    x2={str.bridgeX}
                    y2="456"
                    stroke="#000000"
                    strokeWidth="3.5"
                  />
                </g>
              ) : (
                <line
                  x1={str.yokeX}
                  y1="78"
                  x2={str.bridgeX}
                  y2="456"
                  stroke={isPrimary ? '#000000' : '#A1A1AA'}
                  strokeWidth={isPrimary ? '1.8' : '1'}
                  opacity={isPrimary ? 0.95 : 0.35}
                  className={
                    interactive && posNum !== null
                      ? 'group-hover:stroke-black group-hover:stroke-[2.5]'
                      : ''
                  }
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* String Pills [1] through [5] */}
      {interactive && (
        <div className="flex items-center justify-between w-full max-w-[280px] mt-3 px-1 font-mono">
          {primaryPlayingStrings.map((str) => {
            const isPlucked = activeString === str.pos;
            return (
              <button
                key={str.pos}
                onClick={() => handleStringClick(str.pos)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded cursor-pointer transition-all ${
                  isPlucked
                    ? 'bg-black text-white scale-105'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200'
                }`}
                title={`String ${str.pos} (${str.note}) - ${mode}`}
              >
                <span className="text-xs font-bold">[{str.pos}]</span>
                <span className="text-[10px] opacity-75">{str.note}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
