// 검색엔진 제출 자동화 (네이버 서치어드바이저 · Bing · IndexNow)
//
// 사용법 (PC의 ecl-homepage 폴더에서):
//   npm run seo:submit                → IndexNow 알림 + 네이버 사이트맵 제출 + 웹 페이지 수집 요청
//   npm run seo:submit -- /jangji /quote   → 지정한 주소만 수집 요청
//   npm run seo:submit -- --indexnow-only  → 브라우저 없이 IndexNow 알림만
//   npm run seo:submit -- --my-edge        → 평소 엣지(로그인된 프로필) 사용, 엣지 창을 모두 닫고 실행
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
  // --my-edge: 평소 쓰는 엣지(이미 네이버 로그인된 프로필)를 그대로 사용. 엣지 창을 모두 닫아야 함
  const myEdge = args.includes('--my-edge') && process.env.LOCALAPPDATA;
  const profile = myEdge ? path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'User Data') : path.join(ROOT, '.seo-browser-profile');
  if (myEdge) console.log('[브라우저] 평소 쓰시는 엣지 프로필로 엽니다. (엣지 창이 모두 닫혀 있어야 합니다)');
  const ctx = await chromium.launchPersistentContext(profile, { channel: 'msedge', headless: false, viewport: { width: 1280, height: 900 }, args: myEdge ? ['--profile-directory=Default'] : [] });
  let closed = false;
  ctx.on('close', () => { closed = true; });
  let lastDialog = '';
  const hookDialogs = (p) => p.on('dialog', async (d) => { lastDialog = d.message(); await d.accept().catch(() => {}); });
  ctx.on('page', hookDialogs);
  let page = ctx.pages()[0] || (await ctx.newPage());
  hookDialogs(page);
  // 탭이 닫혀도 브라우저가 살아 있으면 새 탭으로 이어서 진행
  const ensurePage = async () => {
    if (closed) throw new Error('엣지 창이 닫혀서 중단했습니다. 작업이 끝날 때까지 창을 닫지 말아 주세요.');
    if (page.isClosed()) page = ctx.pages().find((p) => !p.isClosed()) || (await ctx.newPage());
    return page;
  };
  const shotDir = path.join(ROOT, '.seo-shots');
  fs.mkdirSync(shotDir, { recursive: true });
  const shot = (name) => page.screenshot({ path: path.join(shotDir, `${Date.now()}-${name}.png`) }).catch(() => {});

  // 로그인 확인: 로그인 안 되어 있으면 사용자가 직접 로그인할 때까지 최대 10분 대기
  await page.goto('https://searchadvisor.naver.com/console/board', { waitUntil: 'domcontentloaded' });
  if (!new URL(page.url()).hostname.startsWith('searchadvisor')) {
    console.log('\n👉 열린 엣지 창에서 네이버에 직접 로그인해 주세요. (최대 10분 대기)');
    console.log('   아이디·비밀번호 대신 [QR코드] 또는 [일회용 번호] 탭으로 네이버 앱 로그인을 하면 가장 확실합니다.\n');
    await page.waitForURL((u) => u.hostname.startsWith('searchadvisor.naver.com'), { timeout: 10 * 60 * 1000 });
    await page.goto('https://searchadvisor.naver.com/console/board', { waitUntil: 'domcontentloaded' });
  }
  console.log('[네이버] 로그인 확인 ✓');

  const today = (() => { const d = new Date(); return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; })();
  const fillAndSubmit = async (pageUrl, value, label) => {
    await ensurePage();
    await page.goto(pageUrl, { waitUntil: 'networkidle' });
    const input = page.locator('input[type="text"]').first();
    await input.waitFor({ timeout: 15000 });
    await input.click();
    await input.fill('');
    await input.pressSequentially(value, { delay: 15 }); // 실제 타이핑처럼 입력해야 확인 버튼이 활성화됨
    const btn = page.getByRole('button', { name: '확인' }).first();
    if (await btn.isDisabled().catch(() => false)) {
      console.log(`[네이버] ${label} ${value} → 확인 버튼 비활성(형식 불가 또는 이미 등록됨)`);
      await shot(label + '-disabled');
      return;
    }
    lastDialog = '';
    await btn.click();
    await page.waitForTimeout(2500);
    const toast = await page.locator('.v-snack__content, [role="alert"], .toast, .layer_alert').first().innerText({ timeout: 1000 }).catch(() => '');
    // 결과 확인: 새로고침 후 내역 맨 위에 오늘 날짜로 들어갔는지 확인
    await page.reload({ waitUntil: 'networkidle' });
    const rel = value.replace(ORIGIN, '') || '/';
    const rows = await page.locator('table tr, li').allInnerTexts().catch(() => []);
    const ok = rows.some((t) => t.includes(today) && (t.includes(rel) || t.includes(value)));
    console.log(`[네이버] ${label} ${value} → ${ok ? '✓ 등록 확인' : '✗ 내역에 없음'}${lastDialog ? ` (안내: ${lastDialog.replace(/\s+/g, ' ').trim()})` : ''}${toast ? ` (${toast.replace(/\s+/g, ' ').trim()})` : ''}`);
    await shot(label + (ok ? '-ok' : '-fail'));
  };

  // 이미 제출된 사이트맵은 건너뜀
  await ensurePage();
  await page.goto(`https://searchadvisor.naver.com/console/site/request/sitemap?site=${SITE_PARAM}`, { waitUntil: 'networkidle' });
  const registered = (await page.locator('body').innerText().catch(() => ''));
  // 사이트맵 제출 (이미 등록된 경우 '이미 제출' 안내가 떠도 괜찮음)
  for (const sm of SITEMAPS.filter((x) => x.endsWith('sitemap.xml'))) {
    if (new RegExp(`(^|\\s)${sm.replace('.', '\\.')}(\\s|$)`, 'm').test(registered)) { console.log(`[네이버] 사이트맵 ${sm} → ✓ 이미 등록됨`); continue; }
    try {
      await fillAndSubmit(`https://searchadvisor.naver.com/console/site/request/sitemap?site=${SITE_PARAM}`, `${ORIGIN}/${sm}`, '사이트맵');
    } catch (e) {
      console.log(`[네이버] 사이트맵 ${sm} 실패: ${e.message.split('\n')[0]}`);
      if (closed) return;
      await shot('sitemap-error');
    }
  }
  // 웹 페이지 수집 요청 (하루 요청 한도가 있으니 핵심 주소 위주)
  for (const u of urls) {
    try {
      await fillAndSubmit(`https://searchadvisor.naver.com/console/site/request/crawl?site=${SITE_PARAM}`, u, '수집요청');
    } catch (e) {
      console.log(`[네이버] 수집요청 ${u} 실패: ${e.message.split('\n')[0]}`);
      if (closed) return;
      await shot('crawl-error');
    }
  }
  console.log(`\n완료. 화면 캡처는 .seo-shots 폴더에 있습니다. 창은 10초 뒤 닫힙니다.`);
  await new Promise((r) => setTimeout(r, 10000));
  await ctx.close().catch(() => {});
}

await indexNow();
if (!indexNowOnly) await naverConsole();
