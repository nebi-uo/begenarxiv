export default function PixelSceneBanner() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden border-2 border-black bg-black text-white select-none shadow-md">
      {/* 1-Bit Monochrome Handcrafted Pixel Art SVG Scene (Inspired by Night Landscape Reference) */}
      <svg
        viewBox="0 0 960 360"
        className="w-full h-56 sm:h-72 md:h-80 pixel-art block"
        shapeRendering="crispEdges"
      >
        <defs>
          {/* Bayer 50% Checkerboard Dither */}
          <pattern id="bayer50" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="#FFFFFF" />
            <rect x="2" y="2" width="2" height="2" fill="#FFFFFF" />
          </pattern>
          {/* Bayer 25% Stipple Dither */}
          <pattern id="bayer25" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="1" height="1" fill="#FFFFFF" />
            <rect x="2" y="2" width="1" height="1" fill="#FFFFFF" />
          </pattern>
          {/* Dense 75% Dither */}
          <pattern id="bayer75" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="4" fill="#FFFFFF" />
            <rect x="0" y="0" width="2" height="2" fill="#000000" />
            <rect x="2" y="2" width="2" height="2" fill="#000000" />
          </pattern>
          {/* Water Ripple Horizontal Dither */}
          <pattern id="waterRipple" width="8" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="4" height="1" fill="#FFFFFF" opacity="0.8" />
            <rect x="4" y="2" width="4" height="1" fill="#FFFFFF" opacity="0.4" />
          </pattern>
        </defs>

        {/* 1. DEEP BLACK SKY BASE */}
        <rect x="0" y="0" width="960" height="360" fill="#000000" />

        {/* 2. DITHERED SKY BAND (Dense ordered stipple gradient across top sky) */}
        <rect x="0" y="0" width="960" height="40" fill="url(#bayer25)" opacity="0.35" />
        <rect x="0" y="40" width="960" height="30" fill="url(#bayer25)" opacity="0.18" />

        {/* Stippled Starlight Points */}
        {[
          { x: 30, y: 16 }, { x: 75, y: 32 }, { x: 120, y: 12 }, { x: 175, y: 44 },
          { x: 230, y: 20 }, { x: 285, y: 14 }, { x: 340, y: 38 }, { x: 410, y: 18 },
          { x: 470, y: 42 }, { x: 530, y: 16 }, { x: 590, y: 34 }, { x: 650, y: 14 },
          { x: 720, y: 28 }, { x: 780, y: 12 }, { x: 840, y: 36 }, { x: 910, y: 22 },
          { x: 940, y: 14 }, { x: 60, y: 64 }, { x: 490, y: 72 }, { x: 880, y: 68 },
        ].map((star, i) => (
          <rect key={i} x={star.x} y={star.y} width="2" height="2" fill="#FFFFFF" />
        ))}

        {/* 3. RETRO MOON WITH DITHERED CIRCULAR HALO (Reference style) */}
        <g transform="translate(730, 36)">
          {/* Outer Dither Aura Ring */}
          <circle cx="48" cy="48" r="46" fill="url(#bayer25)" opacity="0.4" />
          <circle cx="48" cy="48" r="36" fill="url(#bayer50)" opacity="0.5" />

          {/* Solid Moon Core */}
          <circle cx="48" cy="48" r="28" fill="#FFFFFF" />
          {/* Inner Crescent Shadow (creating the crescent shape from reference) */}
          <circle cx="58" cy="42" r="26" fill="#000000" />

          {/* Stepped Dither transition on the moon inner curve */}
          <rect x="36" y="32" width="4" height="4" fill="url(#bayer50)" />
          <rect x="38" y="44" width="4" height="4" fill="url(#bayer50)" />
          <rect x="42" y="56" width="4" height="4" fill="url(#bayer50)" />
        </g>

        {/* 4. DISTANT MOUNTAIN RANGE (Layer 1 - Far peaks with dithered slopes) */}
        <polygon
          points="0,220 80,120 180,220"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Far Peak 2 */}
        <polygon
          points="130,220 280,90 430,220"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Snow Cap on Peak 2 with 50% Dither */}
        <polygon
          points="245,122 280,90 315,122 298,132 280,126 262,132"
          fill="url(#bayer75)"
        />
        <polygon
          points="245,122 280,90 315,122 298,132 280,126 262,132"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {/* Far Peak 3 (Highest Central Summit) */}
        <polygon
          points="360,220 540,60 720,220"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Dithered Shading on Right Slope of Summit */}
        <polygon
          points="540,60 720,220 540,220"
          fill="url(#bayer50)"
          opacity="0.3"
        />
        {/* Snow Cap on Central Summit */}
        <polygon
          points="500,96 540,60 580,96 560,110 540,102 520,110"
          fill="#FFFFFF"
        />

        {/* Far Peak 4 */}
        <polygon
          points="660,220 780,110 900,220"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <polygon
          points="750,138 780,110 810,138 795,146 780,142 765,146"
          fill="url(#bayer50)"
        />

        {/* 5. MIDGROUND MOUNTAIN RIDGES & FOOTHILLS WITH DITHER */}
        <polygon
          points="0,230 160,150 360,230"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        <polygon
          points="280,230 460,160 640,230"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        <polygon
          points="580,230 760,140 960,230"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="4 2"
        />

        {/* 6. STEPPED PINE TREE SILHOUETTES (Multiple Layers) */}
        {[
          { x: 20, y: 155, h: 65, w: 24 },
          { x: 60, y: 145, h: 75, w: 28 },
          { x: 105, y: 160, h: 60, w: 22 },
          { x: 145, y: 140, h: 80, w: 30 },
          { x: 195, y: 150, h: 70, w: 26 },
          { x: 240, y: 165, h: 55, w: 20 },
          { x: 640, y: 160, h: 60, w: 22 },
          { x: 685, y: 145, h: 75, w: 28 },
          { x: 730, y: 135, h: 85, w: 32 },
          { x: 780, y: 150, h: 70, w: 26 },
          { x: 825, y: 140, h: 80, w: 30 },
          { x: 875, y: 155, h: 65, w: 24 },
          { x: 920, y: 145, h: 75, w: 28 },
        ].map((tree, i) => (
          <g key={i} transform={`translate(${tree.x}, ${tree.y})`}>
            {/* Trunk */}
            <rect x={tree.w / 2 - 2} y={tree.h - 12} width="4" height="14" fill="#FFFFFF" />
            {/* Tier 1 (top) */}
            <polygon
              points={`${tree.w / 2},0 ${tree.w / 2 + 6},18 ${tree.w / 2 - 6},18`}
              fill="#FFFFFF"
            />
            {/* Tier 2 (mid) */}
            <polygon
              points={`${tree.w / 2},12 ${tree.w / 2 + 10},34 ${tree.w / 2 - 10},34`}
              fill="#FFFFFF"
            />
            {/* Tier 3 (base) */}
            <polygon
              points={`${tree.w / 2},26 ${tree.w / 2 + 14},${tree.h - 8} ${tree.w / 2 - 14},${tree.h - 8}`}
              fill="#FFFFFF"
            />
          </g>
        ))}

        {/* 7. LAKE WATER HORIZON & DITHERED WATER SURFACE */}
        <rect x="0" y="224" width="960" height="136" fill="#000000" />
        <line x1="0" y1="224" x2="960" y2="224" stroke="#FFFFFF" strokeWidth="2" />

        {/* Horizontal Dithered Water Waves */}
        <rect x="0" y="226" width="960" height="134" fill="url(#waterRipple)" opacity="0.35" />

        {/* Moon Reflection Beam on Water (Stippled White Column) */}
        {[226, 232, 238, 246, 256, 268, 282, 298, 316, 336].map((y, idx) => {
          const w = 40 + idx * 16;
          return (
            <line
              key={idx}
              x1={778 - w / 2}
              y1={y}
              x2={778 + w / 2}
              y2={y}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray={`${idx * 3 + 2} ${idx * 4 + 4}`}
            />
          );
        })}

        {/* Mountain Silhouette Reflection Lines */}
        {[230, 240, 252, 266, 282].map((y, idx) => (
          <line
            key={`refl-${idx}`}
            x1={120 + idx * 30}
            y1={y}
            x2={620 - idx * 25}
            y2={y}
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="6 8"
            opacity="0.45"
          />
        ))}

        {/* 8. FOREGROUND ROCK & SHORELINE WITH CONTEMPLATIVE FIGURE (Reference Match) */}
        {/* Shoreline Grass & Earth */}
        <polygon
          points="260,360 290,270 540,264 610,360"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        {/* Dither pattern on rock bank */}
        <polygon
          points="270,360 296,274 534,268 602,360"
          fill="url(#bayer50)"
          opacity="0.25"
        />

        {/* Main Contemplative Boulder / Rock */}
        <g transform="translate(340, 240)">
          {/* Rock mass */}
          <polygon
            points="0,60 24,18 90,14 130,36 144,70 120,96 10,96"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          {/* Rock facet shading */}
          <polygon
            points="24,18 90,14 74,54 12,48"
            fill="url(#bayer50)"
            opacity="0.4"
          />

          {/* CONTEMPLATIVE FIGURE SITTING ON ROCK (Inspired by the robot/figure in reference image) */}
          <g transform="translate(68, -24)">
            {/* Figure Head (Retro indie-styled avatar) */}
            <rect x="4" y="0" width="16" height="14" rx="2" fill="#FFFFFF" />
            <rect x="6" y="2" width="12" height="10" fill="#000000" />
            {/* Contemplative Eyes */}
            <rect x="8" y="5" width="2" height="2" fill="#FFFFFF" />
            <rect x="14" y="5" width="2" height="2" fill="#FFFFFF" />
            {/* Little Antennas / Hair */}
            <line x1="7" y1="-4" x2="7" y2="0" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="17" y1="-4" x2="17" y2="0" stroke="#FFFFFF" strokeWidth="2" />

            {/* Torso */}
            <rect x="6" y="14" width="12" height="14" fill="#FFFFFF" />
            <rect x="8" y="16" width="8" height="10" fill="#000000" />

            {/* Arms resting peacefully */}
            <rect x="2" y="16" width="4" height="10" fill="#FFFFFF" />
            <rect x="18" y="16" width="4" height="10" fill="#FFFFFF" />

            {/* Seated Legs on Rock */}
            <rect x="4" y="28" width="16" height="6" fill="#FFFFFF" />
            <rect x="16" y="34" width="6" height="10" fill="#FFFFFF" />
          </g>

          {/* MINIATURE 10-STRING BEGENA BESIDE THE CONTEMPLATIVE FIGURE */}
          <g transform="translate(24, -30)">
            {/* Top Yoke with Scroll Horns */}
            <rect x="4" y="2" width="26" height="4" fill="#FFFFFF" />
            <rect x="1" y="0" width="4" height="4" fill="#FFFFFF" />
            <rect x="29" y="0" width="4" height="4" fill="#FFFFFF" />

            {/* 10 Tuning Pegs hint */}
            {[7, 10, 13, 16, 18, 21, 24, 27].map((px, i) => (
              <rect key={i} x={px} y="-2" width="1" height="4" fill="#FFFFFF" />
            ))}

            {/* Slender Arms */}
            <line x1="5" y1="6" x2="8" y2="38" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="29" y1="6" x2="26" y2="38" stroke="#FFFFFF" strokeWidth="2" />

            {/* 10 Strings */}
            {[9, 11, 13, 15, 17, 19, 21, 23, 25].map((sx, i) => (
              <line
                key={i}
                x1={sx}
                y1="6"
                x2={sx}
                y2="38"
                stroke="#FFFFFF"
                strokeWidth="1"
                opacity={i % 2 === 0 ? 1 : 0.4}
              />
            ))}

            {/* Soundbox Body */}
            <rect x="7" y="38" width="20" height="16" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="9" y="40" width="16" height="12" fill="url(#bayer50)" opacity="0.6" />

            {/* Bridge */}
            <rect x="10" y="44" width="14" height="2" fill="#FFFFFF" />

            {/* Two Bone Feet at Bottom */}
            <rect x="10" y="54" width="3" height="5" fill="#FFFFFF" />
            <rect x="21" y="54" width="3" height="5" fill="#FFFFFF" />
          </g>

          {/* Foreground Wildflowers on Bank (Pixel Flowers like in Reference) */}
          {[
            { x: -20, y: 64 }, { x: -8, y: 76 }, { x: 140, y: 72 }, { x: 156, y: 84 },
          ].map((flw, i) => (
            <g key={i} transform={`translate(${flw.x}, ${flw.y})`}>
              <rect x="2" y="2" width="2" height="2" fill="#FFFFFF" />
              <rect x="0" y="1" width="2" height="4" fill="#FFFFFF" />
              <rect x="4" y="1" width="2" height="4" fill="#FFFFFF" />
              <rect x="1" y="0" width="4" height="2" fill="#FFFFFF" />
              <rect x="1" y="4" width="4" height="2" fill="#FFFFFF" />
              <line x1="3" y1="6" x2="3" y2="14" stroke="#FFFFFF" strokeWidth="1" />
            </g>
          ))}
        </g>
      </svg>

      {/* Retro 1-Bit Telemetry Bar Underneath */}
      <div className="relative z-10 px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-2.5">
          <span className="pixel-tag bg-white text-black font-bold">1-BIT_ATMOSPHERE</span>
          <span className="text-white font-medium">LAKE TANA NIGHT VIGIL</span>
          <span className="text-zinc-600">/</span>
          <span>ETHIOPIAN HIGHLANDS</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <span>10 STRINGS</span>
          <span>·</span>
          <span>TIZITA: 1=E · 2=C · 3=D · 4=A · 5=G</span>
          <span>·</span>
          <span className="text-white font-bold">35MS ORNAMENT ROLLS</span>
        </div>
      </div>
    </div>
  );
}
