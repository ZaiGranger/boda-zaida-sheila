# Publicar — ESTADO ACTUAL

## ✅ HECHO

- **GitHub:** https://github.com/ZaiGranger/boda-zaida-sheila
- **Código subido** con URL de Render configurada en `js/config.js`
- **Web funcionando** en internet (túnel temporal Cloudflare)

## ⏳ Falta solo Render (2 clics en el navegador)

Render pide iniciar sesión **en el navegador** (no en terminal). Haz esto:

1. Abre: https://dashboard.render.com/register
2. Pulsa **GitHub** e inicia sesión con tu cuenta **ZaiGranger**
3. Autoriza Render
4. Abre: https://dashboard.render.com/blueprint/new?repo=https://github.com/ZaiGranger/boda-zaida-sheila
5. Pulsa **Apply** (plan Free)
6. Añade variable `ADMIN_PASSWORD` = tu contraseña

URL final: **https://boda-zaida-sheila.onrender.com**

---

## Mientras tanto — URL temporal (gratis)

Ejecuta `tunel-publico.bat` y copia la URL `https://....trycloudflare.com` que aparece.
Funciona mientras el PC esté encendido y la ventana abierta.

---

## Pasos originales (referencia)

---

## Paso 1 — GitHub (2 minutos, una sola vez)

1. Si no tienes cuenta: [github.com/join](https://github.com/join) (gratis)
2. En terminal, en la carpeta del proyecto:

```powershell
gh auth login
```

Elige: GitHub.com → HTTPS → Login with browser → autoriza.

---

## Paso 2 — Ejecutar script automático

```powershell
cd "C:\Users\Zaida\OneDrive - MercadoIT\Escritorio\Z\WEB wedding"
.\publicar.ps1
```

El script:
- Crea el repo `boda-zaida-sheila` en tu GitHub
- Sube todo el código
- Abre Render para conectar el repo (si no tienes API key)

---

## Paso 3 — Render (5 minutos, gratis)

Si el script abre Render automáticamente:

1. Regístrate en [render.com](https://dashboard.render.com/register) (gratis)
2. **New +** → **Web Service**
3. Conecta tu GitHub → elige repo **boda-zaida-sheila**
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Añade variable de entorno:
   - `ADMIN_PASSWORD` = la contraseña que quieras (para admin mesas)
6. **Create Web Service**

Tras ~3 minutos tendrás: `https://boda-zaida-sheila.onrender.com`

---

## Paso 4 — Actualizar URL en el proyecto

Edita `js/config.js`:

```javascript
siteUrl: 'https://boda-zaida-sheila.onrender.com',
```

Luego:

```powershell
git add js/config.js
git -c user.name="Zaida" -c user.email="tu@email.com" commit -m "URL de produccion"
git push
```

Render redesplegará solo.

---

## URLs finales

| Qué | URL |
|-----|-----|
| Invitación (compartir con invitados) | `https://TU-APP.onrender.com/` |
| Admin mesas y QR (solo vosotras) | `https://TU-APP.onrender.com/recuerdos/admin.html` |

---

## Ya instalado en tu PC

- Node.js ✓
- GitHub CLI (`gh`) ✓
- Dependencias npm ✓
- Git con 2 commits listos ✓
