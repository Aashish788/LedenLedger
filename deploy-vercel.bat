@echo off
REM ============================================================================
REM VERCEL DEPLOYMENT SCRIPT - FIX SPA ROUTING (Windows)
REM ============================================================================
REM This script deploys your app to Vercel with the routing fix
REM ============================================================================

echo.
echo ============================================
echo    Lenden Ledger - Vercel Deployment
echo ============================================
echo.

REM Step 1: Check if vercel.json exists
echo [Step 1] Checking vercel.json...
if exist vercel.json (
    echo [OK] vercel.json found
) else (
    echo [ERROR] vercel.json not found
    echo Please ensure vercel.json exists in the root directory
    pause
    exit /b 1
)

REM Step 2: Check git status
echo.
echo [Step 2] Checking git repository...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git repository detected
) else (
    echo [ERROR] Not a git repository
    pause
    exit /b 1
)

REM Step 3: Show uncommitted changes
echo.
echo [Step 3] Checking for uncommitted changes...
git status -s
echo.

REM Step 4: Ask to commit
set /p commit="Do you want to commit and push changes? (y/n): "
if /i "%commit%"=="y" (
    echo.
    echo Staging all changes...
    git add .
    
    set /p message="Enter commit message: "
    git commit -m "%message%"
    
    echo.
    echo Pushing to main branch...
    git push origin main
    
    if %errorlevel% equ 0 (
        echo [OK] Successfully pushed to main
    ) else (
        echo [ERROR] Failed to push
        pause
        exit /b 1
    )
) else (
    echo Skipping commit and push
)

REM Step 5: Test build (optional)
echo.
set /p build="Do you want to test build locally? (y/n): "
if /i "%build%"=="y" (
    echo.
    echo Building project...
    call npm run build
    
    if %errorlevel% equ 0 (
        echo [OK] Build successful
    ) else (
        echo [ERROR] Build failed
        echo Please fix build errors before deploying
        pause
        exit /b 1
    )
)

REM Step 6: Summary
echo.
echo ============================================
echo    Deployment Process Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Wait for Vercel to auto-deploy (2-3 minutes)
echo 2. Check Vercel dashboard for deployment status
echo 3. Test your routes:
echo    - https://your-app.vercel.app/customers
echo    - https://your-app.vercel.app/staff
echo    - https://your-app.vercel.app/dashboard
echo.
echo All routes should now work!
echo.

REM Open Vercel dashboard
set /p open="Open Vercel dashboard in browser? (y/n): "
if /i "%open%"=="y" (
    start https://vercel.com/dashboard
)

echo.
echo Done!
pause
