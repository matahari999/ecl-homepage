# 블로그 오토파일럿 (ecl.ai.kr/guide)

매일 아침 7시(한국시간)에 GitHub이 자동으로 실행합니다.

1. 구글 서치콘솔에서 **노출은 많은데 클릭이 거의 없는 검색어**를 찾음
   (최근 28일 · 노출 30회 이상 · CTR 2% 이하 · 평균 순위 4~40위 · 아직 전용 글 없음)
2. Claude가 그 검색어 전용 안내글을 작성 (견적·상담 버튼 자동 삽입, 품질 기준 미달 시 재작성)
3. 방문자가 많은 기존 가이드 글 3개에 새 글 링크를 걸어 줌
4. `guide/` 페이지·사이트맵·RSS를 다시 만들고 커밋 → GitHub Pages가 바로 게시

서치콘솔이 아직 연결 안 됐거나 빈칸 검색어가 없으면 `config.json`의 `seedKeywords`(예비 키워드)에서 하나씩 씁니다.

## 처음 한 번만 설정

### 1) Claude API 키 (필수)
- https://console.anthropic.com → API Keys → 새 키 발급
- GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret**
  - 이름: `ANTHROPIC_API_KEY` / 값: 발급받은 키

### 2) 구글 서치콘솔 연결 (빈칸 검색어 찾기용)
1. https://console.cloud.google.com → 새 프로젝트 → **Google Search Console API** 사용 설정
2. IAM 및 관리자 → 서비스 계정 → 만들기 → 키 탭 → **JSON 키 추가** (파일 다운로드됨)
3. https://search.google.com/search-console → ecl.ai.kr 속성 → 설정 → 사용자 및 권한 → 사용자 추가
   - 이메일: 서비스 계정 이메일(`...@...iam.gserviceaccount.com`) / 권한: 제한됨
4. GitHub Secret 추가: 이름 `GSC_SERVICE_ACCOUNT_JSON` / 값: JSON 파일 내용 전체 붙여넣기
5. 서치콘솔 속성이 `https://ecl.ai.kr/` (URL 접두어) 형식이면 GitHub **Variables** 탭에 `GSC_SITE_URL` = `https://ecl.ai.kr/` 추가
   (도메인 속성이면 기본값 `sc-domain:ecl.ai.kr` 그대로 두면 됨)

### 3) 사이트맵 제출 (한 번)
- 구글 서치콘솔 → Sitemaps → `guide-sitemap.xml` 제출
- 네이버 서치어드바이저 → 요청 → 사이트맵 제출 → `https://ecl.ai.kr/guide-sitemap.xml`, RSS 제출 → `https://ecl.ai.kr/guide/rss.xml`

## 수동 실행
- GitHub → **Actions → 블로그 오토파일럿 → Run workflow**
  - 검색어 칸을 비우면 자동 선택, 입력하면 그 검색어로 바로 한 편 작성

로컬에서:
```bash
node _autopilot/run.mjs --dry-run            # 오늘 어떤 검색어를 고를지만 확인
node _autopilot/run.mjs --report             # 서치콘솔 빈칸 검색어 상위 20개 표
node _autopilot/run.mjs --keyword "무빈소 장례 비용"
node _autopilot/render.mjs                   # 글 JSON 수정 후 페이지만 다시 생성
```

## 글 고치기·내리기
- 글 원본은 `_guide/posts/<slug>.json` 입니다. 내용을 고친 뒤 `node _autopilot/render.mjs` 실행 후 배포.
- 잠시 내리려면 그 JSON에 `"status": "draft"` 추가 → 렌더 → 배포.
- 발행 기록은 `_guide/log.json` 에 남습니다 (어떤 검색어, 노출·클릭 수치, 어디서 링크했는지).

## 조정할 수 있는 값 (`config.json`)
- `gsc.minImpressions` 등: 빈칸 기준
- `publish.postsPerRun`: 하루 몇 편 (권장 1편)
- `seedKeywords`: 서치콘솔 데이터가 쌓이기 전 쓸 예비 키워드
- `businessFacts`: Claude가 회사를 언급할 때 쓰는 사실 (이 범위 밖 내용은 쓰지 않도록 지시됨)
