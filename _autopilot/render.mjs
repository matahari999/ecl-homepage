// 가이드 블로그 정적 페이지 생성기
// _guide/posts/*.json  →  guide/<slug>.html, guide/index.html, guide/rss.xml, guide-sitemap.xml
// 사용법: node _autopilot/render.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const POSTS_DIR = path.join(ROOT, '_guide', 'posts');
const OUT_DIR = path.join(ROOT, 'guide');
export const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const S = config.site;

// ---------- helpers ----------
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ALLOWED = new Set(['p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'a', 'br', 'mark']);

/** AI가 쓴 HTML에서 허용된 태그만 남기고 속성은 a[href]만 유지 */
export function sanitize(html = '') {
  let out = String(html)
    .replace(/<\s*(script|style|iframe|object|embed|form|svg)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>/g, (m, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!ALLOWED.has(tag)) return '';
    if (close) return `</${tag}>`;
    if (tag === 'a') {
      const href = (attrs.match(/href\s*=\s*"([^"]*)"/i) || attrs.match(/href\s*=\s*'([^']*)'/i) || [])[1] || '';
      if (/^\/(?!\/)/.test(href)) return `<a href="${esc(href)}">`;
      if (/^https:\/\//i.test(href)) return `<a href="${esc(href)}" target="_blank" rel="noopener nofollow">`;
      return '<a>';
    }
    return tag === 'br' ? '<br>' : `<${tag}>`;
  });
  return out;
}

export function textLength(post) {
  const all = (post.sections || []).map((s) => s.html).join(' ') + (post.faq || []).map((f) => f.q + f.a).join(' ');
  return all.replace(/<[^>]+>/g, '').replace(/\[\[CTA:[a-z]+\]\]/g, '').replace(/\s+/g, ' ').trim().length;
}

export function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')))
    .filter((p) => p.status !== 'draft')
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '') || a.slug.localeCompare(b.slug));
}

const url = (p) => `${S.origin}${S.guidePath}/${p.slug}`;
const fmtDate = (d) => {
  const [y, m, dd] = d.split('-');
  return `${y}년 ${Number(m)}월 ${Number(dd)}일`;
};

// ---------- images ----------
/** 이미지 경로는 /images/guide/ 아래 파일만 허용 */
export function safeImg(src) {
  return typeof src === 'string' && /^\/images\/guide\/[a-z0-9\-\/]+\.(svg|webp|png|jpg|jpeg|gif)$/.test(src) ? src : null;
}
function figure(f, cls = '') {
  const src = f && safeImg(f.src);
  if (!src) return '';
  return `<figure class="fig ${cls}"><img src="${src}" alt="${esc(f.alt || '')}" loading="${cls === 'cover' ? 'eager' : 'lazy'}" decoding="async">${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}</figure>`;
}

// ---------- CTA blocks ----------
const CTA = {
  quote: () => `
<aside class="cta cta-quote">
  <div class="cta-text"><strong>우리 가족 장례비, 지금 바로 계산해 보세요</strong><span>기본 99만원 + 필요한 옵션만. 가입비·월 납입금 없는 후불제입니다.</span></div>
  <a class="btn btn-gold" href="${S.quoteUrl}">💰 맞춤 견적 계산하기</a>
</aside>`,
  consult: () => `
<aside class="cta cta-consult">
  <div class="cta-text"><strong>혼자 정하기 어려우시면 물어보세요</strong><span>장례·요양병원·방문요양 무엇이든 24시간 무료 상담합니다.</span></div>
  <div class="cta-btns"><a class="btn btn-blue" href="tel:${S.phone}">📞 ${S.phone}</a><a class="btn btn-ghost" href="${S.kakao}" target="_blank" rel="noopener">카카오톡 상담</a></div>
</aside>`,
  call: () => `
<aside class="cta cta-call">
  <div class="cta-text"><strong>지금 임종·장례가 급하신가요?</strong><span>24시간 장례지도사가 바로 연결됩니다. 비용은 장례 후에 정산합니다.</span></div>
  <a class="btn btn-red" href="tel:${S.phone}">📞 지금 전화하기</a>
</aside>`,
};

