-- 이음케어라이프 방문 통계 리포트 (Supabase 프로젝트 ecl-analytics / bxyekukqzmnliwmnrsdj)
-- 최근 7일 vs 그 전 7일, 한국시간 기준
with e as (
  select *, (ts at time zone 'Asia/Seoul') as kst from page_events
),
cur as (select * from e where kst >= (now() at time zone 'Asia/Seoul') - interval '7 days'),
prev as (select * from e where kst >= (now() at time zone 'Asia/Seoul') - interval '14 days' and kst < (now() at time zone 'Asia/Seoul') - interval '7 days')
select jsonb_build_object(
  '최근7일', jsonb_build_object(
    '방문자수', (select count(distinct visitor_id) from cur where event = 'view'),
    '방문횟수', (select count(distinct session_id) from cur where event = 'view'),
    '페이지뷰', (select count(*) from cur where event = 'view'),
    '전화클릭', (select count(*) from cur where event = 'click_call'),
    '카톡클릭', (select count(*) from cur where event = 'click_kakao'),
    '견적클릭', (select count(*) from cur where event = 'click_quote'),
    '상담신청클릭', (select count(*) from cur where event = 'click_consult')
  ),
  '그전7일', jsonb_build_object(
    '방문자수', (select count(distinct visitor_id) from prev where event = 'view'),
    '페이지뷰', (select count(*) from prev where event = 'view'),
    '상담전환클릭', (select count(*) from prev where event like 'click_%')
  ),
  '일별', (select jsonb_agg(x order by d) from (select kst::date d, count(distinct visitor_id) 방문자, count(*) 페이지뷰 from cur where event='view' group by 1) x),
  '많이본페이지', (select jsonb_agg(x) from (select path, count(*) 조회, count(distinct visitor_id) 방문자 from cur where event='view' group by path order by 2 desc limit 10) x),
  '블로그글', (select jsonb_agg(x) from (select path, count(*) 조회, count(distinct visitor_id) 방문자 from cur where event='view' and path like '/guide/%' group by path order by 2 desc limit 15) x),
  '블로그→상담클릭', (select jsonb_agg(x) from (select path, event, count(*) 횟수 from cur where event like 'click_%' and path like '/guide%' group by 1,2 order by 3 desc limit 15) x),
  '유입경로', (select jsonb_agg(x) from (select coalesce(ref, '직접/북마크') 출처, count(*) 방문횟수 from (select session_id, max(referrer_host) ref from cur where event='view' group by session_id) s group by 1 order by 2 desc limit 10) x),
  '기기', (select jsonb_agg(x) from (select device, count(distinct visitor_id) 방문자 from cur where event='view' group by 1) x)
) as report;

-- 내부 링크용: 최근 14일 가장 많이 본 블로그 글 slug (run.mjs --top 에 전달)
-- select string_agg(slug, ',') from (select split_part(path, '/', 3) slug, count(*) c from page_events where event='view' and path like '/guide/%' and ts > now() - interval '14 days' group by 1 order by 2 desc limit 3) t;
