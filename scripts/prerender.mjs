// Prerenders client-side routes to static HTML files so GitHub Pages (which has
// no server-side rewrite support) can serve real 200 responses for each route
// instead of relying on the 404.html hash-redirect fallback.
//
// Usage: node scripts/prerender.mjs   (run AFTER `vite build`, before deploying dist/)

import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const PORT = 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

// route -> output file path (relative to dist/)
const ROUTES = {
  '/services': 'services.html',
  '/services/home-care': 'services/home-care.html',
  '/services/nursing-hospital': 'services/nursing-hospital.html',
  '/services/postpaid-mutual-aid': 'services/postpaid-mutual-aid.html',
  '/contact': 'contact.html',
  '/quote': 'quote.html',
  '/blog': 'blog.html',
  '/testimonials': 'testimonials.html',
};

function serveStatic() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(distDir, urlPath);
      if (urlPath === '/' || !path.extname(filePath)) {
        // SPA fallback for the dev-time prerender crawl itself: always serve the
        // built index.html shell so React Router can take over client-side.
        filePath = path.join(distDir, 'index.html');
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error('dist/ not found — run `npm run build` first.');
    process.exit(1);
  }

  const server = await serveStatic();
  console.log(`Static server running at http://localhost:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    channel: fs.existsSync(chromePath) ? undefined : 'chrome',
  });

  try {
    for (const [route, outFile] of Object.entries(ROUTES)) {
      const page = await browser.newPage();
      const url = `http://localhost:${PORT}${route}`;
      console.log(`Rendering ${route} ...`);
      // Use domcontentloaded, not load: this project eagerly embeds several
      // same-origin iframes (YouTube embed, MOU partner slideshows) whose full
      // load can hang in sandboxed/restricted network environments, so waiting
      // for window.load is unreliable here. React itself mounts on DOMContentLoaded.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Give React Router + Helmet + the legacy patch scripts time to settle.
      await page.waitForSelector('header', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1500);

      const html = await page.content();
      const outPath = path.join(distDir, outFile);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, 'utf-8');
      console.log(`  -> wrote ${outFile} (${(html.length / 1024).toFixed(1)} KB)`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('Prerender complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
