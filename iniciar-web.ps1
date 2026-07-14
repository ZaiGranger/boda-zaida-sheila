# =============================================================================
# INICIAR WEB DE BODA — PowerShell
# Arranca el servidor local sin depender de que "npm" esté en el PATH.
# Doble clic: clic derecho → "Ejecutar con PowerShell"
# O desde PowerShell: .\iniciar-web.ps1
# =============================================================================

# Refresca el PATH (útil si instalaste Node después de abrir PowerShell)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

$nodeExe = "C:\Program Files\nodejs\node.exe"
$npmCmd  = "C:\Program Files\nodejs\npm.cmd"

# Ir a la carpeta del proyecto (donde está este script)
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Web de Boda - Zaida y Sheila" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Comprobar Node.js
if (-not (Test-Path $nodeExe)) {
    Write-Host "Node.js no encontrado en: $nodeExe" -ForegroundColor Red
    Write-Host "Instálalo desde https://nodejs.org y vuelve a intentarlo." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Mientras tanto puedes abrir index.html directamente en el navegador" -ForegroundColor Gray
    Write-Host "(sin Spotify, subir fotos ni juego)." -ForegroundColor Gray
    pause
    exit 1
}

# Instalar dependencias si faltan
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias (solo la primera vez)..." -ForegroundColor Cyan
    if (Test-Path $npmCmd) {
        & $npmCmd install
    } else {
        Write-Host "npm no encontrado. Ejecuta: node server/index.js" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Abriendo http://localhost:3001" -ForegroundColor Cyan
Write-Host "Para cerrar el servidor: Ctrl + C" -ForegroundColor Gray
Write-Host ""

Start-Process "http://localhost:3001"

# Arrancar servidor (equivalente a npm start)
& $nodeExe server/index.js
