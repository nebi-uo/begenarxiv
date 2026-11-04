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

  // 24x24 pixel icon for navbar, headers, and cards
  if (size === 'icon') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 pixel-art inline-block select-none fill-current"
        shapeRendering="crispEdges"
      >
        {/* Top curved horn scrolls */}
        <rect x="2" y="1" width="3" height="2" />
        <rect x="19" y="1" width="3" height="2" />
        {/* Crossbar */}
        <rect x="3" y="3" width="18" height="2" />
        {/* Upright arms */}
        <rect x="4" y="5" width="2" height="11" />
        <rect x="18" y="5" width="2" height="11" />
        {/* 10 Strings (represented as 5 pairs) */}
        <rect x="7" y="5" width="1" height="11" opacity="0.6" />
        <rect x="9" y="5" width="1" height="11" opacity="0.6" />
        <rect x="11" y="5" width="1" height="11" opacity="0.6" />
        <rect x="13" y="5" width="1" height="11" opacity="0.6" />
        <rect x="15" y="5" width="1" height="11" opacity="0.6" />
        {/* Soundbox */}
        <rect x="4" y="16" width="16" height="6" />
        {/* Bridge */}
        <rect x="8" y="18" width="8" height="2" fill="#FFFFFF" />
        {/* 2 Feet at bottom */}
        <rect x="7" y="22" width="2" height="2" />
        <rect x="15" y="22" width="2" height="2" />
      </svg>
    );
  }

  // Exact 10 strings x-coordinates across the 320x400 grid
  // In Ethiopian tradition, 5 strings are primary playing positions (1 to 5),
  // each paired with a secondary string for acoustic resonance and drone.
  const stringPositions = [
    { id: 1, posIndex: 1, x: 96, isPrimary: true },
    { id: 2, posIndex: null, x: 108, isPrimary: false },
    { id: 3, posIndex: 2, x: 122, isPrimary: true },
    { id: 4, posIndex: null, x: 136, isPrimary: false },
    { id: 5, posIndex: 3, x: 152, isPrimary: true },
    { id: 6, posIndex: null, x: 168, isPrimary: false },
    { id: 7, posIndex: 4, x: 184, isPrimary: true },
    { id: 8, posIndex: null, x: 198, isPrimary: false },
    { id: 9, posIndex: 5, x: 212, isPrimary: true },
    { id: 10, posIndex: null, x: 224, isPrimary: false },
  ];

  const primaryPlayingStrings = [
    { pos: 1, note: currentTuning[1]?.note ?? 'E' },
    { pos: 2, note: currentTuning[2]?.note ?? 'C' },
    { pos: 3, note: currentTuning[3]?.note ?? 'D' },
    { pos: 4, note: currentTuning[4]?.note ?? 'A' },
    { pos: 5, note: currentTuning[5]?.note ?? 'G' },
  ];

  const width = size === 'hero' ? 320 : 220;
  const height = size === 'hero' ? 400 : 280;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <svg
        viewBox="0 0 320 400"
        width={width}
        height={height}
        className="pixel-art select-none"
        shapeRendering="crispEdges"
      >
        {/* Top curved wooden horn scrolls on left and right (from photo 2) */}
        {/* Left carved horn */}
        <rect x="28" y="14" width="28" height="6" fill="#09090B" />
        <rect x="22" y="18" width="10" height="14" fill="#09090B" />
        <rect x="30" y="20" width="8" height="6" fill="#09090B" />

        {/* Right carved horn */}
        <rect x="264" y="14" width="28" height="6" fill="#09090B" />
        <rect x="288" y="18" width="10" height="14" fill="#09090B" />
        <rect x="282" y="20" width="8" height="6" fill="#09090B" />

        {/* 10 Tuning Pegs on crossbar */}
        {[86, 100, 114, 128, 144, 160, 176, 192, 206, 220].map((pegX, i) => (
          <g key={i}>
            <rect x={pegX} y="16" width="6" height="14" fill="#18181B" />
            <rect x={pegX + 1} y="12" width="4" height="4" fill="#27272A" />
          </g>
        ))}

        {/* Crossbar (Yoke) */}
        <rect x="44" y="28" width="232" height="18" fill="#09090B" />
        {/* Carved geometric band on yoke */}
        <rect x="52" y="32" width="216" height="3" fill="#FFFFFF" opacity="0.3" />

        {/* Hanging Leather Tuning Weight / Pouch with cord (from photo 2) */}
        <line x1="226" y1="44" x2="236" y2="180" stroke="#71717A" strokeWidth="1" strokeDasharray="2 2" />
        <rect x="230" y="180" width="12" height="22" rx="2" fill="#27272A" />
        <rect x="232" y="184" width="8" height="14" fill="#18181B" />

        {/* Left Upright Arm with traditional etched carvings */}
        <polygon points="58,46 74,46 56,270 38,270" fill="#09090B" />
        {/* Arm carving highlight */}
        <line x1="64" y1="48" x2="48" y2="268" stroke="#FFFFFF" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />

        {/* Right Upright Arm with traditional etched carvings */}
        <polygon points="246,46 262,46 282,270 264,270" fill="#09090B" />
        {/* Arm carving highlight */}
        <line x1="254" y1="48" x2="272" y2="268" stroke="#FFFFFF" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />

        {/* Rectangular Soundbox (Hide-Covered Body) */}
        <rect x="38" y="260" width="244" height="114" fill="#09090B" />
        {/* Soundbox Parchment Face */}
        <rect x="44" y="266" width="232" height="102" fill="#F4F4F5" />
        {/* Subtle dithered texture on hide */}
        <rect x="48" y="270" width="224" height="94" fill="#E4E4E7" opacity="0.5" />

        {/* Upper Wooden Bridge with leather dampers */}
        <rect x="80" y="294" width="160" height="14" fill="#18181B" />
        {/* 10 individual leather dampers on bridge */}
        {[86, 98, 110, 122, 136, 150, 164, 178, 192, 206].map((dX, i) => (
          <rect key={i} x={dX} y="296" width="6" height="4" fill="#D97706" opacity="0.85" />
        ))}

        {/* Lower Tailpiece Anchoring the 10 Strings */}
        <rect x="94" y="360" width="132" height="10" fill="#18181B" />

        {/* Two Bone/Horn Feet Protruding from Bottom (exact feature from photo 2) */}
        <polygon points="98,370 106,370 102,388 96,388" fill="#E4E4E7" stroke="#09090B" strokeWidth="1" />
        <polygon points="214,370 222,370 224,388 218,388" fill="#E4E4E7" stroke="#09090B" strokeWidth="1" />

        {/* 10 Strings running vertically from yoke to tailpiece */}
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
              {/* Wide clickable area for the 5 playing positions */}
              {interactive && posNum !== null && (
                <rect
                  x={str.x - 10}
                  y="46"
                  width="20"
                  height="314"
                  fill="transparent"
                />
              )}

              {/* Plucking Vibration Animation */}
              {isPlucked ? (
                <g>
                  {/* Vibrating ghost lines */}
                  <line
                    x1={str.x - 3}
                    y1="46"
                    x2={str.x - 2}
                    y2="360"
                    stroke="#09090B"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity="0.4"
                  />
                  <line
                    x1={str.x + 3}
                    y1="46"
                    x2={str.x + 2}
                    y2="360"
                    stroke="#09090B"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity="0.4"
                  />
                  {/* Active main string line */}
                  <line
                    x1={str.x}
                    y1="46"
                    x2={str.x}
                    y2="360"
                    stroke="#09090B"
                    strokeWidth="3"
                  />
                </g>
              ) : (
                <line
                  x1={str.x}
                  y1="46"
                  x2={str.x}
                  y2="360"
                  stroke={isPrimary ? '#09090B' : '#71717A'}
                  strokeWidth={isPrimary ? '1.5' : '1'}
                  opacity={isPrimary ? 0.9 : 0.45}
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

      {/* String Selector Pills underneath */}
      {interactive && (
        <div className="flex items-center justify-between w-full max-w-[280px] mt-3 px-1">
          {primaryPlayingStrings.map((str) => {
            const isPlucked = activeString === str.pos;
            return (
              <button
                key={str.pos}
                onClick={() => handleStringClick(str.pos)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded cursor-pointer transition-colors font-mono ${
                  isPlucked
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200'
                }`}
                title={`String ${str.pos} (${str.note}) - ${mode}`}
              >
                <span className="text-xs font-bold">[{str.pos}]</span>
                <span className="text-[9px] opacity-75">{str.note}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
