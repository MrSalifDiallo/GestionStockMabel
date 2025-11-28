@echo off
title Verification Systeme - Mabel

echo.
echo ========================================
echo   VERIFICATION SYSTEME
echo   Gestion Stock Mabel
echo ========================================
echo.

set "errors=0"

echo Verification de Laragon...
if exist "C:\laragon\laragon.exe" (
    echo [OK] Laragon installe
) else (
    echo [ERREUR] Laragon NON installe
    set /a errors+=1
)

echo Verification de PHP...
where php >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PHP trouve
) else (
    echo [ERREUR] PHP non trouve
    set /a errors+=1
)

echo Verification de Composer...
where composer >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Composer trouve
) else (
    echo [ERREUR] Composer non trouve
    set /a errors+=1
)

echo Verification de Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js trouve
) else (
    echo [ERREUR] Node.js non trouve
    set /a errors+=1
)

echo Verification de npm...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm trouve
) else (
    echo [ERREUR] npm non trouve
    set /a errors+=1
)

echo Verification du dossier backend...
if exist "backend" (
    echo [OK] Dossier backend trouve
) else (
    echo [ERREUR] Dossier backend manquant
    set /a errors+=1
)

echo Verification du dossier frontend...
if exist "FrontendReact" (
    echo [OK] Dossier FrontendReact trouve
) else (
    echo [ERREUR] Dossier FrontendReact manquant
    set /a errors+=1
)

echo.
echo ========================================
echo.

if %errors% equ 0 (
    echo SYSTEME PRET !
    echo.
    echo Vous pouvez lancer: installer.bat
) else (
    echo PROBLEMES DETECTES: %errors%
    echo.
    echo Solutions:
    echo 1. Installer Laragon Full
    echo 2. Redemarrer le PC
    echo 3. Relancer cette verification
)

echo.
pause
