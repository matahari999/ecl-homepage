// 매일 아침 자동 실행되는 블로그 오토파일럿
// 1) 구글 서치콘솔에서 "노출은 많은데 클릭이 거의 없는 검색어"를 찾고
// 2) Claude가 그 검색어 전용 안내글을 쓰고
// 3) 방문자가 많은 기존 글에서 새 글로 링크를 걸고
// 4) 정적 페이지를 다시 생성합니다. (커밋·푸시는 GitHub Actions가 함)
//
// 사용법
//   [Claude Code 모드 — Pro 구독, API 키 불필요]
//   node _autopilot/run.mjs --brief            # 오늘의 검색어 + 작성 지침 출력 → Claude가 글 JSON 작성
//   node _autopilot/run.mjs --publish post.json # 그 JSON을 검증·내부링크·발행
//   [API 모드]
//   node _autopilot/run.mjs                    # 자동 (서치콘솔 → 없으면 예비 키워드)
//   node _autopilot/run.mjs --keyword "무빈소 장례 비용"   # 키워드 직접 지정
//   node _autopilot/run.mjs --dry-run          # 어떤 키워드를 고를지만 보기 (글 안 씀)
//   node _autopilot/run.mjs --report           # 서치콘솔 빈칸 검색어 상위 20개 출력
//
// 필요한 환경변수 (GitHub → Settings → Secrets and variables → Actions)
//   ANTHROPIC_API_KEY          (필수) Claude API 키
//   GSC_SERVICE_ACCOUNT_JSON   (선택) 서치콘솔 읽기용 서비스계정 JSON 전체
//   GSC_SITE_URL               (선택) 기본값 sc-domain:ecl.ai.kr  (URL 접두어 속성이면 https://ecl.ai.kr/)
//   CLAUDE_MODEL               (선택) 기본값 claude-sonnet-5-5
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config, loadPosts, renderAll, sanitize, textLength, POSTS_DIR, ROOT } from './render.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const env = process.env;
const LOG_FILE = path.join(ROOT, '_guide', 'log.json');
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // KST
const daysAgo = (n) => new Date(Date.now() + 9 * 3600e3 - n * 86400e3).toISOString().slice(0, 10);
const norm = (s) => String(s).toLowerCase().replace(/[\s\-·,.?!'"()]/g, '');
const tokens = (s) => String(s).toLowerCase().split(/[\s,·]+/).filter((t) => t.length >= 2);

// ---------------- Google Search Console ----------------
async function gscToken() {
  const sa = JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON);
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('서치콘솔 인증 실패: ' + JSON.stringify(j));
  return j.access_token;
}

async function gscQuery(token, dimensions, rowLimit = 5000) {
  const site = env.GSC_SITE_URL || 'sc-domain:ecl.ai.kr';
  const lb = config.gsc.lookbackDays;
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    // 서치콘솔 데이터는 2~3일 늦게 들어오므로 3일 전까지만 조회
    body: JSON.stringify({ startDate: daysAgo(lb + 3), endDate: daysAgo(3), dimensions, rowLimit, dataState: 'final' }),
  });
  const j = await res.json();
  if (j.error) throw new Error(`서치콘솔 조회 실패 (${site}): ${j.error.message}`);
  return j.rows || [];
}

const REGIONS = config.regionTokens || [];
const regionsOf = (s) => REGIONS.filter((r) => String(s).includes(r)).map((r) => r.replace(/시$/, ''));
function isCovered(query, posts) {
  const q = norm(query);
  const qt = tokens(query);
  const qr = new Set(regionsOf(query));
  for (const p of posts) {
    for (const k of [p.keyword, ...(p.keywords || [])].filter(Boolean)) {
      if (norm(k) === q) return p.slug;
      // 지역이 다르면 다른 검색어로 본다 (예: '후불제 상조' vs '파주 후불제 상조')
      const kr = new Set(regionsOf(k));
      if (qr.size !== kr.size || [...qr].some((r) => !kr.has(r))) continue;
      const kt = tokens(k);
      const inter = qt.filter((t) => kt.includes(t)).length;
      const union = new Set([...qt, ...kt]).size;
      if (union && inter / union >= 0.6) return p.slug;
    }
  }
  return null;
}