function bodyWithCtas(post) {
  let used = 0;
  const parts = post.sections.map((s, i) => {
    let html = sanitize(s.html).replace(/\[\[CTA:(quote|consult|call)\]\]/g, (_, k) => (used++ < 3 ? CTA[k]() : ''));
    return `<section id="s${i + 1}"><h2>${esc(s.heading)}</h2>${figure(s.figure)}${html}</section>`;
  });
  // AI가 CTA를 하나도 안 넣었으면 2번째 섹션 뒤에 자동 삽입
  if (used === 0 && parts.length > 2) parts.splice(2, 0, CTA.quote());
  return parts.join('\n');
}

// ---------- shared layout ----------
const CSS = `
:root{--navy:#0a0f1e;--navy2:#111a33;--ink:#1e293b;--muted:#64748b;--line:#e2e8f0;--bg:#f8fafc;--card:#fff;--blue:#2563eb;--blue-d:#1d4ed8;--gold:#f59e0b;--gold-d:#d97706;--red:#dc2626;--soft:#eff6ff}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font-family:'Noto Sans KR',system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--bg);font-size:17px;line-height:1.85;word-break:keep-all;-webkit-font-smoothing:antialiased}
a{color:var(--blue)}
.hd{position:sticky;top:0;z-index:50;background:rgba(10,15,30,.94);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.06)}
.hd-in{max-width:1120px;margin:0 auto;padding:0 16px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff}
.logo i{width:36px;height:36px;border-radius:10px;background:#fff;display:grid;place-items:center}
.logo img{width:28px;height:28px;object-fit:contain}
.logo b{font-size:18px;font-weight:900;letter-spacing:-.03em;line-height:1}
.logo small{display:block;font-size:10px;color:#64748b;font-weight:700;letter-spacing:.08em;margin-top:3px}
.nav{display:flex;align-items:center;gap:22px}
.nav a{color:#cbd5e1;text-decoration:none;font-weight:700;font-size:14px}
.nav a:hover,.nav a.on{color:#fff}
.nav .q{color:var(--gold)}
.nav .btn{padding:9px 16px;font-size:14px}
@media(max-width:760px){.nav a.hide-m{display:none}.nav{gap:14px}.logo small{display:none}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:13px 20px;border-radius:12px;font-weight:800;text-decoration:none;font-size:16px;white-space:nowrap;transition:transform .15s,background .15s}
.btn:hover{transform:translateY(-1px)}
.btn-blue{background:var(--blue);color:#fff}.btn-blue:hover{background:var(--blue-d)}
.btn-gold{background:var(--gold);color:#1a1200}.btn-gold:hover{background:var(--gold-d)}
.btn-red{background:var(--red);color:#fff}
.btn-ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
.wrap{max-width:760px;margin:0 auto;padding:0 16px}
.crumb{font-size:14px;color:var(--muted);padding:22px 0 0}
.crumb a{color:var(--muted);text-decoration:none}
.post-h{padding:14px 0 8px}
.fig{margin:22px 0 26px}
.fig img{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--line);background:#fff}
.fig.cover{margin-top:18px}
.fig figcaption{font-size:14px;color:var(--muted);text-align:center;margin-top:8px}
.card .thumb{display:block;width:100%;aspect-ratio:1200/630;object-fit:cover;border-radius:10px;margin:0 0 12px;background:#f1f5f9}
.tag{display:inline-block;background:var(--soft);color:var(--blue);font-size:13px;font-weight:800;padding:4px 10px;border-radius:999px}
h1{font-size:clamp(26px,5vw,36px);line-height:1.35;letter-spacing:-.03em;margin:14px 0 12px;font-weight:900}
.meta{color:var(--muted);font-size:14px}
.summary{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--blue);border-radius:14px;padding:18px 22px;margin:26px 0}
.summary b{display:block;font-size:15px;color:var(--blue);margin-bottom:6px}
.summary ul{margin:0;padding-left:20px}.summary li{margin:4px 0}
.toc{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 22px;margin:0 0 10px;font-size:15px}
.toc b{font-size:14px;color:var(--muted)}
.toc ol{margin:6px 0 0;padding-left:20px}.toc a{color:var(--ink);text-decoration:none}.toc a:hover{color:var(--blue)}
article section{scroll-margin-top:80px}
article h2{font-size:clamp(21px,3.6vw,26px);line-height:1.45;letter-spacing:-.02em;margin:46px 0 14px;padding-top:6px;font-weight:900}
article h3{font-size:19px;margin:28px 0 8px}
article p{margin:0 0 18px}
article ul,article ol{padding-left:22px;margin:0 0 18px}article li{margin:6px 0}
article strong{background:linear-gradient(transparent 62%,#fde68a 62%)}
article blockquote{margin:20px 0;padding:14px 18px;background:#fffbeb;border-radius:12px;border:1px solid #fde68a;font-size:16px}
article table{width:100%;border-collapse:collapse;margin:8px 0 22px;font-size:15px;background:#fff;display:block;overflow-x:auto}
article th,article td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
article th{background:#f1f5f9;font-weight:800;white-space:nowrap}
.cta{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:30px 0;padding:22px;border-radius:16px;background:var(--navy);color:#fff}
.cta-text strong{display:block;font-size:18px;margin-bottom:4px;background:none}
.cta-text span{color:#cbd5e1;font-size:15px}
.cta-btns{display:flex;gap:8px;flex-wrap:wrap}
.cta-quote{background:linear-gradient(135deg,#0a0f1e,#1e3a8a)}
.cta-call{background:linear-gradient(135deg,#450a0a,#7f1d1d)}
@media(max-width:560px){.cta .btn{width:100%}.cta-btns{width:100%}}
.faq{margin:50px 0 10px}
.faq details{background:#fff;border:1px solid var(--line);border-radius:12px;margin:10px 0;padding:0 18px}
.faq summary{cursor:pointer;font-weight:800;padding:15px 0;list-style:none}
.faq summary::before{content:'Q. ';color:var(--blue)}
.faq details p{margin:0 0 16px;color:#334155}
.note{font-size:14px;color:var(--muted);border-top:1px solid var(--line);margin-top:40px;padding-top:16px}
.related{margin:40px 0}
.related h2{font-size:20px;margin:0 0 12px}
.cards{display:grid;gap:14px}
.card{display:block;background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px;text-decoration:none;color:var(--ink);transition:border-color .15s,box-shadow .15s}
.card:hover{border-color:#93c5fd;box-shadow:0 8px 24px rgba(37,99,235,.08)}
.card .tag{font-size:12px}
.card h3{margin:8px 0 6px;font-size:19px;line-height:1.45;letter-spacing:-.02em}
.card p{margin:0;color:var(--muted);font-size:15px;line-height:1.7}
.card time{display:block;font-size:13px;color:#94a3b8;margin-top:10px}
.hero{background:linear-gradient(160deg,#0a0f1e 0%,#13204a 100%);color:#fff;padding:54px 0 46px}
.hero h1{margin:10px 0 10px;color:#fff}
.hero p{color:#cbd5e1;margin:0;max-width:620px}
.hero .tag{background:rgba(255,255,255,.1);color:#93c5fd}
.list{padding:30px 0 10px}
.ft{background:var(--navy);color:#94a3b8;font-size:14px;margin-top:60px;padding:36px 0 90px}
.ft a{color:#cbd5e1;text-decoration:none}
.ft-in{max-width:1120px;margin:0 auto;padding:0 16px;display:flex;flex-wrap:wrap;gap:12px 28px;justify-content:space-between}
.float{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;flex-direction:column;gap:8px}
.float a{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:24px;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.25)}
.float a:focus{outline:3px solid #93c5fd}
@media(max-width:560px){.float a{width:48px;height:48px;font-size:20px}}
.float .f-call{background:var(--blue);color:#fff}.float .f-kakao{background:#fee500;color:#191600;font-size:13px;font-weight:900}
`;

