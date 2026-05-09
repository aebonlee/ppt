/**
 * ============================================================
 *  OG Image Generator for DreamIT Sites
 * ============================================================
 *
 *  1200 x 630px 브랜드 이미지를 자동 생성합니다.
 *
 *  사용법:
 *    npm run og-image
 *    또는
 *    node scripts/generate-og-image.mjs
 *
 *  사전 설치:
 *    npm i -D sharp
 *
 *  설정 변경:
 *    아래 CONFIG 객체의 값을 사이트에 맞게 수정하세요.
 *    site.ts와 동기화하면 됩니다.
 */

import sharp from 'sharp';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'og-image.png');

// ── 설정 (site.ts와 맞추세요) ──────────────────────────────
const CONFIG = {
  siteName: 'DreamIT',         // 큰 글씨 (사이트 영문명)
  siteNameKo: '드림아이티',     // 작은 글씨 (사이트 한국어명)
  tagline: 'DreamIT Biz',     // 하단 태그라인
  primaryColor: '#0046C8',     // 메인 컬러 (dark blue)
  darkColor: '#002E8A',        // 그라데이션 끝 컬러
  width: 1200,
  height: 630,
};

// ── SVG 생성 ────────────────────────────────────────────────
function buildSVG(cfg) {
  const { width, height, primaryColor, darkColor, siteName, siteNameKo, tagline } = cfg;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="50%" stop-color="${darkColor}"/>
      <stop offset="100%" stop-color="#1E3A5F"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#93C5FD"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1050" cy="120" r="200" fill="rgba(255,255,255,0.04)"/>
  <circle cx="1100" cy="500" r="150" fill="rgba(255,255,255,0.03)"/>
  <circle cx="150" cy="550" r="100" fill="rgba(255,255,255,0.03)"/>

  <!-- Grid pattern (subtle) -->
  <line x1="0" y1="210" x2="${width}" y2="210" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <line x1="0" y1="420" x2="${width}" y2="420" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <!-- Site name (large) -->
  <text x="80" y="260" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="900" fill="white" letter-spacing="-2">
    ${escapeXml(siteName)}
  </text>

  <!-- Korean name -->
  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="500" fill="rgba(255,255,255,0.85)">
    ${escapeXml(siteNameKo)}
  </text>

  <!-- Accent line -->
  <rect x="80" y="370" width="120" height="4" rx="2" fill="url(#accent)"/>

  <!-- Tagline -->
  <text x="80" y="430" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="400" fill="rgba(255,255,255,0.7)">
    ${escapeXml(tagline)}
  </text>

  <!-- Bottom bar -->
  <rect x="0" y="${height - 6}" width="${width}" height="6" fill="url(#accent)"/>

  <!-- URL -->
  <text x="${width - 80}" y="${height - 30}" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.5)" text-anchor="end">
    dreamitbiz.com
  </text>
</svg>`;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── 실행 ────────────────────────────────────────────────────
async function main() {
  const svg = buildSVG(CONFIG);

  // Ensure output directory exists
  const dir = dirname(OUTPUT);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toFile(OUTPUT);

  console.log(`OG image generated: ${OUTPUT}`);
  console.log(`  Size: ${CONFIG.width} x ${CONFIG.height}`);
  console.log(`  Site: ${CONFIG.siteName} (${CONFIG.siteNameKo})`);
}

main().catch(err => {
  console.error('OG image generation failed:', err.message);
  process.exit(1);
});
