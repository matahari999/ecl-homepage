// 검색엔진 제출 자동화 (네이버 서치어드바이저 · Bing · IndexNow)
//
// 사용법 (PC의 ecl-homepage 폴더에서):
//   npm run seo:submit                → IndexNow 알림 + 네이버 사이트맵 제출 + 웹 페이지 수집 요청
//   npm run seo:submit -- /jangji /quote   → 지정한 주소만 수집 요청
//   npm run seo:submit -- --indexnow-only  → 브라우저 없이 IndexNow 알림만
//
// 처음 실행하면 엣지 창이 열리고 네이버 로그인 화면이 나옵니다.
// 로그인은 직접 해 주세요(비밀번호는 스크립트가 다루지 않습니다).
// 로그인 상태는 .seo-browser-profile 폴더에 저장되어 다음부터는 바로 진행됩니다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, '_autopilot', 'config.json'), 'utf8'));
const ORIGIN = config.site.origin; // https://ecl.ai.kr
const SITE_PARAM = encodeURIComponent(ORIGIN);
const SITEMAPS = ['sitemap.xml', 'guide-sitemap.xml', 'rss.xml', 'guide/rss.xml'];

const args = process.argv.slice(2);
const indexNowOnly = args.includes('--indexnow-only');
const picked = args.filter((a) => !a.startsWith('--'));

// 수집 요청할 주소: 지정 없으면 핵심 페이지 + 최근 블로그 글 5개
function defaultUrls() {
  const core = ['/', '/jangji', '/quote', '/services', '/services/postpaid-mutual-aid', '/testimonials', '/guide'];
  let recent = [];
  try {
    const latest = JSON.parse(fs.readFileSync(path.join(ROOT, 'guide', 'latest.json'), 'utf8'));
    recent = (Array.isArray(latest) ? latest : latest.posts || []).slice(0, 5).map((p) => p.url || `/guide/${p.slug}`);
  } catch {}
  return [...core, ...recent];
}
const toAbs = (u) => (u.startsWith('http') ? u : ORIGIN + (u.startsWith('/') ? u : '/' + u));
const urls = [...new Set((picked.length ? picked : defaultUrls()).map(toAbs))];

// 1) IndexNow (네이버·Bing 공식 즉시 알림, 로그인 불필요)
async function indexNow() {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8') + fs.readFileSync(path.join(ROOT, 'guide-sitemap.xml'), 'utf8');
  const all = [...new Set([...urls, ...[...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])])];
  const body = { host: new URL(ORIGIN).host, key: config.indexNowKey, keyLocation: `${ORIGIN}/${config.indexNowKey}.txt`, urlList: all };
  for (const ep of ['https://searchadvisor.naver.com/indexnow', 'https://api.indexnow.org/indexnow']) {
    try {
      const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
      console.log(`[IndexNow] ${ep} → ${r.status} ${[200, 202].includes(r.status) ? '✓ 접수' : await r.text().catch(() => '')}`);
    } catch (e) {
      console.log(`[IndexNow] ${ep} → 실패: ${e.message}`);
    }
  }
  console.log(`[IndexNow] 알린 주소 ${all.length}개`);
}

// 2) 네이버 서치어드바이저 화면 자동 입력 (Playwright + 설치된 엣지)
async function naverConsole() {
  const { chromium } = await import('playwright-core');
  const profile = path.join(ROOT, '.seo-browser-profile');
  const ctx = await chromium.launchPersistentContext(profile, { channel: 'msedge', headless: false, viewport: { width: 1280, height: 900 } });
  const page = ctx.pages()[0] || (await ctx.newPage());
  const shotDir = path.join(ROOT, '.seo-shots');
  fs.mkdirSync(shotDir, { recursive: true });
  const shot = (name) => page.screenshot({ path: path.join(shotDir, `${Date.now()}-${name}.png`) }).catch(() => {});

  // 로그인 확인: 로그인 안 되어 있으면 사용자가 직접 로그인할 때까지 최대 5분 대기
  await page.goto('https://searchadvisor.naver.com/console/board', { waitUntil: 'domcontentloaded' });
  if (/nid\.naver\.com/.test(page.url()) || !(await page.url()).includes('searchadvisor')) {
    console.log('\n👉 열린 엣지 창에서 네이버에 직접 로그인해 주세요. (최대 5분 대기)\n');
  }
  await page.waitForURL(/searchadvisor\.naver\.com\/console/, { timeout: 5 * 60 * 1000 });
  console.log('[네이버] 로그인 확인 ✓');

  const fillAndSubmit = async (pageUrl, value, label) => {
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    const input = page.locator('main input[type="text"], form input[type="text"], input[type="text"]').first();
    await input.waitFor({ timeout: 15000 });
    await input.fill('');
    // 입력칸에 도메인이 미리 붙어 있는 화면이면 경로만, 아니면 전체 주소를 넣음
    const prefix = await page.locator(`text=${ORIGIN}`).first().isVisible().catch(() => false);
    await input.fill(prefix ? value.replace(ORIGIN, '').replace(/^\//, '') : value);
    const btn = page.getByRole('button', { name: /^(확인|요청|제출)$/ }).first();
    await btn.click();
    await page.waitForTimeout(1500);
    const msg = await page.locator('[role="alert"], .v-snack__content, .message, .alert').first().innerText().catch(() => '');
    console.log(`[네이버] ${label} ${value} → ${msg.trim() || '제출 클릭 완료'}`);
    await shot(label);
  };

  // 사이트맵 제출 (이미 등록된 경우 '이미 제출' 안내가 떠도 괜찮음)
  for (const sm of SITEMAPS) {
    try {
      await fillAndSubmit(`https://searchadvisor.naver.com/console/site/request/sitemap?site=${SITE_PARAM}`, `${ORIGIN}/${sm}`, '사이트맵');
    } catch (e) {
      console.log(`[네이버] 사이트맵 ${sm} 실패: ${e.message.split('\n')[0]}`);
      await shot('sitemap-error');
    }
  }
  // 웹 페이지 수집 요청 (하루 요청 한도가 있으니 핵심 주소 위주)
  for (const u of urls) {
    try {
      await fillAndSubmit(`https://searchadvisor.naver.com/console/site/request/crawl?site=${SITE_PARAM}`, u, '수집요청');
    } catch (e) {
      console.log(`[네이버] 수집요청 ${u} 실패: ${e.message.split('\n')[0]}`);
      await shot('crawl-error');
    }
  }
  console.log(`\n완료. 화면 캡처는 .seo-shots 폴더에 있습니다. 창은 10초 뒤 닫힙니다.`);
  await page.waitForTimeout(10000);
  await ctx.close();
}

await indexNow();
if (!indexNowOnly) await naverConsole();
