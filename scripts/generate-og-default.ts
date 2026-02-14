import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <text x="600" y="280" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="64" font-weight="700">
    kil-penguin blog
  </text>
  <text x="600" y="360" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="28" font-weight="400">
    Backend Developer 기술 블로그
  </text>
  <line x1="400" y1="410" x2="800" y2="410" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-default.png')
  .then(() => console.log('✅ public/og-default.png generated (1200x630)'))
  .catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
