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

  // 24x24 pixel icon for navigation, tags, and cards
  if (size === 'icon') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 pixel-art inline-block select-none fill-current"
        shapeRendering="crispEdges"
      >
        {/* Curved scroll horns at top */}
        <rect x="2" y="1" width="3" height="2" />
        <rect x="19" y="1" width="3" height="2" />
        {/* Top crossbar */}
        <rect x="3" y="3" width="18" height="2" />
        {/* Tall slender upright arms */}
        <rect x="4" y="5" width="2" height="11" />
        <rect x="18" y="5" width="2" height="11" />
        {/* 10 Strings (represented as 5 pairs) */}
        <rect x="8" y="5" width="1" height="11" opacity="0.8" />
        <rect x="10" y="5" width="1" height="11" opacity="0.8" />
        <rect x="12" y="5" width="1" height="11" opacity="0.8" />
        <rect x="14" y="5" width="1" height="11" opacity="0.8" />
        <rect x="16" y="5" width="1" height="11" opacity="0.8" />
        {/* Compact soundbox */}
        <rect x="5" y="16" width="14" height="6" />
        {/* Bridge */}
        <rect x="8" y="18" width="8" height="2" fill="#FFFFFF" />
        {/* Two bottom feet */}
        <rect x="8" y="22" width="2" height="2" />
        <rect x="14" y="22" width="2" height="2" />
      </svg>
    );
  }

  // Exact 10 strings matching authentic Begena:
  // 5 primary playing positions [1, 2, 3, 4, 5] mapped to alternate strings
  // Drone strings are sympathetic resonators
  const stringPositions = [
    { id: 1, posIndex: 1, yokeX: 104, bridgeX: 105, isPrimary: true },
    { id: 2, posIndex: null, yokeX: 116, bridgeX: 116, isPrimary: false },
    { id: 3, posIndex: 2, yokeX: 128, bridgeX: 128, isPrimary: true },
    { id: 4, posIndex: null, yokeX: 140, bridgeX: 140, isPrimary: false },
    { id: 5, posIndex: 3, yokeX: 152, bridgeX: 151, isPrimary: true },
    { id: 6, posIndex: null, yokeX: 168, bridgeX: 169, isPrimary: false },
    { id: 7, posIndex: 4, yokeX: 180, bridgeX: 180, isPrimary: true },
    { id: 8, posIndex: null, yokeX: 192, bridgeX: 192, isPrimary: false },
    { id: 9, posIndex: 5, yokeX: 204, bridgeX: 204, isPrimary: true },
    { id: 10, posIndex: null, yokeX: 216, bridgeX: 215, isPrimary: false },
  ];

  const primaryPlayingStrings = [
    { pos: 1, note: currentTuning[1]?.note ?? 'E' },
    { pos: 2, note: currentTuning[2]?.note ?? 'C' },
    { pos: 3, note: currentTuning[3]?.note ?? 'D' },
    { pos: 4, note: currentTuning[4]?.note ?? 'A' },
    { pos: 5, note: currentTuning[5]?.note ?? 'G' },
  ];

  // Exact authentic stature from photograph (ViewBox 320 x 520)
  const width = size === 'hero' ? 300 : 210;
  const height = size === 'hero' ? 488 : 341;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <svg
        viewBox="0 0 320 520"
        width={width}
        height={height}
        className="pixel-art select-none"
        shapeRendering="crispEdges"
      >
        <defs>
          {/* 1-bit Checkerboard Dither for Parchment Hide */}
          <pattern id="parchmentDither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="#000000" opacity="0.08" />
            <rect x="2" y="2" width="2" height="2" fill="#000000" opacity="0.08" />
          </pattern>
          {/* 1-bit Dark Dither for Shading */}
          <pattern id="darkDither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="#000000" opacity="0.25" />
            <rect x="2" y="2" width="2" height="2" fill="#000000" opacity="0.25" />
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

        {/* ============================================================== */}
        {/* 1. TOP CURVED SCROLL HORNS (Volute / Ram's Horns from Photo)  */}
        {/* ============================================================== */}
        {/* Left Scroll Horn */}
        <g>
          {/* Outer scroll contour */}
          <rect x="36" y="52" width="24" height="26" fill="#000000" />
          <rect x="26" y="38" width="16" height="20" fill="#000000" />
          <rect x="28" y="24" width="22" height="18" fill="#000000" />
          <rect x="44" y="18" width="28" height="14" fill="#000000" />
          <rect x="66" y="24" width="14" height="18" fill="#000000" />
          <rect x="62" y="36" width="12" height="12" fill="#000000" />
          {/* Inner scroll eye cutout */}
          <rect x="46" y="28" width="10" height="10" fill="#FAFAFA" />
          <rect x="50" y="32" width="2" height="2" fill="#000000" />
        </g>

        {/* Right Scroll Horn */}
        <g>
          {/* Outer scroll contour */}
          <rect x="260" y="52" width="24" height="26" fill="#000000" />
          <rect x="278" y="38" width="16" height="20" fill="#000000" />
          <rect x="270" y="24" width="22" height="18" fill="#000000" />
          <rect x="248" y="18" width="28" height="14" fill="#000000" />
          <rect x="240" y="24" width="14" height="18" fill="#000000" />
          <rect x="246" y="36" width="12" height="12" fill="#000000" />
          {/* Inner scroll eye cutout */}
          <rect x="264" y="28" width="10" height="10" fill="#FAFAFA" />
          <rect x="268" y="32" width="2" height="2" fill="#000000" />
        </g>

        {/* ============================================================== */}
        {/* 2. TOP CROSSBAR (YOKE / BERENTA)                              */}
        {/* ============================================================== */}
        <rect x="48" y="56" width="224" height="22" fill="#000000" />
        {/* Traditional Ethiopian Carved Geometric Band on Yoke */}
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

        {/* ============================================================== */}
        {/* 3. 10 WOODEN TUNING PEGS WITH LEATHER COILS                   */}
        {/* ============================================================== */}
        {stringPositions.map((s) => (
          <g key={s.id}>
            {/* Wooden peg head */}
            <rect x={s.yokeX - 3} y="26" width="7" height="6" fill="#000000" />
            <rect x={s.yokeX - 1} y="22" width="3" height="4" fill="#000000" />
            {/* Wooden peg shaft */}
            <rect x={s.yokeX - 2} y="32" width="5" height="24" fill="#000000" />
            <rect x={s.yokeX - 1} y="32" width="1" height="24" fill="#71717A" />
            {/* Leather binding coil across yoke */}
            <rect x={s.yokeX - 3} y="58" width="7" height="18" fill="#18181B" />
            <rect x={s.yokeX - 2} y="62" width="5" height="2" fill="#FFFFFF" opacity="0.3" />
            <rect x={s.yokeX - 2} y="70" width="5" height="2" fill="#FFFFFF" opacity="0.3" />
          </g>
        ))}

        {/* ============================================================== */}
        {/* 4. HANGING LEATHER TUNING WEIGHT / POUCH (Korkoro) ON RIGHT   */}
        {/* ============================================================== */}
        {/* Thin leather suspension cord */}
        <line
          x1="234"
          y1="78"
          x2="234"
          y2="236"
          stroke="#000000"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        {/* Teardrop leather weight */}
        <polygon points="234,234 227,248 241,248" fill="#000000" />
        <rect x="226" y="248" width="16" height="22" rx="2" fill="#000000" />
        <polygon points="227,270 241,270 234,278" fill="#000000" />
        {/* Weight leather texture */}
        <rect x="228" y="250" width="12" height="18" fill="#27272A" />
        <rect x="230" y="252" width="4" height="4" fill="#52525B" />

        {/* ============================================================== */}
        {/* 5. TALL, SLENDER UPRIGHT ARMS (Tenten) - Outward Splay Trapeze*/}
        {/* ============================================================== */}
        {/* Left Arm: From Yoke (x=64..80) down to Soundbox (x=88..104) */}
        <polygon points="64,78 80,78 104,350 88,350" fill="#000000" />
        {/* Left Arm Carved Diamond Pattern Relief */}
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

        {/* Right Arm: From Yoke (x=240..256) down to Soundbox (x=216..232) */}
        <polygon points="240,78 256,78 232,350 216,350" fill="#000000" />
        {/* Right Arm Carved Diamond Pattern Relief */}
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

        {/* ============================================================== */}
        {/* 6. RECTANGULAR SOUNDBOX (Body / Parchment Hide Face)          */}
        {/* ============================================================== */}
        {/* Outer Dark Wooden Frame */}
        <polygon points="84,346 236,346 242,468 78,468" fill="#000000" />
        {/* Stretched Animal Hide Parchment Front */}
        <polygon points="90,352 230,352 236,462 84,462" fill="#F4F4F5" />
        {/* 1-Bit Dither Texture across Parchment */}
        <polygon points="90,352 230,352 236,462 84,462" fill="url(#parchmentDither)" />

        {/* Ethiopian Cross / Diamond Soundhole in Center */}
        <g transform="translate(160, 380)">
          <rect x="-6" y="-6" width="12" height="12" fill="#000000" />
          <rect x="-10" y="-2" width="20" height="4" fill="#000000" />
          <rect x="-2" y="-10" width="4" height="20" fill="#000000" />
          <rect x="-2" y="-2" width="4" height="4" fill="#FAFAFA" />
        </g>

        {/* ============================================================== */}
        {/* 7. WIDE WOODEN BRIDGE WITH 10 LEATHER DAMPERS (Birr / Enshish)*/}
        {/* ============================================================== */}
        {/* Wooden Bridge Base with arches */}
        <rect x="94" y="404" width="132" height="14" fill="#000000" />
        <rect x="96" y="406" width="128" height="4" fill="#27272A" />
        {/* 10 Individual Leather Dampers on Bridge */}
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

        {/* ============================================================== */}
        {/* 8. LOWER TAILPIECE ANCHORING ALL 10 STRINGS                   */}
        {/* ============================================================== */}
        <rect x="98" y="454" width="124" height="8" fill="#000000" />
        {/* 10 string knots */}
        {stringPositions.map((s) => (
          <rect
            key={`knot-${s.id}`}
            x={s.bridgeX - 2}
            y="456"
            width="4"
            height="4"
            fill="#FFFFFF"
            opacity="0.4"
          />
        ))}

        {/* ============================================================== */}
        {/* 9. TWO POINTED BONE / IVORY FEET (Exact Feature from Photo)   */}
        {/* ============================================================== */}
        {/* Left ivory foot */}
        <polygon
          points="104,468 116,468 112,498 102,498"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        <rect x="105" y="488" width="4" height="8" fill="#000000" opacity="0.3" />

        {/* Right ivory foot */}
        <polygon
          points="204,468 216,468 218,498 208,498"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        <rect x="211" y="488" width="4" height="8" fill="#000000" opacity="0.3" />

        {/* ============================================================== */}
        {/* 10. THE 10 STRINGS WITH ACTIVE PLUCKING VIBRATIONS             */}
        {/* ============================================================== */}
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
              {/* Wide click hitbox */}
              {interactive && posNum !== null && (
                <rect
                  x={str.yokeX - 8}
                  y="76"
                  width="16"
                  height="380"
                  fill="transparent"
                />
              )}

              {/* String Plucking Vibration Animation */}
              {isPlucked ? (
                <g>
                  {/* Vibrating ghost lines */}
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
                  {/* Solid core line */}
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
                  opacity={isPrimary ? 0.95 : 0.45}
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

      {/* Primary Playing String Selector Pills underneath (Tizita: 1=E, 2=C, 3=D, 4=A, 5=G) */}
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
                    ? 'bg-black text-white scale-105 shadow-xs'
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
