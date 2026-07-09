@echo off
chcp 65001 > nul
echo.
echo  ===================================
echo   이음케어라이프 홈페이지 배포
echo  ===================================
echo.

cd /d "%~dp0"

:: git 설치 확인
where git >nul 2>nul
if errorlevel 1 (
    echo  [오류] git 명령을 찾을 수 없습니다. Git이 설치되어 있는지 확인해 주세요.
    pause
    exit /b 1
)

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
git add -A
if errorlevel 1 (
    echo  [오류] git add 실패. 이 폴더가 git 저장소가 맞는지 확인해 주세요.
    pause
    exit /b 1
)
echo        완료!

:: git commit
echo  [3/4] 커밋 중...
git commit -m "update: 이음케어라이프 업데이트 %date% %time%"
echo        (변경 사항이 없으면 커밋이 생략됩니다)

:: git push
echo  [4/4] 서버에 업로드 중..