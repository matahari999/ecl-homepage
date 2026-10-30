// 새 글/수정 글을 네이버(서치어드바이저)·Bing 등에 바로 알림 (IndexNow)
// 사용법: node _autopilot/indexnow.mjs            → 블로그 전체 주소
//        node _autopilot/indexnow.mjs <slug> ...   → 해당 글 + 블로그 목록만
import { config, loadPosts } from './render.mjs';
const S = config.site;
const key = config.indexNowKey;
const slugs = process.argv.slice(2);
const urls = [`${S.origin}${S.guidePath}`, ...(slugs.length ? slugs : loadPosts().map((p) => p.slug)).map((s) => `${S.origin}${S.guidePath}/${s}`)];
const body = { host: new URL(S.origin).host, key, keyLocation: `${S.origin}/${key}.txt`, urlList: urls };
for (const ep of ['https://searchadvisor.naver.com/indexnow', 'https://api.indexnow.org/indexnow']) {
  try {
    const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
    console.log(`${ep} → ${r.status} ${r.status === 200 || r.status === 202 ? '✓ 접수' : await r.text().catch(() => '')}`);
  } catch (e) {
    console.log(`${ep} → 실패: ${e.message}`);
  }
}
console.log(`알린 주소 ${urls.length}개`);
