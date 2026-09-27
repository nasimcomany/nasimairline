@echo off
REM Start backend (:8000) + frontend live (:3000) together.
REM Open either http://127.0.0.1:3000 or http://127.0.0.1:8000 — UI stays live without npm run build.

cd /d "%~dp0"

start "Nasim Django :8000" cmd /k "call venv\Scripts\activate.bat && python manage.py runserver 8000"
timeout /t 2 /nobreak >nul
start "Nasim React :3000" cmd /k "cd frontend && npm start"

echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:3000  (hot reload)
echo Opening :8000 redirects to :3000 while npm start is running.
echo.
