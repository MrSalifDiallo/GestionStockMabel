@echo off
title Gestion Stock Mabel

echo.
echo ========================================
echo   GESTION DE STOCK MABEL
echo   Demarrage...
echo ========================================
echo.

REM Vérifier si Laragon est installé
if not exist "C:\laragon\laragon.exe" (
    echo ERREUR: Laragon n'est pas installe !
    echo Telecharger depuis: https://laragon.org/download/
    pause
    exit /b 1
)

echo [OK] Laragon detecte

REM Démarrer Laragon
echo Demarrage de Laragon...
start "" "C:\laragon\laragon.exe"
timeout /t 5 /nobreak > nul

REM Vérifier si le projet existe
if not exist "C:\laragon\www\MabelProject\backend" (
    echo ERREUR: Le projet n'est pas dans C:\laragon\www\MabelProject\
    pause
    exit /b 1
)

REM Démarrer le backend Laravel
echo Demarrage du serveur...
start "Backend" /min cmd /k "cd /d C:\laragon\www\MabelProject\backend && php artisan serve"
timeout /t 3 /nobreak > nul

REM Démarrer le frontend React
start "Frontend" /min cmd /k "cd /d C:\laragon\www\MabelProject\FrontendReact && npm run dev"
timeout /t 5 /nobreak > nul

REM Ouvrir le navigateur
start http://localhost:5173

echo.
echo ========================================
echo   APPLICATION DEMARREE !
echo   
echo   Interface: http://localhost:5173
echo   Email: admin@mabel.sn
echo   Mot de passe: password123
echo ========================================
echo.
echo Fermez cette fenetre quand vous avez fini.
pause
