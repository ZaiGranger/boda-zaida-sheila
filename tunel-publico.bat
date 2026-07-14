@echo off
echo Iniciando web de boda + tunel publico gratuito...
echo.
echo IMPORTANTE: Mantén esta ventana abierta mientras quieras que la web este online.
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js no encontrado.
    pause
    exit /b 1
)

cd /d "%~dp0"

if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

start "Servidor boda" cmd /k "npm start"
timeout /t 3 /nobreak >nul

where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo cloudflared no instalado. La web solo estara en http://localhost:3001
    pause
    exit /b
)

echo.
echo Buscando URL publica...
cloudflared tunnel --url http://localhost:3001
