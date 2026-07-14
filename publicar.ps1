# Script de publicación automática — GitHub + Render (gratis)
# Ejecutar: .\publicar.ps1
# Requisito: haber hecho "gh auth login" una vez (el script te guía)

$ErrorActionPreference = "Stop"
$projectDir = $PSScriptRoot
Set-Location $projectDir

# Refrescar PATH (git, gh, node)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Publicar web de boda (GRATIS)" -ForegroundColor Cyan
Write-Host "  GitHub + Render.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Comprobar herramientas ---
foreach ($cmd in @("git", "gh", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Falta $cmd. Instala Git, GitHub CLI y Node.js." -ForegroundColor Red
        exit 1
    }
}

# --- 2. Login GitHub ---
$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Necesitas iniciar sesion en GitHub (solo una vez)." -ForegroundColor Yellow
    Write-Host "Se abrira el navegador. Sigue los pasos y vuelve aqui." -ForegroundColor Yellow
    gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

$ghUser = gh api user -q .login
Write-Host "GitHub: $ghUser" -ForegroundColor Green

# --- 3. Commit local ---
if (-not (Test-Path ".git")) { git init; git branch -M main }

git add .
$status = git status --porcelain
if ($status) {
    git -c user.name="Zaida" -c user.email="zaida@boda.local" commit -m "Web de boda Zaida y Sheila - lista para publicar"
    Write-Host "Commit creado." -ForegroundColor Green
}

# --- 4. Crear repo en GitHub y subir ---
$repoName = "boda-zaida-sheila"
$remoteUrl = "https://github.com/$ghUser/$repoName.git"

$repoExists = gh repo view "$ghUser/$repoName" 2>$null
if (-not $repoExists) {
    Write-Host "Creando repositorio $repoName en GitHub..." -ForegroundColor Yellow
    gh repo create $repoName --public --source=. --remote=origin --push --description "Web invitacion boda Zaida y Sheila 2027"
} else {
    Write-Host "Repositorio ya existe. Subiendo cambios..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $remoteUrl
    git push -u origin main --force
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al subir a GitHub." -ForegroundColor Red
    exit 1
}

Write-Host "Codigo en: https://github.com/$ghUser/$repoName" -ForegroundColor Green

# --- 5. Render CLI ---
$renderExe = "$env:LOCALAPPDATA\render\render.exe"
if (-not (Test-Path $renderExe)) {
    Write-Host "Instalando Render CLI..." -ForegroundColor Yellow
    $zipUrl = "https://github.com/render-oss/cli/releases/download/v1.1.0/cli_1.1.0_windows_amd64.zip"
    $zipPath = "$env:TEMP\render-cli.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
    Expand-Archive -Path $zipPath -DestinationPath "$env:LOCALAPPDATA\render" -Force
    $extracted = Get-ChildItem "$env:LOCALAPPDATA\render" -Filter "render*.exe" -Recurse | Select-Object -First 1
    if ($extracted) { Copy-Item $extracted.FullName $renderExe -Force }
}

if (-not (Test-Path $renderExe)) {
    Write-Host ""
    Write-Host "Render CLI no instalado. Sigue estos pasos MANUALES (5 min):" -ForegroundColor Yellow
    Write-Host "1. Entra en https://dashboard.render.com/register" -ForegroundColor White
    Write-Host "2. New + -> Web Service -> Conecta GitHub -> repo $repoName" -ForegroundColor White
    Write-Host "3. Runtime: Node | Build: npm install | Start: npm start | Plan: Free" -ForegroundColor White
    Write-Host "4. Variable ADMIN_PASSWORD = tu contraseña segura" -ForegroundColor White
    Write-Host "5. Tras desplegar, copia la URL y ponla en js/config.js -> siteUrl" -ForegroundColor White
    Write-Host ""
    Start-Process "https://dashboard.render.com/select-repo?type=web"
    exit 0
}

# --- 6. API key Render ---
if (-not $env:RENDER_API_KEY) {
    Write-Host ""
    Write-Host "Para crear el servicio automaticamente, necesitas una API key de Render:" -ForegroundColor Yellow
    Write-Host "1. Entra en https://dashboard.render.com/u/settings#api-keys" -ForegroundColor White
    Write-Host "2. Crea una API key y ejecuta:" -ForegroundColor White
    Write-Host '   $env:RENDER_API_KEY = "tu-api-key"' -ForegroundColor Cyan
    Write-Host "   .\publicar.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "O conecta el repo manualmente en Render (se abrira el navegador):" -ForegroundColor Yellow
    Start-Process "https://dashboard.render.com/select-repo?type=web"
    exit 0
}

$env:RENDER_API_KEY = $env:RENDER_API_KEY
$repoHttps = "https://github.com/$ghUser/$repoName"

Write-Host "Creando servicio en Render..." -ForegroundColor Yellow
& $renderExe services create `
    --name $repoName `
    --type web_service `
    --runtime node `
    --region frankfurt `
    --plan free `
    --repo $repoHttps `
    --branch main `
    --build-command "npm install" `
    --start-command "npm start" `
    --env-var "ADMIN_PASSWORD=ZaidaSheila2027" `
    --env-var "NODE_VERSION=20" `
    --output json `
    --confirm

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESPLIEGUE INICIADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL (cuando termine, ~3 min):" -ForegroundColor White
Write-Host "  https://$repoName.onrender.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin mesas/QR:" -ForegroundColor White
Write-Host "  https://$repoName.onrender.com/recuerdos/admin.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Actualiza js/config.js con siteUrl y haz git push." -ForegroundColor Yellow
