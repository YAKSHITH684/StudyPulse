@echo off
title StudyPulse - Early Warning System
echo ========================================================
echo   STUDYPULSE - AI Early-Warning System for Student Dropout
echo   PRASUNEX INNOVATHON 2026 - Round 3
echo ========================================================
echo.

REM Set PATH to include local tools if present
set "PATH=%~dp0.tools\nodejs;%PATH%"

echo [1/3] Checking Database and Model Seed...
if not exist "studypulse.db" (
    echo Seeding synthetic school database and training XGBoost model...
    python backend\seed_data.py
)

echo [2/3] Starting FastAPI Backend on http://localhost:8000 ...
start "StudyPulse Backend" cmd /k "set PYTHONPATH=backend&& python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [3/3] Starting React Frontend on http://localhost:5173 ...
start "StudyPulse Frontend" cmd /k "cd frontend&& npm run dev"

echo.
echo ========================================================
echo   StudyPulse is launching!
echo   Frontend: http://localhost:5173
echo   Backend Docs: http://localhost:8000/docs
echo.
echo   Demo Logins:
echo     Admin:   admin@studypulse.edu   / Admin@123
echo     Teacher: teacher@studypulse.edu / Teacher@123
echo     Parent:  parent@studypulse.edu  / Parent@123
echo ========================================================
pause