/** 노출은 많은데 클릭이 거의 없는 검색어 = 빈칸 */
function findGaps(rows, posts) {
  const g = config.gsc;
  const byQuery = new Map();
  for (const r of rows) {
    const [query] = r.keys;
    const a = byQuery.get(query) || { query, impressions: 0, clicks: 0, posSum: 0 };
    a.impressions += r.impressions;
    a.clicks += r.clicks;
    a.posSum += r.position * r.impressions;
    byQuery.set(query, a);
  }
  return [...byQuery.values()]
    .map((a) => ({ ...a, ctr: a.clicks / a.impressions, position: a.posSum / a.impressions }))
    .filter(
      (a) =>
        a.impressions >= g.minImpressions &&
        a.ctr <= g.maxCtr &&
        a.position >= g.minPosition &&
        a.position <= g.maxPosition &&
        !g.excludeContains.some((x) => a.query.includes(x)) &&
        !isCovered(a.query, posts)
    )
    // 노출이 많을수록, 순위가 2페이지 근처일수록 기회가 큼
    .map((a) => ({ ...a, score: a.impressions * (1 - a.ctr) * (a.position <= 20 ? 1.2 : 0.8) }))
    .sort((x, y) => y.score - x.score);
}

// ---------------- Claude ----------------
async function claude(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env.CLAUDE_MODEL || 'claude-sonnet-5-5', max_tokens: 12000, system, messages: [{ role: 'user', content: user }] }),
  });
  const j = await res.json();
  if (j.error) throw new Error('Claude API 오류: ' + j.error.message);
  return j.content.map((c) => c.text || '').join('');
}

