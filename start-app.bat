@echo off
echo ===================================================
echo 🚀 Starting Store Rating Portal (Backend + Frontend)
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Express Backend API on port 5000...
start "Store Rating Backend API" cmd /k "cd backend && npm run start"

echo [2/2] Launching React Vite Frontend on port 5173...
start "Store Rating React App" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo 🌟 Both servers started!
echo 🌐 Frontend: http://localhost:5173
echo 📡 Backend API: http://localhost:5000
echo ===================================================
timeout /t 5 >nul
start http://localhost:5173
