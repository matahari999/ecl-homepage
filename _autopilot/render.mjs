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
  return `<figure class="fig ${cls}"><img src="${src}" alt="${esc(f.alt || '')}" loading="${cls === 'cover' ? 'eager' : 'lazy'}" decoding="async"></figure>`;
}

function gallery(list) {
  const items = (Array.isArray(list) ? list : []).map((g) => ({ ...g, src: safeImg(g && g.src) })).filter((g) => g.src);
  if (!items.length) return '';
  const cols = items.length === 1 ? 1 : items.length === 2 || items.length === 4 ? 2 : 3;
  return `<div class="gal gal-${cols}">${items.map((g) => `<figure><img src="${g.src}" alt="${esc(g.alt || '')}" loading="lazy" decoding="async"></figure>`).join('')}</div>`;
}
function caseCard(info) {
  if (!Array.isArray(info) || !info.length) return '';
  return `<div class="case"><b>장례 진행 개요</b><dl>${info.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`;
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
    return `<section id="s${i + 1}"><h2>${esc(s.heading)}</h2>${figure(s.figure)}${html}${gallery(s.gallery)}</section>`;
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
.gal{display:grid;gap:10px;margin:18px 0 24px}
.gal-1{grid-template-columns:1fr}.gal-2{grid-template-columns:1fr 1fr}.gal-3{grid-template-columns:repeat(3,1fr)}
@media(max-width:560px){.gal-3{grid-template-columns:1fr 1fr}.gal-3 figure:first-child{grid-column:1/-1}.gal-3 figure:first-child img{aspect-ratio:16/10}}
.gal figure{margin:0}
.gal img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;background:#eef2f7}
.gal-1 img{aspect-ratio:auto}
.gal figcaption{font-size:13px;color:var(--muted);margin-top:5px;text-align:center}
.case{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 22px;margin:22px 0}
.case b{display:block;font-size:15px;color:var(--blue);margin-bottom:8px}
.case dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 18px;margin:0}
.case dt{font-size:13px;color:var(--muted)}.case dd{margin:2px 0 0;font-weight:800;font-size:16px}
.fig{margin:22px 0 26px}
.fig img{display:block;width:100%;height:auto;border-radius:16px;border:1px solid var(--line);background:#fff}
.fig.cover{margin-top:18px}
.fig figcaption{font-size:14px;color:var(--muted);text-align:center;margin-top:8px}
.card .thumb{display:block;width:100%;aspect-ratio:1200/630;object-fit:cover;border-radius:10px;margin:0 0 12px;background:#f1f5f9}
.tag.news{background:#fef2f2;color:#b91c1c}
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
.srcs{margin:36px 0 0}.srcs h2{font-size:18px;margin:0 0 8px}.srcs ol{padding-left:20px;margin:0;font-size:15px}.srcs li{margin:6px 0}.srcs span{color:var(--muted);font-size:13px}
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

@media (prefers-color-scheme:dark){
:root{--ink:#e5e7eb;--muted:#9ca3af;--line:#2a3550;--bg:#0b1222;--card:#121a2e;--soft:#1a2747}
a{color:#93c5fd}
.summary,.toc,.case,.card,.faq details,article table{background:var(--card)}
.toc a{color:var(--ink)}
article th{background:#1a2440}
article td,article th{border-color:var(--line)}
article strong{background:linear-gradient(transparent 62%,rgba(250,204,21,.35) 62%)}
article blockquote{background:#1f1b10;border-color:#4a3d12;color:#f3e8c8}
.fig img,.gal img{border-color:var(--line);background:#0f172a}
.tag{background:#1a2747;color:#93c5fd}
.tag.news{background:#3b1414;color:#fca5a5}
.btn-ghost{background:#1e293b;color:#e5e7eb;border-color:#334155}
.card:hover{border-color:#3b5bdb}
.case b,.summary b{color:#93c5fd}
.faq details p{color:#cbd5e1}
}
`;

function layout({ title, description, canonical, jsonLd = [], body, ogType = 'article', image = '', active = 'guide' }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
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
${image ? `<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">` : `<meta property="og:image" content="${S.origin}/logo.png">
<meta name="twitter:card" content="summary">`}
<link rel="icon" type="image/png" href="/logo.png">
<link rel="alternate" type="application/rss+xml" title="${esc(S.guideTitle)}" href="${S.guidePath}/rss.xml">
<meta name="theme-color" content="#0a0f1e">
<script src="/ecl-track.js" defer></script>
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
    <a${active === 'guide' ? ' class="on"' : ''} href="${S.guidePath}">블로그</a>
    <a class="hide-m${active === 'jangji' ? ' on' : ''}" href="/jangji">장지 안내</a>
    <a class="hide-m" href="/testimonials">후기</a>
    <a class="btn btn-blue hide-m" href="${S.consultUrl}">상담문의</a>
  </nav>
</div></header>
${body}
<footer class="ft"><div class="ft-in">
  <div><b style="color:#fff">${esc(S.brand)}</b><br>고양·파주·김포 및 수도권 후불제 상조 · 요양병원 연계 · 방문요양</div>
  <div>대표전화 <a href="tel:${S.phone}">${S.phone}</a> (24시간)<br><a href="/">홈</a> · <a href="${S.quoteUrl}">견적 계산기</a> · <a href="${S.guidePath}">블로그</a> · <a href="/jangji">장지 안내</a> · <a href="${S.consultUrl}">상담 신청</a></div>
</div></footer>
<div class="float"><a class="f-kakao" href="${S.kakao}" target="_blank" rel="noopener" aria-label="카카오톡 상담">톡</a><a class="f-call" href="tel:${S.phone}" aria-label="전화 상담">📞</a></div>
</body>
</html>
`;
}

function card(p) {
  const th = p.cover && safeImg(p.cover.src);
  return `<a class="card" href="${S.guidePath}/${p.slug}">${th ? `<img class="thumb" src="${th}" alt="" loading="lazy">` : ''}<span class="tag${p.category === '업계 소식' ? ' news' : ''}">${esc(p.category || '가이드')}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><time datetime="${p.publishedAt}">${fmtDate(p.publishedAt)}</time></a>`;
}

// 공유 미리보기용 PNG (og.mjs가 만든 og.png) 주소
export function ogImage(post) {
  const src = post?.cover?.src || '';
  if (!/^\/images\/.+\.svg$/.test(src)) return '';
  const rel = path.join(path.dirname(src), 'og.png');
  return fs.existsSync(path.join(ROOT, rel)) ? `${S.origin}${rel.split(path.sep).join('/')}` : '';
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
      image: ogImage(post) || `${S.origin}/logo.png`,
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
    <span class="tag${post.category === '업계 소식' ? ' news' : ''}">${esc(post.category || '가이드')}</span>
    <h1>${esc(post.title)}</h1>
    <div class="meta">${esc(S.brand)} · <time datetime="${post.publishedAt}">${fmtDate(post.publishedAt)}</time>${post.updatedAt && post.updatedAt !== post.publishedAt ? ` (수정 ${fmtDate(post.updatedAt)})` : ''} · ${minutes}분 읽기</div>
  </header>
  ${figure(post.cover, 'cover')}
  ${caseCard(post.caseInfo)}
  ${post.summary?.length ? `<div class="summary"><b>핵심만 먼저</b><ul>${post.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
  <nav class="toc"><b>목차</b><ol>${post.sections.map((s, i) => `<li><a href="#s${i + 1}">${esc(s.heading)}</a></li>`).join('')}</ol></nav>
  <article>
${bodyWithCtas(post)}
  </article>
  ${post.faq?.length ? `<section class="faq"><h2>자주 묻는 질문</h2>${post.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${sanitize(f.a)}</p></details>`).join('')}</section>` : ''}
  ${CTA.consult()}
  ${post.sources?.length ? `<section class="srcs"><h2>참고한 자료</h2><ol>${post.sources.filter((x) => /^https:\/\//.test(x.url)).map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener nofollow">${esc(x.title)}</a>${x.publisher || x.date ? ` <span>${esc([x.publisher, x.date].filter(Boolean).join(' · '))}</span>` : ''}</li>`).join('')}</ol></section>` : ''}
  <p class="note">이 글은 일반적인 안내이며, 법령·지원제도·비용은 바뀔 수 있습니다. 정확한 내용은 해당 기관이나 이음케어라이프 상담(☎ ${S.phone})으로 확인해 주세요.</p>
  ${rel.length ? `<section class="related"><h2>함께 읽으면 좋은 글</h2><div class="cards">${rel.map(card).join('')}</div></section>` : ''}
</main>`;
  return layout({ title: `${post.title} | ${S.brand}`, description: post.description, canonical, jsonLd, body, image: ogImage(post) });
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
  return layout({ title: `${S.guideTitle} | ${S.brand}`, description: S.guideDescription, canonical, jsonLd, body, ogType: 'website', image: `${S.origin}/og-home.jpg` });
}

// ---------- 장지 안내 페이지 (/jangji) ----------
const JANGJI_FAQ = [
  { q: '봉안당과 수목장은 무엇이 다른가요?', a: '봉안당(봉안시설)은 화장한 유골함을 시설 안 안치단에 모시는 방식이고, 수목장 같은 자연장은 화장한 유골의 골분을 나무·화초·잔디 등의 아래나 주변에 묻는 방식입니다. 참배 방식과 관리 방법, 사용 기간 기준이 달라 가족이 성묘를 어떻게 할지부터 정하면 고르기 쉽습니다.' },
  { q: '장지를 아직 못 정했는데 화장부터 해도 되나요?', a: '화장은 예약이 필요하고, 유골을 모실 곳은 그 뒤에 정해도 되는 경우가 많습니다. 다만 봉안시설마다 안치 가능한 시간과 필요한 서류가 있어, 발인 전에 후보를 두세 곳으로 좁혀 두면 일정이 흔들리지 않습니다.' },
  { q: '이미 모신 분을 다른 곳으로 옮기려면 어떻게 하나요?', a: '매장한 시신이나 유골을 다른 분묘·봉안시설로 옮기거나 화장·자연장하는 일을 법에서는 개장이라고 합니다. 옮길 곳을 먼저 정한 뒤, 관할 시·군·구청에 필요한 허가·신고 절차와 서류를 확인하고 진행하세요. 지역마다 안내가 다를 수 있습니다.' },
  { q: '시설이 정식으로 허가받은 곳인지 어떻게 확인하나요?', a: '보건복지부 e하늘 장사정보시스템에서 봉안·자연장지·묘지 시설을 조회할 수 있고, 계약 전에 설치 허가·신고 여부를 시설이나 관할 시·군·구청에 직접 확인하는 것이 안전합니다.' },
  { q: '장례식장으로 직접 와서 설명해 주나요?', a: '네. 이음케어라이프는 상담이 이루어지면 담당 직원이 서울·경기 지역 장례식장으로 직접 찾아가, 가족분들께 장지별 위치·비용·사용 기간·이용 자격을 비교해 설명드리고 화장·안치 일정까지 함께 정리해 드립니다. 대표전화 1588-9012로 요청하시면 됩니다.' },
  { q: '국가유공자·참전용사는 어디에 모실 수 있나요?', a: '국가유공자와 6·25 참전군인 등은 국립묘지법에 따라 국립현충원·호국원 안장 대상이 될 수 있습니다. 수도권에서는 경기 이천의 국립이천호국원이 확충 후 2025년부터 안장을 재개했습니다. 대상 여부와 신청 절차는 국가보훈부 국립묘지 안장신청으로 확인하세요.' },
  { q: '일산·고양에서 가까운 수목장은 어디인가요?', a: '고양시 일산동구 지영동의 일산공감수목장(봉화사) 같은 사설 수목장림이 있고, 공설로는 파주 광탄면 서울시립 용미리 제1묘지 잔디장(서울·고양·파주 6개월 이상 거주자 대상)이 있습니다. 사설은 나무와 구역을 골라 오래 모실 수 있고, 공설은 비용이 낮은 대신 이용 조건과 기간 제한이 있습니다.' },
  { q: '서울시립 납골당(봉안당)에 지금 모실 수 있나요?', a: '서울시립 봉안시설은 안치 여건이 부족해 2022년 4월 25일부터 신규 봉안을 받지 않습니다. 이미 배우자가 시립 봉안시설에 계신 경우의 부부합골만 가능하니, 새로 모실 곳은 사설 봉안당이나 자연장지 가운데서 고르셔야 합니다.' },
  { q: '서울추모공원은 납골당인가요?', a: '아닙니다. 서울추모공원(서초구)은 서울시가 운영하는 화장시설입니다. 화장 후 유골을 모실 봉안당·수목장·자연장지는 따로 정해야 하며, 고양·파주 쪽에 모실 계획이라면 고양의 서울시립승화원에서 화장하는 편이 이동이 짧습니다.' },
  { q: '서현추모공원은 어디에 있나요?', a: '서현공원(서현추모공원)은 경기도 파주시 파주읍 명봉산로 277에 있는 봉안시설입니다(☎ 031-947-4114). 고양 서울시립승화원에서 화장한 뒤 같은 날 봉안까지 이어서 진행하는 경우가 많습니다.' },
  { q: '비용은 얼마나 드나요?', a: '시설 종류, 지역, 안치 위치, 사용 기간, 관리비 방식에 따라 크게 달라 한 가지 금액으로 말씀드리기 어렵습니다. 총액만 보지 말고 분양가에 관리비와 추가 비용(명패·안치 비용 등)이 포함되는지 항목별 견적서로 비교하세요.' },
];


// 고양·파주·서울 주요 장지 (공식 자료 기준, 2026-11 확인). 관계·제휴 표현 금지, 사실 정보만.
const JANGJI_PLACES = [
  { region: '고양·일산', name: '일산공감수목장 (봉화사)', alt: '공감수목장, 일산수목장', type: '수목장 (자연장)', op: '사설 · 종교단체(사찰) 운영',
    addr: '경기도 고양시 일산동구 지영로194번길 132 (지영동)', tel: '031-975-4588',
    desc: '일산 지영동 현달산 자락에 조성된 수목장림입니다. 한국수목장문화진흥재단 수목장림 목록 기준 약 2만 그루 규모에 주차 80대를 갖췄고, 서울시립승화원(벽제)과 가까워 화장 후 같은 날 안치 일정을 잡기 수월합니다. 개인목·부부목·가족목·공동목으로 나뉘어 가족 형태에 맞게 고를 수 있습니다.',
    tip: '나무 위치와 조망, 개인·부부·가족목별 비용과 사용 기간을 현장에서 직접 비교해 보세요.' },
  { region: '고양·일산', name: '청아공원', alt: '일산 청아공원 납골당', type: '봉안당 (납골당)', op: '사설 · 법인',
    addr: '경기도 고양시 일산동구 은마길 129 (설문동)', tel: '031-977-6700',
    desc: '일산동구 설문동에 있는 실내 봉안당(납골당)입니다. 일산·파주 생활권에서 성묘 다니기 편한 위치를 찾는 가족들이 많이 비교하는 곳입니다.',
    tip: '안치단 층·위치에 따라 비용 차이가 크니 같은 조건으로 견적을 받아 비교하세요.' },
  { region: '고양·일산', name: '장안정사 추모공원', alt: '일산 장안정사 납골당', type: '사찰 봉안시설', op: '사설 · 사찰(대한불교조계종)',
    addr: '경기도 고양시 일산동구 백마로502번길 64-13 (풍동)', tel: '031-903-6650',
    desc: '일산동구 풍동의 사찰 추모공원으로 1988년에 문을 열었습니다. 불교식으로 모시고 사찰에서 제례를 함께 올리고 싶은 가족이 찾습니다.',
    tip: '불교 의식(49재 등)을 함께 진행할지 미리 정해 두면 상담이 빠릅니다.' },
  { region: '고양·일산', name: '서울시립승화원 (벽제 화장장)', alt: '벽제승화원, 벽제화장장', type: '화장시설 · 봉안당 · 유택동산(산골)', op: '공설 · 서울시설공단',
    addr: '경기도 고양시 덕양구 통일로 504 (대자동)', tel: '031-960-0236',
    desc: '화장로 23기를 갖춘 수도권 서북부의 대표 화장장으로, 고양·파주·김포 등 서북부 장례에서 많이 이용합니다. 단지 안 시립 봉안당은 안치 여건이 부족해 2022년 4월부터 신규 봉안을 받지 않고(배우자 합골만 가능), 골분을 뿌리는 유택동산은 이용할 수 있습니다.',
    tip: '화장 예약은 e하늘 장사정보시스템에서 하며, 서울·고양·파주 6개월 이상 거주자는 관내 요금이 적용됩니다.' },
  { region: '파주', name: '서울시립 용미리 제1묘지 (잔디장·추모의 숲)', alt: '용미리 자연장, 용미리 묘지', type: '자연장(잔디장) · 산분장', op: '공설 · 서울시설공단',
    addr: '경기도 파주시 광탄면 명봉산로 262번길 290', tel: '031-943-1930',
    desc: '서울시가 운영하는 공설 자연장지입니다. 서울·고양·파주에서 6개월 이상 살다 돌아가신 분이 대상이며, 능선형 잔디장은 40년 50만 원(연장·반환 불가)입니다. 수목장 구역은 만장이라 현재는 잔디장 위주로 운영되고, 골분을 뿌리는 추모의 숲도 있습니다.',
    tip: '예약 없이 화장 당일 승화원 접수실에서 자연장을 신청하면 됩니다. 한 번 안장하면 유골을 돌려받거나 이장할 수 없습니다.' },
  { region: '파주', name: '서현공원 (서현추모공원)', alt: '파주 서현추모공원 납골당', type: '봉안당 (납골당)', op: '사설',
    addr: '경기도 파주시 파주읍 명봉산로 277', tel: '031-947-4114',
    desc: '파주읍 명봉산로에 있는 봉안시설로, 고양 서울시립승화원에서 화장한 뒤 같은 날 이동해 안치하는 경우가 많습니다.',
    tip: '발인 날 화장 시간과 봉안 가능 시간을 미리 맞춰 두면 하루에 안치까지 마칠 수 있습니다.',
    post: '/guide/sinchon-severance-limousine-bus-4day-case.html' },
  { region: '파주', name: '동화경모공원', alt: '파주 동화경모공원 납골당', type: '묘지 · 봉안당', op: '사설 · 재단법인',
    addr: '경기도 파주시 탄현면 헤이리로 98', tel: '031-945-3226',
    desc: '파주 통일동산 지구에 있는 실향민 추모공원으로, 매장 묘역과 봉안당을 함께 운영합니다. 임진강 너머 북녘이 보이는 곳이라 고향이 북쪽인 가족들이 많이 찾습니다.',
    tip: '묘역과 봉안당은 이용 조건이 달라 원하는 방식을 먼저 정하고 문의하세요.' },
  { region: '파주', name: '통일로추모공원', alt: '파주 통일로추모공원 납골당', type: '봉안당 (납골당)', op: '사설',
    addr: '경기도 파주시 조리읍 명봉산로114번길 84', tel: '031-943-3501',
    desc: '파주 조리읍 명봉산로 일대에 있는 봉안시설입니다. 서현공원·용미리 묘지와 같은 권역이라 함께 둘러보며 비교하기 좋습니다.',
    tip: '관리비 납부 방식(일시납·연납)과 사용 기간을 함께 확인하세요.' },
  { region: '파주', name: '크리스찬 메모리얼파크', alt: '파주 기독교 납골당', type: '봉안당 (기독교)', op: '사설',
    addr: '경기도 파주시 조리읍 홀작로 164', tel: '031-957-1260',
    desc: '파주 조리읍의 기독교 봉안시설입니다. 기독교식으로 모시고 예배하는 공간을 원하는 가족이 비교합니다.',
    tip: '교회 단체 구역이 있는지, 일반 가족도 분양받을 수 있는지 문의하세요.' },
  { region: '파주', name: '약수암 (파주추모공원)', alt: '파주추모공원 납골당', type: '사찰 봉안시설', op: '사설 · 사찰',
    addr: '경기도 파주시 파주읍 약수골길 86', tel: '031-952-4801',
    desc: '파주읍에 있는 사찰 봉안시설로, 파주추모공원이라는 이름으로도 불립니다.',
    tip: '사찰 시설은 제례·천도재 운영 방식도 함께 확인해 두면 좋습니다.' },
  { region: '서울', name: '서울추모공원 (서초 화장장)', alt: '서울추모공원 화장', type: '화장시설 · 유택동산(산골)', op: '공설 · 서울시설공단',
    addr: '서울특별시 서초구 양재대로12길 74', tel: '1577-2082',
    desc: '이름은 추모공원이지만 납골당이 아니라 화장로 15기를 갖춘 서울 남부의 화장장입니다. 화장 뒤 유골을 모실 봉안당이나 자연장지는 따로 정해야 합니다.',
    tip: '서울시립 자연장지는 파주 용미리에 있어, 자연장 계획이라면 고양 서울시립승화원에서 화장하는 편이 동선이 짧습니다.' },
];


// 서울·경기·인천 그 밖의 장지 (이름·지역·공식 사이트 위주)
const JANGJI_MORE = [
  { name: '화성 함백산추모공원', area: '경기 화성', type: '공설 · 화장·봉안당·자연장', note: '화성·부천·안산·안양·시흥·광명·군포 7개 시 공동 이용', url: 'https://hbm.hu.or.kr' },
  { name: '광명 메모리얼파크', area: '경기 광명', type: '공설 · 봉안당', note: '광명시 자경로 153 · ☎ 02-2610-7380', url: 'https://www.gm.go.kr/pt/partInfo/wf/funeral/PTMN542.jsp' },
  { name: '수원시 연화장', area: '경기 수원', type: '공설 · 화장·봉안당·자연장', note: '☎ 031-218-6500' },
  { name: '성남시 영생관리사업소', area: '경기 성남', type: '공설 · 화장·봉안', note: '☎ 031-754-2268' },
  { name: '용인공원 (아너스톤)', area: '경기 용인', type: '사설 · 재단법인 묘지·봉안당', note: '처인구 모현읍 새래로 158-33 · ☎ 031-334-3484' },
  { name: '인천가족공원', area: '인천 부평', type: '공설 · 봉안당·자연장(수목장 등)', note: '부평구 평온로 61', url: 'https://www.incheon.go.kr/welfare/WE010316' },
  { name: '서울 자치구 추모의집', area: '서울 각 구', type: '구립 봉안시설', note: '동작·성동·성북·종로·중구 등 ☎ 1800-2325', url: 'http://seoulskypark.co.kr/' },
  { name: '예은추모공원 (강남·동대문·서대문·강동구 추모의집)', area: '충북 음성', type: '구 위탁 봉안시설', note: '해당 구 주민 이용', url: 'http://www.yeaeunpark.com/' },
  { name: '국립이천호국원', area: '경기 이천', type: '국립묘지 · 국가유공자·참전용사', note: '확충 후 2025년 안장 재개 · ☎ 031-645-2345', url: 'https://www.mpva.go.kr/icnc/index.do' },
];

function renderJangji(all) {
  const canonical = `${S.origin}/jangji`;
  const re = /봉안|수목|자연장|장지|이장|개장|묘지|납골|추모공원|잔디장/;
  const related = all.filter((p) => re.test(`${p.title} ${p.keyword} ${(p.keywords || []).join(' ')} ${p.category || ''}`)).slice(0, 6);
  const more = related.length >= 3 ? related : [...related, ...all.filter((p) => !related.includes(p))].slice(0, 4);
  const title = '장지 안내: 서울·경기 추모공원·납골당·수목장 비교, 장례식장 방문 상담 | ' + S.brand;
  const description = '서울·경기 추모공원, 납골당(봉안당), 수목장을 한눈에. 상담 후 담당 직원이 장례식장으로 찾아가 안내합니다. 일산공감수목장·청아공원·서현추모공원·동화경모공원·용미리 자연장 등 주요 장지의 위치·종류·연락처와 장지 고르는 기준, 개장·이장 절차를 정리했습니다.';
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: '장지 안내', description, url: canonical, isPartOf: { '@type': 'WebSite', name: S.brand, url: S.origin } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: `${S.origin}/` },
      { '@type': 'ListItem', position: 2, name: '장지 안내', item: canonical } ] },
    { '@context': 'https://schema.org', '@type': 'ItemList', name: '고양·일산·파주 주요 추모공원·납골당·수목장', itemListElement: JANGJI_PLACES.map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Place', name: x.name, alternateName: x.alt, description: `${x.type} · ${x.op}`, telephone: x.tel, address: { '@type': 'PostalAddress', streetAddress: x.addr, addressCountry: 'KR' } } })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: JANGJI_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];
  const body = `
<style>
.jg-types{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));margin:6px 0 10px}
.jg-t{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px}
.jg-t i{font-style:normal;font-size:28px;display:block;margin-bottom:6px}
.jg-t b{display:block;font-size:18px;letter-spacing:-.02em}
.jg-t span{display:block;color:var(--muted);font-size:14px;line-height:1.7;margin-top:4px}
.jg-steps{counter-reset:s;list-style:none;padding:0!important}
.jg-steps li{counter-increment:s;position:relative;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 18px 14px 56px;margin:10px 0}
.jg-steps li::before{content:counter(s);position:absolute;left:16px;top:14px;width:28px;height:28px;border-radius:50%;background:var(--blue);color:#fff;display:grid;place-items:center;font-weight:900;font-size:14px}
.jg-chk{list-style:none;padding:0!important}
.jg-chk li{position:relative;padding-left:30px;margin:8px 0}
.jg-chk li::before{content:'☐';position:absolute;left:0;color:var(--blue);font-size:19px;line-height:1.5}
.jg-pl{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin:10px 0 18px}
.jg-p{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px}
.jg-p h3{margin:0 0 4px;font-size:19px;letter-spacing:-.02em}
.jg-p .meta{font-size:13px;color:var(--muted);margin:0 0 8px}
.jg-p .meta b{display:inline-block;background:var(--soft);color:var(--blue-d);border-radius:999px;padding:1px 10px;margin-right:6px;font-size:12px}
.jg-p p{font-size:15px;line-height:1.75;margin:6px 0}
.jg-p .ad{font-size:14px;color:var(--ink)}
.jg-p .tp{font-size:14px;color:var(--muted);border-top:1px dashed var(--line);padding-top:8px;margin-top:10px}
.jg-rg{font-size:21px;margin:26px 0 4px}
.jg-visit{background:linear-gradient(135deg,#0a0f1e,#1e3a8a);color:#fff;border-radius:20px;padding:26px 24px;margin:8px 0 26px}
.jg-visit h2{color:#fff;margin-top:0}
.jg-visit p{color:#dbeafe}
.jg-visit ol{list-style:none;padding:0!important;display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin:14px 0}
.jg-visit li{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:14px 16px;font-size:15px;line-height:1.7}
.jg-visit li b{display:block;color:#fcd34d;font-size:16px;margin-bottom:2px}
.jg-more{list-style:none;padding:0!important}
.jg-more li{border-bottom:1px solid var(--line);padding:10px 0;font-size:15px}
.jg-more li span{color:var(--muted);font-size:14px}
</style>
<section class="hero"><div class="wrap">
  <span class="tag">장지 안내</span>
  <h1>추모공원·납골당·수목장,<br>어디에 모실지 막막하다면</h1>
  <p>서울·경기 주요 장지의 위치와 특징, 봉안당(납골당)·수목장(자연장)·묘지의 차이와 고르는 기준, 이미 모신 분을 옮기는 개장·이장 절차를 한 곳에 정리했습니다.</p>
  <p style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-gold" href="tel:${S.phone}">📞 장지 상담 ${S.phone}</a><a class="btn btn-ghost" href="${S.consultUrl}">상담 신청</a></p>
  <p style="margin-top:10px;font-size:15px">🚗 상담이 접수되면 <strong>담당 직원이 장례식장으로 직접 찾아가</strong> 장지를 설명드립니다.</p>
</div></section>
<main class="wrap"><article>
<section id="visit" class="jg-visit"><h2>담당 직원이 장례식장으로 찾아가 직접 안내합니다</h2>
<p>경황없는 장례 중에 전화와 인터넷만으로 장지를 고르기는 쉽지 않습니다. 이음케어라이프는 상담이 이루어지면 담당 직원이 서울·경기 어느 장례식장이든 직접 찾아가, 가족분들 앞에서 장지별 차이와 비용, 조건을 정확하게 설명해 드립니다.</p>
<ol>
<li><b>① 전화·카톡 상담</b>고인 주소지, 종교, 성묘 거리, 예산 등 가족의 조건을 여쭙니다.</li>
<li><b>② 장례식장 방문</b>담당 직원이 빈소로 찾아가 상주·가족분들을 직접 뵙습니다.</li>
<li><b>③ 맞춤 비교 설명</b>조건에 맞는 봉안당·수목장·자연장 후보의 위치, 비용, 사용 기간, 이용 자격을 자료로 비교해 드립니다.</li>
<li><b>④ 일정까지 정리</b>화장 시간과 안치 가능 시간, 필요한 서류를 맞춰 발인 날 동선이 흔들리지 않게 돕습니다.</li>
</ol>
<p style="display:flex;gap:8px;flex-wrap:wrap;margin:0"><a class="btn btn-gold" href="tel:${S.phone}">📞 방문 상담 요청 ${S.phone}</a><a class="btn btn-ghost" href="${S.consultUrl}">상담 신청서 남기기</a></p>
</section>
<section id="types"><h2>장지는 크게 세 가지 방식입니다</h2>
<div class="jg-types">
  <div class="jg-t"><i>🏛️</i><b>봉안당 (봉안시설)</b><span>화장한 유골함을 시설 안 안치단에 모십니다. 실내에서 참배하기 편하고 날씨 영향이 적습니다.</span></div>
  <div class="jg-t"><i>🌳</i><b>수목장 · 자연장</b><span>화장한 골분을 나무·화초·잔디 아래나 주변에 묻습니다. 자연 속에 모시고 싶은 가족이 찾습니다.</span></div>
  <div class="jg-t"><i>⛰️</i><b>묘지 (매장)</b><span>유골을 땅에 묻고 봉분이나 평장으로 모십니다. 선산·종중 묘지를 이어 쓰는 가족에게 맞습니다.</span></div>
</div>
<table><thead><tr><th>구분</th><th>이런 가족에게</th><th>계약 전 확인할 점</th></tr></thead><tbody>
<tr><td>봉안당</td><td>성묘가 잦고, 날씨와 관계없이 참배하고 싶은 가족</td><td>사용 기간·연장 방식, 관리비, 안치단 위치, 종교 제한, 사용권 승계</td></tr>
<tr><td>수목장·자연장</td><td>자연 속에 모시고 관리 부담을 줄이고 싶은 가족</td><td>개인·부부·가족·공동 구역 구분, 표지 방식, 사용 기간, 허가·신고된 자연장지인지</td></tr>
<tr><td>묘지(매장)</td><td>선산이나 종중 묘지를 이어 쓰는 가족</td><td>설치 허가·신고 대상 여부, 관리 주체, 훗날 개장·이장 계획</td></tr>
</tbody></table></section>


<section id="places"><h2>고양·일산·파주 주요 추모공원·납골당·수목장</h2>
<p>수도권 서북부에서 장례를 치르면 대부분 고양의 서울시립승화원(벽제)에서 화장한 뒤, 가까운 일산·파주의 봉안당(납골당)이나 수목장에 모십니다. 많이 찾는 곳을 지역별로 정리했습니다. 비용과 분양 조건은 자주 바뀌므로 계약 전에 해당 시설에 꼭 확인하세요.</p>
<table><thead><tr><th>시설</th><th>지역</th><th>종류</th><th>운영</th></tr></thead><tbody>
${JANGJI_PLACES.map((x) => `<tr><td><a href="#pl-${JANGJI_PLACES.indexOf(x) + 1}">${esc(x.name)}</a></td><td>${esc(x.region)}</td><td>${esc(x.type)}</td><td>${esc(x.op.split(' · ')[0])}</td></tr>`).join('')}
</tbody></table>
${['고양·일산', '파주', '서울'].map((rg) => `<h3 class="jg-rg">${rg === '서울' ? '서울 (화장시설)' : rg + ' 추모공원·납골당·수목장'}</h3><div class="jg-pl">${JANGJI_PLACES.filter((x) => x.region === rg).map((x) => `<div class="jg-p" id="pl-${JANGJI_PLACES.indexOf(x) + 1}"><h3>${esc(x.name)}</h3><p class="meta"><b>${esc(x.type)}</b>${esc(x.op)}</p><p>${esc(x.desc)}</p><p class="ad">📍 ${esc(x.addr)}<br>☎ <a href="tel:${x.tel}">${x.tel}</a></p><p class="tp">💡 ${esc(x.tip)}${x.post ? ` <a href="${x.post}">실제 진행 후기 보기 →</a>` : ''}</p></div>`).join('')}</div>`).join('')}
<h3 class="jg-rg">서울·경기·인천 그 밖의 추모공원·납골당</h3>
<p>공설 시설은 대부분 고인의 주소지(보통 사망 전 6개월 이상 거주)에 따라 이용 자격과 요금이 달라집니다. 아래 시설도 상담하시면 조건에 맞는지 함께 확인해 드립니다.</p>
<ul class="jg-more">${JANGJI_MORE.map((x) => `<li><strong>${x.url ? `<a href="${x.url}" target="_blank" rel="noopener nofollow">${esc(x.name)}</a>` : esc(x.name)}</strong> · ${esc(x.area)} <span>— ${esc(x.type)} · ${esc(x.note)}</span></li>`).join('')}
<li><strong><a href="https://www.ehaneul.go.kr" target="_blank" rel="noopener nofollow">e하늘 장사정보시스템</a></strong> · 전국 <span>— 보건복지부 운영, 전국 봉안당·자연장지·묘지·화장시설 검색과 화장 예약</span></li></ul>
<blockquote>어느 곳이 우리 가족에게 맞을지 모르겠다면, 성묘 거리·종교·예산을 알려 주세요. 담당 직원이 장례식장으로 찾아가 화장 일정과 안치 동선까지 함께 맞춰 드립니다. ☎ ${S.phone}</blockquote>
</section>

<section id="choose"><h2>장지 고르는 5가지 기준</h2>
<ol class="jg-steps">
<li><strong>성묘 거리와 빈도</strong> — 자주 찾을 수 있는 거리인지, 고령의 가족이 이동하기 편한지를 가장 먼저 봅니다.</li>
<li><strong>비용은 총액으로</strong> — 분양가만 보지 말고 관리비, 안치·명패 비용, 사용 기간 연장 비용까지 항목별 견적서로 비교하세요.</li>
<li><strong>사용 기간과 만료 후 처리</strong> — 기간이 끝나면 연장할 수 있는지, 연장하지 않으면 유골을 어떻게 하는지 계약서에서 확인합니다.</li>
<li><strong>가족 합의</strong> — 형제자매, 종교, 부부 합장 여부를 계약 전에 맞춰 두면 훗날 이장 같은 부담이 줄어듭니다.</li>
<li><strong>정식 허가 시설인지</strong> — 보건복지부 e하늘 장사정보시스템과 관할 시·군·구청에서 설치 허가·신고 여부를 확인하세요.</li>
</ol></section>

<section id="move"><h2>이미 모신 분을 옮기려면: 개장·이장 절차</h2>
<p>법에서는 매장한 시신이나 유골을 다른 분묘·봉안시설로 옮기거나, 화장 또는 자연장하는 일을 <strong>개장</strong>이라고 부릅니다. 선산 정리, 묘지 이전, 봉안당 계약 만료 같은 이유로 많이 하며, 지역마다 안내가 조금씩 다르니 시작 전 관할 시·군·구청에 확인하세요.</p>
<ol class="jg-steps">
<li><strong>옮길 곳 정하기</strong> — 봉안당·자연장지·새 묘지 중 가족이 합의한 곳과 먼저 계약하거나 안치 일정을 확정합니다.</li>
<li><strong>허가·신고 서류 확인</strong> — 현재 모신 곳을 관할하는 시·군·구청에 개장에 필요한 허가나 신고 서류를 문의합니다.</li>
<li><strong>현재 시설 정리</strong> — 현재 봉안시설이나 묘지 관리 주체에 반출·해지 절차와 정산 내역을 확인합니다.</li>
<li><strong>이장 진행과 신고</strong> — 옮긴 뒤 새 장소에서 필요한 신고를 마치고, 서류는 따로 보관해 둡니다. 매장이나 자연장을 한 경우에는 법정 기한 안에 신고해야 하니 기한도 함께 확인하세요.</li>
</ol></section>

${CTA.consult()}

<section id="check"><h2>계약 전 체크리스트</h2>
<ul class="jg-chk">
<li>시설의 설치 허가·신고 여부를 e하늘 장사정보시스템 또는 관할 청에서 확인했다</li>
<li>분양가, 관리비, 추가 비용이 항목별로 적힌 견적서를 받았다</li>
<li>사용 기간, 연장 방식, 만료 후 유골 처리 방법을 계약서에서 확인했다</li>
<li>사용권을 가족에게 승계하는 방법과 비용을 확인했다</li>
<li>직접 방문해 위치, 주차, 참배 환경, 시설 관리 상태를 봤다</li>
<li>환불·해약 조건과 시설 이전·폐업 시 처리 방법을 확인했다</li>
<li>형제자매와 가족이 장지에 합의했다</li>
</ul>
<blockquote>한 번 정하면 바꾸기 어려운 결정이라, 급하게 계약하라는 안내에는 서두르지 않는 것이 좋습니다. 장례 중이라면 화장과 유골을 모실 곳의 일정이 맞는지만 먼저 확인하고, 나머지는 후보를 비교한 뒤 결정해도 늦지 않은 경우가 많습니다.</blockquote></section>

<section id="faq" class="faq"><h2>자주 묻는 질문</h2>${JANGJI_FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>

${more.length ? `<section class="related"><h2>장지·장례 관련 글</h2><div class="cards">${more.map(card).join('')}</div></section>` : ''}
<section class="srcs"><h2>참고한 자료</h2><ol><li><a href="https://www.law.go.kr/법령/장사등에관한법률" target="_blank" rel="noopener nofollow">장사 등에 관한 법률</a> <span>법제처 국가법령정보센터</span></li><li><a href="https://news.seoul.go.kr/welfare/archives/48524" target="_blank" rel="noopener nofollow">서울시립장사시설 운영</a> <span>서울특별시</span></li><li><a href="https://www.sisul.or.kr/open_content/memorial/use/nature.jsp" target="_blank" rel="noopener nofollow">자연장·봉안 이용안내</a> <span>서울시설공단</span></li><li><a href="https://www.paju.go.kr/www/www_02/www_02_01/www_02_01_08/www_02_01_08_02/www_02_01_08_02_05.jsp" target="_blank" rel="noopener nofollow">파주시 봉안시설 현황</a> <span>파주시청</span></li><li><a href="https://www.mpva.go.kr/icnc/contents.do?key=629" target="_blank" rel="noopener nofollow">국립이천호국원 안장 대상</a> <span>국가보훈부</span></li><li><a href="https://www.wbf.or.kr/woodland/facility/list.do" target="_blank" rel="noopener nofollow">전국 수목장림 찾아보기</a> <span>한국수목장문화진흥재단</span></li></ol></section>
<p class="note">이 페이지는 일반적인 안내이며, 법령·허가 절차·비용은 지역과 시설에 따라 다르고 바뀔 수 있습니다. 정확한 내용은 관할 시·군·구청이나 해당 시설, 이음케어라이프 상담(☎ ${S.phone})으로 확인해 주세요.</p>
</article></main>`;
  return layout({ title, description, canonical, jsonLd, body, ogType: 'website', image: `${S.origin}/og-home.jpg`, active: 'jangji' });
}

function renderSitemap(all) {
  const today = new Date().toISOString().slice(0, 10);
  const items = [
    `<url><loc>${S.origin}${S.guidePath}</loc><lastmod>${all[0]?.publishedAt || today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    `<url><loc>${S.origin}/jangji</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
    ...all.map((p) => {
      const imgs = [ogImage(p), ...(p.sections || []).flatMap((x) => (x.gallery || []).map((g) => g.src))]
        .filter(Boolean).map((u) => (u.startsWith('http') ? u : `${S.origin}${u}`)).slice(0, 8);
      return `<url><loc>${url(p)}</loc><lastmod>${p.updatedAt || p.publishedAt}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>${imgs.map((u) => `<image:image><image:loc>${esc(u)}</image:loc></image:image>`).join('')}</url>`;
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${items.join('\n')}\n</urlset>\n`;
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
  fs.mkdirSync(path.join(ROOT, 'jangji'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'jangji', 'index.html'), renderJangji(all));
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
