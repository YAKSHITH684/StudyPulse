# StudyPulse Launch Script for Windows PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  STUDYPULSE - AI Early-Warning System for Student Dropout" -ForegroundColor Cyan
Write-Host "  PRASUNEX INNOVATHON 2026 - Round 3" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH = "$PSScriptRoot\.tools\nodejs;$env:PATH"

# 1. Check database and model artifacts
if (-not (Test-Path "$PSScriptRoot\studypulse.db")) {
    Write-Host "[1/3] Seeding database & training XGBoost model..." -ForegroundColor Yellow
    $env:PYTHONPATH = "backend"
    python backend\seed_data.py
} else {
    Write-Host "[1/3] Database and model already initialized." -ForegroundColor Green
}

# 2. Start Backend
Write-Host "[2/3] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; `$env:PYTHONPATH = 'backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 3. Start Frontend
Write-Host "[3/3] Starting React Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:PATH = '$PSScriptRoot\.tools\nodejs;' + `$env:PATH; npm run dev"

Write-Host ""
Write-Host "StudyPulse is now running!" -ForegroundColor Green
Write-Host "  Frontend Dashboard : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API Docs   : http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Admin   : admin@studypulse.edu   / Admin@123"
Write-Host "  Teacher : teacher@studypulse.edu / Teacher@123 (Grade 10, Sec A&B)"
Write-Host "  Parent  : parent@studypulse.edu  / Parent@123  (Linked: STU-1004 Aryan Rao)"
