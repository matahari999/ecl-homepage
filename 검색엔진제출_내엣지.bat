@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo  ===== 검색엔진 제출 - 평소 쓰는 엣지로 실행 =====
echo  엣지 창을 모두 닫습니다. 열려 있는 탭은 엣지를 다시 열면 복원됩니다.
echo.
pause
taskkill /IM msedge.exe /F >nul 2>nul
timeout /t 2 >nul
git pull
if not exist node_modules\playwright-core call npm install
call npm run seo:submit -- --my-edge %*
echo.
pause
