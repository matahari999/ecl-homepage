#!/usr/bin/env python3
"""네이버 블로그 원문 + 사진 내려받기 (사례 글 재작성용, 표준 라이브러리만 사용)
사용법:
  python3 _autopilot/naver_fetch.py next            다음 대기 글 (기본 2편)
  python3 _autopilot/naver_fetch.py <logNo>         /tmp/naver/<logNo>/text.txt, img00.jpg ... 저장
  python3 _autopilot/naver_fetch.py done <logNo> <slug>   완료 표시
  python3 _autopilot/naver_fetch.py status          진행 현황
"""
import sys, os, re, json, html, datetime, urllib.request
Q = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'naver-queue.json')
q = json.load(open(Q, encoding='utf8'))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36'}
def save(): open(Q, 'w', encoding='utf8').write(json.dumps(q, ensure_ascii=False, indent=2) + '\n')
def get(u, headers=UA): return urllib.request.urlopen(urllib.request.Request(u, headers=headers), timeout=30).read()
a = sys.argv[1:]
cmd = a[0] if a else ''
if cmd == 'next':
    n = int(a[1]) if len(a) > 1 else q['perRun']
    items = [i for i in q['items'] if i['status'] == 'pending'][:n]
    print('\n'.join(f"{i['logNo']}\t{i['type']}\t{i['title']}" for i in items) or 'NONE')
elif cmd == 'status':
    d = sum(i['status'] == 'done' for i in q['items'])
    print(f"완료 {d} / 전체 {len(q['items'])}")
    for i in q['items']:
        print(('✓' if i['status'] == 'done' else '·'), i['logNo'], i['title'], ('→ /guide/' + i['slug']) if i.get('slug') else '')
elif cmd == 'done':
    it = next(i for i in q['items'] if i['logNo'] == a[1])
    it.update(status='done', slug=a[2], date=(datetime.datetime.utcnow() + datetime.timedelta(hours=9)).strftime('%Y-%m-%d'))
    save(); print('✓ 완료 표시', a[1], a[2])
elif cmd.isdigit():
    u = f"https://blog.naver.com/PostView.naver?blogId={q['blogId']}&logNo={cmd}&redirect=Dlog&widgetTypeCall=true&directAccess=false"
    t = get(u).decode('utf8', 'replace')
    body = t[t.find('se-main-container'):]
    e = body.find('wrap_postcomment')
    if e > 0: body = body[:e]
    imgs = list(dict.fromkeys(re.findall(r'data-lazy-src="(https://postfiles[^"]+)"', body)))
    txt = re.sub(r'<script.*?</script>|<style.*?</style>', '', body, flags=re.S)
    txt = html.unescape(re.sub(r'<[^>]+>', '\n', txt)).replace('​', '')
    txt = re.sub(r'\n\s*\n+', '\n', txt)
    d = f'/tmp/naver/{cmd}'; os.makedirs(d, exist_ok=True)
    open(f'{d}/text.txt', 'w', encoding='utf8').write(txt)
    n = 0
    for src in imgs:
        try:
            data = get(re.sub(r'\?type=\w+', '?type=w966', src), {**UA, 'Referer': 'https://blog.naver.com/'})
            open(f'{d}/img{n:02d}.jpg', 'wb').write(data); n += 1
        except Exception as ex:
            print('사진 실패', ex)
    print(f'✓ {d}: 본문 {len(txt)}자, 사진 {n}장')
else:
    print(__doc__)
