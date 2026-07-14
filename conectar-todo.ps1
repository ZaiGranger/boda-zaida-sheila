# =============================================================================
# CONECTAR TODO — Render + Spotify + despliegue automático
# Ejecutar: .\conectar-todo.ps1
# =============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Conectar boda-zaida-sheila" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# --- 1. Render ---
Write-Host "[1/4] Render — inicia sesion con GitHub" -ForegroundColor Cyan
Write-Host "      Luego: servicio boda-zaida-sheila -> Manual Deploy -> Deploy latest commit" -ForegroundColor Gray
Start-Process "https://dashboard.render.com/login"
Start-Sleep -Seconds 2

# --- 2. Spotify playlist ---
Write-Host "[2/4] Spotify — crea playlist colaborativa" -ForegroundColor Cyan
Write-Host "      Nombre: Boda Zaida y Sheila -> Hacer colaborativa -> Copiar enlace" -ForegroundColor Gray
Start-Process "https://accounts.spotify.com/login?continue=https%3A%2F%2Fopen.spotify.com%2Fcollection%2Fplaylists"

# --- 3. Pedir URL playlist ---
Write-Host ""
$playlistUrl = Read-Host "[3/4] Pega aqui el enlace de la playlist de Spotify (o Enter para omitir)"

if ($playlistUrl.Trim()) {
    # Guardar en config.js local
    $configPath = Join-Path $PSScriptRoot "js\config.js"
    $content = Get-Content $configPath -Raw -Encoding UTF8
    $content = $content -replace "spotifyPlaylistUrl:\s*'[^']*'", "spotifyPlaylistUrl: '$($playlistUrl.Trim())'"
    Set-Content $configPath $content -Encoding UTF8 -NoNewline
    Write-Host "      URL guardada en js/config.js" -ForegroundColor Green

    Write-Host ""
    Write-Host "      En Render -> Environment anade:" -ForegroundColor Yellow
    Write-Host "      SPOTIFY_PLAYLIST_URL = $playlistUrl" -ForegroundColor White
    Write-Host "      SPOTIFY_PLAYLIST_TITLE = Playlist boda Zaida y Sheila" -ForegroundColor White
}

# --- 4. Deploy hook (opcional) ---
Write-Host ""
Write-Host "[4/4] Auto-deploy en cada push (opcional)" -ForegroundColor Cyan
Write-Host "      Render -> Settings -> Deploy Hook -> copiar URL" -ForegroundColor Gray
Write-Host "      GitHub -> repo -> Settings -> Secrets -> RENDER_DEPLOY_HOOK" -ForegroundColor Gray

$hook = Read-Host "      Pega el Deploy Hook (o Enter para omitir)"
if ($hook.Trim()) {
    gh secret set RENDER_DEPLOY_HOOK --body $hook.Trim() --repo ZaiGranger/boda-zaida-sheila
    Write-Host "      Secret RENDER_DEPLOY_HOOK guardado en GitHub" -ForegroundColor Green
}

# --- Subir cambios si hay playlist ---
if ($playlistUrl.Trim()) {
    Write-Host ""
    Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Yellow
    Set-Location $PSScriptRoot
    git add js/config.js
    git -c user.email="ZaiGranger@users.noreply.github.com" -c user.name="ZaiGranger" commit -m "Configurar URL playlist Spotify" 2>$null
    git push origin main
    Write-Host "Push completado. Render debe redesplegar en 2-3 min." -ForegroundColor Green
}

Write-Host ""
Write-Host "Web: https://boda-zaida-sheila.onrender.com" -ForegroundColor Cyan
Write-Host ""