function layout({ title, description, canonical, jsonLd = [], body, ogType = 'article' }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(S.brand)}">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${S.origin}/logo.png">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/png" href="/logo.png">
<link rel="alternate" type="application/rss+xml" title="${esc(S.guideTitle)}" href="${S.guidePath}/rss.xml">
<meta name="theme-color" content="#0a0f1e">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap">
<style>${CSS}</style>
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<header class="hd"><div class="hd-in">
  <a class="logo" href="/"><i><img src="/logo.png" alt=""></i><span><b>${esc(S.brand)}</b><small>후불제상조 · 요양병원 · 방문요양</small></span></a>
  <nav class="nav">
    <a class="q" href="${S.quoteUrl}">💰 견적서</a>
    <a class="hide-m" href="/services">서비스</a>
    <a class="on" href="${S.guidePath}">블로그</a>
    <a class="hide-m" href="/testimonials">후기</a>
    <a class="btn btn-blue hide-m" href="${S.consultUrl}">상담문의</a>
  </nav>
</div></header>
${body}
<footer class="ft"><div class="ft-in">
  <div><b style="color:#fff">${esc(S.brand)}</b><br>고양·파주·김포 및 수도권 후불제 상조 · 요양병원 연계 · 방문요양</div>
  <div>대표전화 <a href="tel:${S.phone}">${S.phone}</a> (24시간)<br><a href="/">홈</a> · <a href="${S.quoteUrl}">견적 계산기</a> · <a href="${S.guidePath}">블로그</a> · <a href="${S.consultUrl}">상담 신청</a></div>
