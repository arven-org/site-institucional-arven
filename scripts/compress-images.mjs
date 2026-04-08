import tinify from 'tinify';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const API_KEY = process.env.TINYPNG_API_KEY;
if (!API_KEY) { console.error('TINYPNG_API_KEY not set'); process.exit(1); }
tinify.key = API_KEY;

const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ROOT = new URL('../public/assets', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await walk(full));
    else if (EXTS.has(extname(e.name).toLowerCase())) files.push(full);
  }
  return files;
}

const images = await walk(ROOT);
console.log(`Found ${images.length} image(s) to compress.\n`);

let saved = 0;
for (const img of images) {
  const before = (await stat(img)).size;
  await tinify.fromFile(img).toFile(img);
  const after = (await stat(img)).size;
  const pct = (((before - after) / before) * 100).toFixed(1);
  saved += before - after;
  const rel = img.replace(ROOT, 'public/assets');
  console.log(`✓ ${rel}  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (-${pct}%)`);
}

console.log(`\nTotal saved: ${(saved/1024).toFixed(0)}KB`);
console.log(`Compressions used this month: ${tinify.compressionCount}`);
