const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const packRoot = path.resolve(__dirname, '..');

function dataUri(relativePath, mime) {
  const bytes = fs.readFileSync(path.join(packRoot, relativePath));
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

const navy = dataUri('public/assets/ui/live-match/textures/texture-painted-navy.webp', 'image/webp');
const wear = dataUri('public/assets/ui/live-match/textures/texture-surface-wear.webp', 'image/webp');
const neutralFrame = dataUri('public/assets/ui/live-match/frames/frame-bench-neutral-9slice.png', 'image/png');
const selectedFrame = dataUri('public/assets/ui/live-match/frames/frame-bench-selected-9slice.png', 'image/png');
const violetta = dataUri('public/assets/characters/violetta/violetta-live-card-placeholder-v1.png', 'image/png');
const reference = dataUri('docs/ui/live-match-reference-v1.jpg', 'image/jpeg');

const pips = Array.from({ length: 8 }, (_, index) => {
  const x = 1050 + index * 44;
  return `<g transform="translate(${x} 798)">
    <path d="M3 1H35L38 4V14L35 17H3L0 14V4Z" fill="#061820" stroke="#b7c3ba" stroke-width="1.4"/>
    <path d="M5 4H33L35 6V12L33 14H5L3 12V6Z" fill="#70cbe4"/>
    <path d="M6 4.8H32" stroke="#edf8f2" stroke-width="1.2" opacity=".7"/>
  </g>`;
}).join('');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#061b23"/>
      <stop offset=".55" stop-color="#08232d"/>
      <stop offset="1" stop-color="#04151c"/>
    </linearGradient>
    <linearGradient id="cardLight" x1="0" y1="0" x2="1" y2=".8">
      <stop offset="0" stop-color="#528092" stop-opacity=".42"/>
      <stop offset=".46" stop-color="#123945" stop-opacity=".08"/>
      <stop offset="1" stop-color="#000" stop-opacity=".35"/>
    </linearGradient>
    <pattern id="navyPattern" width="256" height="256" patternUnits="userSpaceOnUse">
      <image href="${navy}" width="256" height="256"/>
    </pattern>
    <pattern id="wearPattern" width="256" height="256" patternUnits="userSpaceOnUse">
      <image href="${wear}" width="256" height="256"/>
    </pattern>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="#d8c49b" stroke-opacity=".035" stroke-width="1"/>
    </pattern>
    <clipPath id="cardClip">
      <path d="M68 534H1532L1548 550V866L1532 882H68L52 866V550Z"/>
    </clipPath>
    <clipPath id="referenceClip">
      <rect x="1116" y="146" width="432" height="260"/>
    </clipPath>
  </defs>

  <rect width="1600" height="1000" fill="url(#page)"/>
  <rect width="1600" height="1000" fill="url(#grid)"/>

  <text x="52" y="78" fill="#eadfca" font-family="DejaVu Sans Condensed, sans-serif" font-weight="900" font-style="italic" font-size="43" letter-spacing="2">SINBIN UI SKIN PACK v0.1</text>
  <text x="1548" y="76" fill="#bdb39e" text-anchor="end" font-family="DejaVu Sans Condensed, sans-serif" font-weight="700" font-size="16" letter-spacing="2">SELECTED VIOLETTA BENCH-CARD PROOF</text>
  <path d="M52 102H1548" stroke="#b2915b" stroke-opacity=".62" stroke-width="2"/>

  <rect x="52" y="146" width="272" height="260" fill="url(#navyPattern)" stroke="#c7a86d" stroke-opacity=".45"/>
  <rect x="66" y="354" width="240" height="35" fill="#041820" fill-opacity=".9"/>
  <text x="78" y="377" fill="#eadfca" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="14" letter-spacing="1.4">PAINTED NAVY · SEAMLESS</text>

  <rect x="342" y="146" width="272" height="260" fill="#e7dcc4" stroke="#c7a86d" stroke-opacity=".45"/>
  <rect x="342" y="146" width="272" height="260" fill="url(#wearPattern)" opacity=".7"/>
  <rect x="356" y="354" width="240" height="35" fill="#041820" fill-opacity=".9"/>
  <text x="368" y="377" fill="#eadfca" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="14" letter-spacing="1.4">WEAR OVERLAY · ALPHA</text>

  <rect x="632" y="146" width="466" height="260" fill="#041820" stroke="#c7a86d" stroke-opacity=".45"/>
  <image href="${neutralFrame}" x="660" y="176" width="170" height="170"/>
  <image href="${selectedFrame}" x="898" y="176" width="170" height="170"/>
  <text x="745" y="377" fill="#bdb39e" text-anchor="middle" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="13" letter-spacing="1.2">NEUTRAL</text>
  <text x="983" y="377" fill="#f0c437" text-anchor="middle" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="13" letter-spacing="1.2">SELECTED</text>

  <rect x="1116" y="146" width="432" height="260" fill="#041820" stroke="#c7a86d" stroke-opacity=".45"/>
  <image href="${reference}" x="1116" y="146" width="432" height="260" preserveAspectRatio="xMidYMid slice" clip-path="url(#referenceClip)"/>
  <rect x="1292" y="354" width="240" height="35" fill="#041820" fill-opacity=".9"/>
  <text x="1304" y="377" fill="#eadfca" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="14" letter-spacing="1.4">TARGET REFERENCE</text>

  <text x="52" y="476" fill="#eadfca" font-family="DejaVu Sans Condensed, sans-serif" font-weight="900" font-style="italic" font-size="27" letter-spacing="1.5">ASSEMBLED PROOF COMPONENT</text>
  <text x="620" y="476" fill="#8fa0a0" font-family="DejaVu Sans Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="1.3">MATERIAL STRENGTH AND PORTRAIT CROP REMAIN ADJUSTABLE IN STORYBOOK</text>

  <g clip-path="url(#cardClip)">
    <rect x="52" y="534" width="1496" height="348" fill="#082632"/>
    <rect x="52" y="534" width="1496" height="348" fill="url(#navyPattern)" opacity=".82"/>
    <rect x="52" y="534" width="1496" height="348" fill="url(#cardLight)"/>
    <ellipse cx="270" cy="700" rx="290" ry="230" fill="#6d9ead" opacity=".16"/>
    <image href="${violetta}" x="85" y="526" width="400" height="600" preserveAspectRatio="xMidYMin meet"/>
    <path d="M504 558V856" stroke="#d9c9a8" stroke-opacity=".18" stroke-width="2"/>
    <rect x="52" y="534" width="1496" height="348" fill="url(#wearPattern)" opacity=".13"/>
  </g>

  <text x="560" y="624" fill="#f0c437" font-family="DejaVu Sans Condensed, sans-serif" font-weight="900" font-size="20" letter-spacing="2">SELECTED</text>
  <text x="558" y="706" fill="#f3ead8" font-family="DejaVu Sans Condensed, sans-serif" font-weight="900" font-size="66" letter-spacing="3">VIOLETTA</text>
  <text x="560" y="800" fill="#9fc8d2" font-family="DejaVu Sans Condensed, sans-serif" font-weight="900" font-size="24" letter-spacing="2">BRIDGE · FLEX</text>
  <text x="1050" y="772" fill="#eadfca" font-family="DejaVu Sans Condensed, sans-serif" font-weight="900" font-size="22" letter-spacing="1.5">ENERGY 8 / 8</text>
  ${pips}

  <path d="M68 534H1532L1548 550V866L1532 882H68L52 866V550Z" fill="none" stroke="#06141b" stroke-width="18"/>
  <path d="M72 542H1528L1540 554V862L1528 874H72L60 862V554Z" fill="none" stroke="#f0c437" stroke-width="8"/>
  <path d="M78 550H1522L1532 560V856L1522 866H78L68 856V560Z" fill="none" stroke="#ffe98c" stroke-width="2"/>
  <path d="M84 558H1516L1524 566V850L1516 858H84L76 850V566Z" fill="none" stroke="#6b4512" stroke-width="5"/>
  <path d="M89 564H1511L1518 571V845L1511 852H89L82 845V571Z" fill="none" stroke="#d3b06a" stroke-width="2"/>

  <text x="52" y="938" fill="#8fa0a0" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="13" letter-spacing="1.4">SELECTION YELLOW IS INTERACTION STATE — NOT RARITY</text>
  <text x="1548" y="938" fill="#8fa0a0" text-anchor="end" font-family="DejaVu Sans Condensed, sans-serif" font-weight="800" font-size="13" letter-spacing="1.4">RUNTIME TEXT REMAINS HTML · CHARACTER REMAINS REPLACEABLE PNG</text>
</svg>`;

const output = path.join(__dirname, 'SINBIN_UI_Skin_Pack_v0.1_contact-sheet.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(output)
  .then(() => process.stdout.write(`${output}\n`))
  .catch((error) => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exitCode = 1;
  });
