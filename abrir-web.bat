@echo off
echo ========================================
echo   Web de Boda - Zaida y Sheila
echo ========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js no esta instalado.
    echo.
    echo Puedes ver la invitacion abriendo index.html en el navegador.
    echo Para subir fotos, galeria y juego necesitas instalar Node.js:
    echo https://nodejs.org
    echo.
    pause
    start index.html
    exit /b
)

if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Abriendo la web en http://localhost:3001
echo Pulsa Ctrl+C para cerrar el servidor.
echo.
start http://localhost:3001
node server/index.js
