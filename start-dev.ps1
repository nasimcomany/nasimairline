# Start Django (:8000) + React live (:3000)
# Open http://127.0.0.1:3000 OR http://127.0.0.1:8000 — no npm run build needed for UI changes.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; .\venv\Scripts\Activate.ps1; python manage.py runserver 8000"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm start"

Write-Host "Backend:  http://127.0.0.1:8000"
Write-Host "Frontend: http://127.0.0.1:3000 (hot reload)"
Write-Host "While npm start is running, :8000 SPA pages redirect to :3000."
