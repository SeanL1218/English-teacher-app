@echo off
echo ================================
echo  Chloe AI English Teacher App
echo ================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
  echo [!] backend\.env not found.
  echo     Copying .env.example to .env...
  copy backend\.env.example backend\.env
  echo     Please edit backend\.env and add your ANTHROPIC_API_KEY, then run again.
  pause
  exit /b 1
)

echo [1/2] Starting backend server...
start "Chloe Backend" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak > nul

echo [2/2] Starting frontend dev server...
start "Chloe Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo [OK] App is starting!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
pause