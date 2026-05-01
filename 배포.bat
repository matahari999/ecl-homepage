@echo off
chcp 65001 > nul
echo.
echo  ===================================
echo   제대군인이음케어라이프 홈페이지 배포
echo  ===================================
echo.

cd /d "%~dp0"

:: index.lock 자동 삭제
if exist ".git\index.lock" (
    echo  [1/4] index.lock 제거 중...
    del /f /q ".git\index.lock"
    echo        완료!
) else (
    echo  [1/4] index.lock 없음 - OK
)

:: git add
echo  [2/4] 변경된 파일 추가 중...
git add index.html sitemap.xml rss.xml robots.txt _headers
echo        완료!

:: git commit
echo  [3/4] 커밋 중...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2% %dt:~8,2%:%dt:~10,2%
git commit -m "update: 홈페이지 업데이트 %TIMESTAMP%"
echo        완료!

:: git push
echo  [4/4] 서버에 업로드 중...
git push
echo.
echo  ===================================
echo   배포 완료! 1~2분 후 반영됩니다.
echo  ===================================
echo.
pause
