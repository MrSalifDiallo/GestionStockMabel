@echo off
title Installation - Gestion Stock Mabel

echo.
echo ========================================
echo   INSTALLATION - GESTION STOCK MABEL
echo ========================================
echo.

REM Vérifier si on est dans le bon répertoire
if not exist "backend" (
    echo ❌ ERREUR: Ce script doit être exécuté depuis le dossier MabelProject
    echo.
    pause
    exit /b 1
)

echo [ÉTAPE 1/6] Vérification de l'environnement...
echo.

REM Vérifier Composer
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo ERREUR: Composer non trouve
    echo Installez Laragon Full
    pause
    exit /b 1
)
echo [OK] Composer

REM Vérifier Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERREUR: Node.js non trouve
    echo Installez Laragon Full
    pause
    exit /b 1
)
echo [OK] Node.js

REM Vérifier PHP
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo ERREUR: PHP non trouve
    echo Installez Laragon Full
    pause
    exit /b 1
)
echo [OK] PHP
echo.

echo ========================================
echo Installation du Backend...
echo ========================================
echo.

cd backend

REM Créer le fichier .env s'il n'existe pas
if not exist ".env" (
    echo Creation du fichier .env...
    copy .env.example .env > nul
)

echo Installation des dependances PHP...
call composer install --no-interaction --prefer-dist
if %errorlevel% neq 0 (
    echo ERREUR lors de l'installation
    pause
    exit /b 1
)

echo Generation de la cle...
php artisan key:generate --force

echo.
echo ========================================
echo Configuration de la Base de Donnees
echo ========================================
echo.
echo IMPORTANT: Verifiez que MySQL est demarre dans Laragon !
pause

echo Creation des tables...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo ERREUR: Verifiez que MySQL est demarre
    pause
    exit /b 1
)

echo Creation de l'utilisateur admin...
php artisan db:seed --class=UserSeeder --force

cd ..

echo.
echo ========================================
echo Installation du Frontend...
echo ========================================
echo.

cd FrontendReact
echo Installation des dependances (peut prendre 3-5 min)...
call npm install
if %errorlevel% neq 0 (
    echo ERREUR lors de l'installation
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   INSTALLATION TERMINEE !
echo.
echo   Prochaines etapes:
echo   1. Lancez Laragon
echo   2. Double-clic: demarrer-mabel.bat
echo   3. Connectez-vous:
echo      Email: admin@mabel.sn
echo      Mot de passe: password123
echo ========================================
echo.
pause
