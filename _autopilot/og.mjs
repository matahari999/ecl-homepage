// 글 표지(cover.svg) → 공유 미리보기용 PNG(og.png, 1200×630) 생성
// 카카오톡·네이버·페이스북 미리보기는 SVG를 못 보여주기 때문에 PNG가 필요함
//   node _autopilot/og.mjs          (없거나 표지보다 오래된 것만)
//   node _autopilot/og.mjs --all    (전부 다시)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { loadPosts, ROOT } from './render.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('playwright 없음 → og.png 생략'); process.exit(0); }

const all = process.argv.includes('--all');
const jobs = [];
for (const p of loadPosts()) {
  const src = p.cover?.src || '';
  if (!/^\/images\/.+\.svg$/.test(src)) continue;
  const svg = path.join(ROOT, src);
  if (!fs.existsSync(svg)) continue;
  const png = path.join(path.dirname(svg), 'og.png');
  if (!all && fs.existsSync(png) && fs.statSync(png).mtimeMs >= fs.statSync(svg).mtimeMs) continue;
  jobs.push([svg, png]);
}
if (!jobs.length) { console.log('og.png 최신 상태'); process.exit(0); }
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1200, height: 630 } });
for (const [svg, png] of jobs) {
  const xml = fs.readFileSync(svg, 'utf8');
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:#0a0f1e}svg{display:block;width:1200px;height:630px}</style></head><body>${xml.replace(/<\?xml[^>]*>/, '')}</body></html>`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log('✓', path.relative(ROOT, png));
}
await b.close();
