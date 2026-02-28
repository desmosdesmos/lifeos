@echo off
echo ============================================
echo   Life OS - Деплой на GitHub
echo ============================================
echo.
echo Введите ваш GitHub username:
set /p GITHUB_USER=

echo.
echo Создание remote origin...
git remote add origin https://github.com/%GITHUB_USER%/life-os.git

echo.
echo Пуш в GitHub...
git push -u origin main

echo.
echo ============================================
echo   Готово! Код загружен на GitHub.
echo ============================================
echo.
echo Следующие шаги:
echo 1. Деплой frontend: cd frontend ^&^& vercel --prod
echo 2. Деплой backend: cd backend ^&^& railway up
echo.
echo Откройте START_HERE.md для подробных инструкций.
echo.
pause
