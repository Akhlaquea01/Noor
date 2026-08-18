import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outDir = path.join(__dirname, '../public/icons');
const svg = readFileSync(svgPath);

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'maskable-512.png', size: 512, padding: 0.15 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const t of targets) {
  const size = t.size;
  let pipeline = sharp(svg, { density: 384 }).resize(size, size);
  if (t.padding) {
    const inner = Math.round(size * (1 - t.padding * 2));
    pipeline = sharp(svg, { density: 384 })
      .resize(inner, inner)
      .extend({
        top: Math.round((size - inner) / 2),
        bottom: Math.round((size - inner) / 2),
        left: Math.round((size - inner) / 2),
        right: Math.round((size - inner) / 2),
        background: '#0f5132',
      });
  }
  await pipeline.png().toFile(path.join(outDir, t.name));
  console.log('generated', t.name);
}