function writerPrompt(posts) {
  const S = config.site;
  return `당신은 ${S.brand}(${S.origin})의 "${S.guideTitle}" 전속 작가입니다. 장례·상조·요양을 처음 겪는 50~70대 자녀 세대가 검색으로 들어와 읽는 글을 씁니다.

[회사 정보 — 이 범위 안에서만 회사를 언급]
${config.businessFacts.map((f) => '- ' + f).join('\n')}

[글쓰기 원칙]
1. 검색한 사람의 질문에 첫 섹션에서 바로 답한다. 서론·인사말 금지.
2. 따뜻하지만 군더더기 없는 존댓말. 어려운 장례 용어는 괄호로 풀어 쓴다.
3. 사실 정확성이 최우선이다. 확실하지 않은 금액·통계·법 조항 번호·기관 연락처는 쓰지 않는다. 비용은 "지역·장례식장에 따라 다르다"처럼 범위나 구조로 설명하고, 제도·기한은 확실히 아는 것만 쓰고 "기관에서 최신 기준 확인"을 권한다.
4. 의료·법률 판단은 단정하지 않고 전문가 확인을 권한다. 다른 상조회사·장례식장을 비방하지 않는다.
5. 회사 홍보는 자연스럽게 1~2번만. 과장 표현(최고, 최저가, 100% 등) 금지.
6. 독자가 읽다가 "그래서 우리 집은 얼마지? / 누구에게 물어보지?" 하고 멈출 만한 자리에 CTA 표시를 넣는다. 섹션 html 안에 그대로 [[CTA:quote]] (견적 계산), [[CTA:consult]] (상담), [[CTA:call]] (지금 급한 장례) 중 맞는 것을 문단 사이에 넣는다. 글 전체에서 2~3개.
7. 지역 검색어(예: 고양시·일산·파주 후불제 상조)는 지역 이름만 바꾼 복제 글이 되면 안 된다. 그 지역 사람이 실제로 궁금해할 내용(그 지역에서 장례를 치를 때 장례식장·화장장 이용 흐름, 관내/관외 이용 차이, 이동 거리, 이음케어라이프의 해당 지역 출동·MOU 기관 등)을 담고, 지역 시설 이름·요금은 검색으로 확인된 것만 쓴다. 이미 있는 다른 지역 글과 문단을 겹치지 않게 쓴다.
8. 관련 있는 기존 글이 있으면 본문에 <a href='/guide/슬러그'>글 제목</a> 형태로 1~2개 자연스럽게 링크한다. 기존 글 목록:
${posts.map((p) => `   - /guide/${p.slug} : ${p.title}`).join('\n') || '   (아직 없음)'}

[형식]
- 섹션 5~7개, 본문 합계 공백 포함 3000~5000자.
- 섹션 html에는 p, ul, ol, li, strong, h3, table/thead/tbody/tr/th/td, blockquote, a 태그만 사용. 속성은 a의 href만, 작은따옴표로.
- 핵심 문장 2~4개는 <strong>으로 강조. 비교·기한·비용 구조는 표로 정리하면 좋다.
- 제목은 45자 이내, 검색어를 앞쪽에 자연스럽게 포함하고 클릭하고 싶게(숫자·구체성). 낚시성 금지.
- description은 80~150자, 검색어 포함.
- slug는 영어 소문자와 하이픈만(예: mubinso-funeral-cost).

[그림 — 글마다 2장, 직접 제작]
- 대표 그림(cover)과 설명 그림 1장을 애니메이션 SVG로 직접 그린다. 파일 위치: images/guide/<slug>/cover.svg , images/guide/<slug>/<이름>.svg
- cover: viewBox 0 0 1200 630, 주제를 한눈에 보여주는 따뜻한 플랫 일러스트 + 큰 한글 제목 1줄. 장례 주제는 차분한 톤(국화·촛불·남색·크림색), 사람 얼굴·실제 인물·회사 로고는 그리지 않는다.
- 설명 그림: 절차는 타임라인, 비교는 표/그래프, 기한은 막대 등 본문 핵심을 시각화. viewBox 가로 1200.
- 애니메이션은 SVG 안의 <style> CSS @keyframes로만(스크립트·외부 파일·외부 폰트 금지). 부드럽고 느리게, @media (prefers-reduced-motion:reduce){*{animation:none!important}} 포함.
- 글꼴: font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif. 글자가 도형과 겹치지 않게 배치. 숫자·기한은 본문과 똑같이.
- JSON에 "cover":{"src":"/images/guide/<slug>/cover.svg","alt":"그림 설명"} 를 넣고, 설명 그림은 해당 섹션에 "figure":{"src":"/images/guide/<slug>/<이름>.svg","alt":"","caption":"짧은 설명"} 로 넣는다.
- (API 모드처럼 파일을 만들 수 없으면 cover/figure는 생략한다.)

반드시 아래 JSON 하나만 출력한다. 코드블록·설명 금지.
{"slug":"","title":"","description":"","keyword":"","cover":{"src":"","alt":""},"keywords":["관련 검색어 3~6개"],"category":"상조 비교|장례 절차|장례 비용|사망 후 행정|요양병원|방문요양|장기요양|추모·장지 중 하나","summary":["핵심 요약 3개, 각 60자 이내"],"sections":[{"heading":"","html":"","figure":{"src":"","alt":"","caption":""}}],"faq":[{"q":"","a":""}]}
FAQ는 3~5개, 실제로 사람들이 검색할 법한 질문으로.`;
}

function parseJson(text) {
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('JSON을 찾지 못함');
  return JSON.parse(text.slice(s, e + 1));
}

