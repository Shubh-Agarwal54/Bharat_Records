@echo off
echo 🚀 Starting Bharat Records Backend Setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Backend setup complete!
echo.
echo To start the server:
echo   Development mode: npm run dev
echo   Production mode:  npm start
echo.
echo 📚 Check README.md for testing instructions
echo 📖 Check API_DOCUMENTATION.md for API details
echo.
pause
