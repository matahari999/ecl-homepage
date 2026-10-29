# 블로그 오토파일럿 (ecl.ai.kr/guide)

매일 아침 7시(한국시간)에 **Claude 예약 작업**이 자동으로 실행합니다 (Claude Pro 구독 사용, API 키 불필요).
Claude가 `--brief`로 오늘의 검색어와 작성 지침을 받고 → 직접 글을 쓰고 → `--publish`로 발행한 뒤 main에 푸시합니다.

1. 구글 서치콘솔에서 **노출은 많은데 클릭이 거의 없는 검색어**를 찾음
   (최근 28일 · 노출 30회 이상 · CTR 2% 이하 · 평균 순위 4~40위 · 아직 전용 글 없음)
2. Claude가 그 검색어 전용 안내글을 작성 (견적·상담 버튼 자동 삽입, 품질 기준 미달 시 재작성)
3. 방문자가 많은 기존 가이드 글 3개에 새 글 링크를 걸어 줌
4. `guide/` 페이지·사이트맵·RSS를 다시 만들고 main에 푸시 → GitHub Pages가 바로 게시

서치콘솔이 아직 연결 안 됐거나 빈칸 검색어가 없으면 `config.json`의 `seedKeywords`(예비 키워드)에서 하나씩 씁니다.

## 처음 한 번만 설정

### 1) Claude 예약 작업 (설정 완료)
- claude.ai의 예약 작업 목록에서 "이음케어 가이드 매일 발행"을 끄고 켜거나 시간을 바꿀 수 있습니다.
- (선택) API 키로 돌리고 싶다면 `ANTHROPIC_API_KEY` 환경변수를 넣고 `node _autopilot/run.mjs` 를 실행하면 스크립트가 직접 씁니다.

### 2) 구글 서치콘솔 연결 (빈칸 검색어 찾기용)
1. https://console.cloud.google.com → 새 프로젝트 → **Google Search Console API** 사용 설정
2. IAM 및 관리자 → 서비스 계정 → 만들기 → 키 탭 → **JSON 키 추가** (파일 다운로드됨)
3. https://search.google.com/search-console → ecl.ai.kr 속성 → 설정 → 사용자 및 권한 → 사용자 추가
   - 이메일: 서비스 계정 이메일(`...@...iam.gserviceaccount.com`) / 권한: 제한됨
4. JSON 키 내용을 예약 작업 실행 환경의 `GSC_SERVICE_ACCOUNT_JSON` 환경변수로 넣기 (Claude에게 "서치콘솔 연결해줘"라고 하면 같이 진행)
5. 서치콘솔 속성이 `https://ecl.ai.kr/` (URL 접두어) 형식이면 `GSC_SITE_URL` = `https://ecl.ai.kr/` 도 추가
   (도메인 속성이면 기본값 `sc-domain:ecl.ai.kr` 그대로 두면 됨)

### 3) 사이트맵 제출 (한 번)
- 구글 서치콘솔 → Sitemaps → `guide-sitemap.xml` 제출
- 네이버 서치어드바이저 → 요청 → 사이트맵 제출 → `https://ecl.ai.kr/guide-sitemap.xml`, RSS 제출 → `https://ecl.ai.kr/guide/rss.xml`

## 수동 실행
- Claude에게 "가이드 글 하나 지금 올려줘" 또는 "'무빈소 장례 비용'으로 하나 써줘"

로컬에서:
```bash
node _autopilot/run.mjs --brief              # 오늘의 검색어 + 작성 지침 (Claude Code 모드)
node _autopilot/run.mjs --publish post.json  # 작성된 글 JSON 발행
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