function validate(post, posts) {
  const errs = [];
  if (!post.title || post.title.length > 60) errs.push('제목 길이');
  if (!post.description || post.description.length < 50) errs.push('설명 길이');
  if (!Array.isArray(post.sections) || post.sections.length < 4) errs.push('섹션 4개 미만');
  if (!Array.isArray(post.faq) || post.faq.length < 2) errs.push('FAQ 부족');
  if (textLength(post) < config.publish.minBodyChars) errs.push(`본문 ${textLength(post)}자 (최소 ${config.publish.minBodyChars})`);
  post.slug = String(post.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  if (post.slug.length < 3) errs.push('slug');
  for (const f of [post.cover, ...(post.sections || []).map((s) => s.figure)].filter((f) => f && f.src)) {
    if (!/^\/images\/guide\/[a-z0-9\-\/]+\.(svg|webp|png|jpg|jpeg|gif)$/.test(f.src)) errs.push(`이미지 경로 형식: ${f.src}`);
    else if (!fs.existsSync(path.join(ROOT, f.src))) errs.push(`이미지 파일 없음: ${f.src}`);
    else if (f.src.endsWith('.svg') && /<script|on[a-z]+\s*=|href\s*=\s*["']https?:/i.test(fs.readFileSync(path.join(ROOT, f.src), 'utf8'))) errs.push(`SVG에 스크립트/외부 링크 금지: ${f.src}`);
  }
  let base = post.slug, n = 2;
  while (posts.some((p) => p.slug === post.slug)) post.slug = `${base}-${n++}`;
  return errs;
}

async function writePost(target, posts) {
  const user = userBrief(target);
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const text = await claude(writerPrompt(posts), attempt === 1 ? user : `${user}\n\n(이전 시도 문제: ${lastErr}. 이 부분을 고쳐 다시 작성)`);
    try {
      const post = parseJson(text);
      const errs = validate(post, posts);
      if (!errs.length) return post;
      lastErr = errs.join(', ');
    } catch (e) {
      lastErr = e.message;
    }
    console.warn(`  ↻ 품질 기준 미달 (${lastErr}) — 재시도 ${attempt}/2`);
  }
  throw new Error('글 생성 실패: ' + lastErr);
}

// ---------------- 공통: 오늘의 검색어 고르기 / 발행 ----------------
async function pickTargets(posts, log) {
  let candidates = [];
  let topGuidePages = [];
  if (opt('--keyword')) return { candidates: [{ query: opt('--keyword'), source: 'manual' }], topGuidePages };
  if (env.GSC_SERVICE_ACCOUNT_JSON) {
    try {
      const token = await gscToken();
      const rows = await gscQuery(token, ['query', 'page']);
      const pages = await gscQuery(token, ['page'], 500);
      topGuidePages = pages
        .filter((r) => r.keys[0].includes(config.site.guidePath + '/'))
        .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
        .map((r) => r.keys[0].replace(/\/$/, '').split('/').pop().replace(/\.html$/, ''));
      candidates = findGaps(rows, posts).map((c) => ({ ...c, source: 'gsc' }));
      console.error(`서치콘솔: 검색어 ${rows.length}행 분석 → 빈칸 후보 ${candidates.length}개`);
    } catch (e) {
      console.error('⚠ 서치콘솔 사용 불가 → 예비 키워드로 진행:', e.message);
    }
  } else {
    console.error('ℹ 서치콘솔 미연결 → 예비 키워드로 진행');
  }
  if (!candidates.length) {
    const used = new Set(log.map((l) => norm(l.keyword)));
    // 사장님이 직접 지정한 키워드: 같은 검색어로 쓴 글이 없으면 무조건 먼저
    const exact = new Set(posts.flatMap((p) => [p.keyword, ...(p.keywords || [])]).filter(Boolean).map(norm));
    const pri = (config.priorityKeywords || []).filter((k) => !used.has(norm(k)) && !exact.has(norm(k))).map((query) => ({ query, source: 'priority' }));
    const seed = config.seedKeywords.filter((k) => !used.has(norm(k)) && !isCovered(k, posts)).map((query) => ({ query, source: 'seed' }));
    candidates = [...pri, ...seed];
  }
  return { candidates, topGuidePages };
}

function userBrief(target) {
  return `오늘 쓸 글의 목표 검색어: "${target.query}"
${target.impressions ? `참고: 이 검색어로 최근 ${config.gsc.lookbackDays}일간 우리 사이트가 ${target.impressions}번 노출됐지만 클릭은 ${target.clicks}번(평균 순위 ${target.position.toFixed(1)}위)뿐이었습니다. 이 검색어를 입력한 사람이 정확히 원하는 답을 주는 전용 글이 필요합니다.` : '예비 키워드 목록에서 고른 검색어입니다.'}
이 검색어를 검색한 사람의 의도를 먼저 파악하고, 그 질문에 가장 잘 답하는 글을 써 주세요.`;
}

/** 검증·내부링크·저장·렌더까지. 실패하면 예외 */
function publishPost(post, target, topGuidePages, log) {
  const all = loadPosts();
  const errs = validate(post, all);
  if (errs.length) throw new Error('품질 기준 미달: ' + errs.join(', '));
  post.publishedAt = today();
  post.keyword = post.keyword || target.query;
  post.keywords = [...new Set([target.query, ...(post.keywords || [])])];
  post.source = 'autopilot';
  if (target.impressions) post.gsc = { impressions: target.impressions, clicks: target.clicks, position: +Number(target.position).toFixed(1) };
  post.sections = post.sections.map((s) => ({ heading: s.heading, html: sanitize(s.html), ...(s.figure && s.figure.src ? { figure: s.figure } : {}) }));
  if (post.cover && !post.cover.src) delete post.cover;
  post.faq = (post.faq || []).map((f) => ({ q: f.q, a: sanitize(f.a) }));

  // 내부 링크: 방문자가 많은 기존 글(서치콘솔 기준, 없으면 최신 글)에서 새 글로 길을 깔아줌
  const sources = [...new Set([...(topGuidePages || []), ...all.map((p) => p.slug)])].filter((s) => all.some((p) => p.slug === s)).slice(0, config.publish.internalLinkSources);
  for (const slug of sources) {
    const f = path.join(POSTS_DIR, `${slug}.json`);
    const p = JSON.parse(fs.readFileSync(f, 'utf8'));
    p.related = [post.slug, ...(p.related || []).filter((s) => s !== post.slug)].slice(0, 4);
    fs.writeFileSync(f, JSON.stringify(p, null, 2) + '\n');
  }
  post.related = sources.slice(0, 2);
  delete post.status;

  fs.writeFileSync(path.join(POSTS_DIR, `${post.slug}.json`), JSON.stringify(post, null, 2) + '\n');
  log.push({ date: today(), keyword: target.query, source: target.source, slug: post.slug, title: post.title, gsc: post.gsc || null, linkedFrom: sources });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2) + '\n');
  const rendered = renderAll();
  console.log(`✓ 발행: ${config.site.origin}${config.site.guidePath}/${post.slug}  ← 링크: ${sources.join(', ') || '없음'} (전체 ${rendered.length}편)`);
  return post;
}

