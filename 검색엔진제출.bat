@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo  ===== 검색엔진 제출 (네이버 서치어드바이저 / Bing / IndexNow) =====
echo  처음 한 번은 열리는 엣지 창에서 네이버에 직접 로그인해 주세요.
echo.
git pull
if not exist node_modules\playwright-core call npm install
call npm run seo:submit -- %*
echo.
pause