</div></footer>
<div class="float"><a class="f-kakao" href="${S.kakao}" target="_blank" rel="noopener" aria-label="카카오톡 상담">톡</a><a class="f-call" href="tel:${S.phone}" aria-label="전화 상담">📞</a></div>
</body>
</html>
`;
}

function card(p) {
  const th = p.cover && safeImg(p.cover.src);
  return `<a class="card" href="${S.guidePath}/${p.slug}">${th ? `<img class="thumb" src="${th}" alt="" loading="lazy">` : ''}<span class="tag">${esc(p.category || '가이드')}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><time datetime="${p.publishedAt}">${fmtDate(p.publishedAt)}</time></a>`;
}

function renderPost(post, all) {
  const bySlug = Object.fromEntries(all.map((p) => [p.slug, p]));
  // 관련글: 직접 지정된 것 + 최신글로 채워 최대 4개
  const rel = [...new Set([...(post.related || []), ...all.map((p) => p.slug)])]
    .filter((s) => s !== post.slug && bySlug[s])
    .slice(0, 4)
    .map((s) => bySlug[s]);
  const canonical = url(post);
  const minutes = Math.max(3, Math.round(textLength(post) / 600));
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: S.brand, url: S.origin },
      publisher: { '@type': 'Organization', name: S.brand, logo: { '@type': 'ImageObject', url: `${S.origin}/logo.png` } },
      image: `${S.origin}/logo.png`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${S.origin}/` },
        { '@type': 'ListItem', position: 2, name: S.guideTitle, item: `${S.origin}${S.guidePath}` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    },
  ];
  if (post.faq?.length)
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })),
    });

  const body = `
<main class="wrap">
  <nav class="crumb"><a href="/">홈</a> › <a href="${S.guidePath}">${esc(S.guideTitle)}</a></nav>
  <header class="post-h">
    <span class="tag">${esc(post.category || '가이드')}</span>
    <h1>${esc(post.title)}</h1>
    <div class="meta">${esc(S.brand)} · <time datetime="${post.publishedAt}">${fmtDate(post.publishedAt)}</time>${post.updatedAt && post.updatedAt !== post.publishedAt ? ` (수정 ${fmtDate(post.updatedAt)})` : ''} · ${minutes}분 읽기</div>
  </header>
  ${figure(post.cover, 'cover')}
  ${post.summary?.length ? `<div class="summary"><b>핵심만 먼저</b><ul>${post.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
  <nav class="toc"><b>목차</b><ol>${post.sections.map((s, i) => `<li><a href="#s${i + 1}">${esc(s.heading)}</a></li>`).join('')}</ol></nav>
  <article>
${bodyWithCtas(post)}
  </article>
  ${post.faq?.length ? `<section class="faq"><h2>자주 묻는 질문</h2>${post.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${sanitize(f.a)}</p></details>`).join('')}</section>` : ''}
  ${CTA.consult()}
  <p class="note">이 글은 일반적인 안내이며, 법령·지원제도·비용은 바뀔 수 있습니다. 정확한 내용은 해당 기관이나 이음케어라이프 상담(☎ ${S.phone})으로 확인해 주세요.</p>
  ${rel.length ? `<section class="related"><h2>함께 읽으면 좋은 글</h2><div class="cards">${rel.map(card).join('')}</div></section>` : ''}
</main>`;
  return layout({ title: `${post.title} | ${S.brand}`, description: post.description, canonical, jsonLd, body });
}