const BRIEF_FILE = path.join(ROOT, '_guide', '.brief.json');

// ---------------- main ----------------
async function main() {
  const posts = loadPosts();
  const log = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : [];

  // [Claude Code 모드 2단계] Claude가 쓴 글 JSON을 받아 발행
  if (opt('--publish')) {
    const brief = fs.existsSync(BRIEF_FILE) ? JSON.parse(fs.readFileSync(BRIEF_FILE, 'utf8')) : { target: { query: '', source: 'manual' }, topGuidePages: [] };
    const post = JSON.parse(fs.readFileSync(opt('--publish'), 'utf8'));
    if (!brief.target.query) brief.target.query = post.keyword || post.title;
    publishPost(post, brief.target, brief.topGuidePages, log);
    fs.rmSync(BRIEF_FILE, { force: true });
    return;
  }

  const { candidates, topGuidePages } = await pickTargets(posts, log);

  if (flag('--report')) {
    console.table(candidates.slice(0, 20).map((c) => ({ 검색어: c.query, 출처: c.source, 노출: c.impressions ?? '', 클릭: c.clicks ?? '', 순위: c.position ? c.position.toFixed(1) : '' })));
    return;
  }
  if (!candidates.length) {
    console.log('오늘 채울 빈칸이 없습니다. 종료.');
    return;
  }

  // [Claude Code 모드 1단계] 오늘의 검색어와 작성 지침을 출력 → Claude가 직접 글을 씀
  if (flag('--brief')) {
    const target = candidates[0];
    fs.writeFileSync(BRIEF_FILE, JSON.stringify({ target, topGuidePages }, null, 2));
    console.log(`=== 오늘의 검색어: ${target.query} (${target.source}) ===\n\n[작성 지침]\n${writerPrompt(posts)}\n\n[오늘의 요청]\n${userBrief(target)}`);
    return;
  }

  const picks = candidates.slice(0, config.publish.postsPerRun);
  if (flag('--dry-run')) {
    console.log('오늘 고른 검색어:', picks);
    return;
  }

  // [API 모드] ANTHROPIC_API_KEY가 있으면 스크립트가 직접 Claude API 호출
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY가 없습니다. Claude Code에서는 --brief / --publish 를 사용하세요.');
  for (const target of picks) {
    console.log(`✎ "${target.query}" 글 작성 중... (${target.source})`);
    const post = await writePost(target, loadPosts());
    delete post.cover;
    post.sections.forEach((x) => delete x.figure);
    publishPost(post, target, topGuidePages, log);
  }
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exit(1);
});
