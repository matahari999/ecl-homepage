// Pings the IndexNow API (Bing, Naver, Yandex, Seznam) with every URL in
// public/sitemap.xml so new/changed pages get picked up faster than passive
// crawl scheduling. Run manually after each deploy: node scripts/indexnow-ping.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST = 'ecl.ai.kr';
const KEY = '6d44ba2f8c79ffb793e4a699e51242c1';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function readSitemapUrls() {
  const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) throw new Error('No URLs found in sitemap.xml');
  return urls;
}

async function main() {
  const urlList = readSitemapUrls();
  console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
  if (!res.ok && res.status !== 202) {
    const text = await res.text().catch(() => '');
    console.error(text);
    process.exit(1);
  }
  console.log('Done. Submitted URLs:');
  urlList.forEach((u) => console.log(`  - ${u}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