function renderIndex(all) {
  const canonical = `${S.origin}${S.guidePath}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: S.guideTitle,
      description: S.guideDescription,
      url: canonical,
      hasPart: all.slice(0, 30).map((p) => ({ '@type': 'Article', headline: p.title, url: url(p), datePublished: p.publishedAt })),
    },
  ];
  const body = `
<section class="hero"><div class="wrap">
  <span class="tag">이음케어라이프 정보센터</span>
  <h1>${esc(S.guideTitle)}</h1>
  <p>${esc(S.guideDescription)}</p>
</div></section>
<main class="wrap list">
  <div class="cards">${all.map(card).join('\n')}</div>
  ${CTA.quote()}
</main>`;
  return layout({ title: `${S.guideTitle} | ${S.brand}`, description: S.guideDescription, canonical, jsonLd, body, ogType: 'website' });
}

function renderSitemap(all) {
  const today = new Date().toISOString().slice(0, 10);
  const items = [
    `<url><loc>${S.origin}${S.guidePath}</loc><lastmod>${all[0]?.publishedAt || today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    ...all.map((p) => `<url><loc>${url(p)}</loc><lastmod>${p.updatedAt || p.publishedAt}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</urlset>\n`;
}

function renderRss(all) {
  const items = all
    .slice(0, 30)
    .map(
      (p) =>
        `<item><title>${esc(p.title)}</title><link>${url(p)}</link><guid>${url(p)}</guid><pubDate>${new Date(p.publishedAt + 'T07:00:00+09:00').toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(S.guideTitle)} - ${esc(S.brand)}</title><link>${S.origin}${S.guidePath}</link><description>${esc(S.guideDescription)}</description><language>ko</language>\n${items}\n</channel></rss>\n`;
}

export function renderAll() {
  const all = loadPosts();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // 더 이상 없는 글의 html 정리
  const keep = new Set(all.map((p) => `${p.slug}.html`).concat(['index.html', 'rss.xml', 'latest.json']));
  for (const f of fs.readdirSync(OUT_DIR)) if (!keep.has(f)) fs.rmSync(path.join(OUT_DIR, f));
  for (const p of all) fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.html`), renderPost(p, all));
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), renderIndex(all));
  fs.writeFileSync(path.join(OUT_DIR, 'rss.xml'), renderRss(all));
  // 홈페이지 메인에 보여줄 최신 글 목록
  fs.writeFileSync(
    path.join(OUT_DIR, 'latest.json'),
    JSON.stringify(all.slice(0, 6).map((p) => ({ slug: p.slug, title: p.title, description: p.description, category: p.category || '가이드', date: p.publishedAt, cover: (p.cover && safeImg(p.cover.src)) || null })))
  );
  fs.writeFileSync(path.join(ROOT, 'guide-sitemap.xml'), renderSitemap(all));
  return all;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const all = renderAll();
  console.log(`✓ ${all.length}개 글 렌더링 완료 → guide/`);
}
