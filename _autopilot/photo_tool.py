#!/usr/bin/env python3
"""사례 글 사진 도구 (Pillow)
  python3 _autopilot/photo_tool.py sheet /tmp/naver/<logNo>
      → /tmp/naver/<logNo>/sheet.jpg (번호·크기 표시된 미리보기). Read로 직접 보고 고를 것
  python3 _autopilot/photo_tool.py crop <원본.jpg> <출력.webp> <x0> <y0> <x1> <y1> <가로px> [blur x0,y0,x1,y1 ...]
      → 자르기 + (선택) 모자이크 영역 + 리사이즈 + 샤픈 → webp 저장. blur 좌표는 '원본' 기준
  python3 _autopilot/photo_tool.py tiles <원본.jpg>
      → 여러 장이 이어붙은 콜라주인지 확인용: 세로/가로 여백 라인 좌표 추정 출력
"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
a = sys.argv[1:]
if not a: print(__doc__); sys.exit()
if a[0] == 'sheet':
    d = a[1]; fs = sorted(glob.glob(os.path.join(d, 'img*.jpg')))
    W, H = 480, 380; cols = 3; rows = (len(fs) + cols - 1) // cols or 1
    s = Image.new('RGB', (W * cols, H * rows), 'white')
    for i, f in enumerate(fs):
        im = Image.open(f).convert('RGB'); sz = im.size; im.thumbnail((W, H - 22))
        c = Image.new('RGB', (W, H), 'white'); c.paste(im, (0, 22))
        ImageDraw.Draw(c).text((4, 4), f"{os.path.basename(f)} {sz[0]}x{sz[1]}", fill='black')
        s.paste(c, ((i % cols) * W, (i // cols) * H))
    out = os.path.join(d, 'sheet.jpg'); s.save(out, quality=85); print(out)
elif a[0] == 'crop':
    src, out = a[1], a[2]; x0, y0, x1, y1, w = map(int, a[3:8])
    im = Image.open(src).convert('RGB')
    if len(a) > 8 and a[8] == 'blur':
        for b in a[9:]:
            bx = tuple(map(int, b.split(','))); reg = im.crop(bx)
            reg = reg.resize((max(1, reg.width // 12), max(1, reg.height // 12)), Image.BILINEAR).resize(reg.size, Image.NEAREST).filter(ImageFilter.GaussianBlur(6))
            im.paste(reg, bx)
    im = im.crop((x0, y0, x1, y1))
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im = ImageEnhance.Contrast(im.filter(ImageFilter.UnsharpMask(1.2, 60, 2))).enhance(1.04)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, 'WEBP', quality=82, method=6); print(out, im.size, os.path.getsize(out) // 1024, 'KB')
elif a[0] == 'tiles':
    im = Image.open(a[1]).convert('L'); W, H = im.size; px = im.load()
    light = lambda vals: sum(v > 235 for v in vals) / len(vals) > .97
    cols = [x for x in range(W) if light([px[x, y] for y in range(0, H, 3)])]
    rows = [y for y in range(H) if light([px[x, y] for x in range(0, W, 3)])]
    print('여백 세로선 x:', cols[:60]); print('여백 가로선 y:', rows[:60])
