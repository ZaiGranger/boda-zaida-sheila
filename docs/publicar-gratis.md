# Publicar la web GRATIS (sin pagar dominio)

Puedes publicar la invitación **sin comprar dominio**. El hosting te da una URL gratis tipo:

`https://boda-zaida-sheila.onrender.com`

---

## Opción recomendada: Render.com (gratis)

### Requisitos
- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Render](https://render.com) (gratis)

### Pasos

#### 1. Subir el proyecto a GitHub
1. Crea un repositorio nuevo en GitHub (ej: `boda-zaida-sheila`)
2. En la carpeta del proyecto, abre terminal y ejecuta:

```bash
git init
git add .
git commit -m "Web de boda Zaida y Sheila"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/boda-zaida-sheila.git
git push -u origin main
```

> **Importante:** El archivo `.gitignore` ya excluye `uploads/` y `data/` para no subir fotos privadas.

#### 2. Crear el servicio en Render
1. Entra en [render.com](https://render.com) → **New +** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name:** `boda-zaida-sheila` (o el que quieras)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. En **Environment Variables** añade:
   - `ADMIN_PASSWORD` = una contraseña segura (para gestionar mesas y ver galería)
   - `NODE_VERSION` = `20` (opcional)

5. Pulsa **Create Web Service**

#### 3. Obtener tu URL gratis
Tras unos minutos tendrás una URL como:

`https://boda-zaida-sheila.onrender.com`

#### 4. Configurar la URL en el proyecto
Edita `js/config.js` y pon:

```javascript
siteUrl: 'https://boda-zaida-sheila.onrender.com',
```

Haz commit y push. Render redesplegará solo.

---

## URLs de tu web

| Qué | URL |
|-----|-----|
| Invitación (invitados) | `https://tu-app.onrender.com/` |
| Admin mesas y QR (solo vosotras) | `https://tu-app.onrender.com/recuerdos/admin.html` |
| Subir fotos (solo vía QR) | `https://tu-app.onrender.com/recuerdos/subir.html?mesa=...&t=...` |

---

## Cómo funcionan los QR por mesa

1. Entrad en **recuerdos/admin.html** con la contraseña
2. Creáis las mesas (ej: 15 mesas automáticas)
3. Descargáis el QR de cada mesa e imprimís uno por mesa
4. Los invitados escanean → solo pueden subir/ver **sus** fotos
5. Vosotras veis **todo** en galería admin

---

## Limitaciones del plan gratis de Render

- **El servidor se duerme** tras ~15 min sin visitas. La primera carga puede tardar 30–60 segundos.
- **Las fotos subidas** se guardan en disco del servidor. Si Render reinicia el servicio, **pueden perderse**. Para la boda en un día concreto suele valer; después descargad la galería desde admin.

### Consejo para el día de la boda
- Probad los QR antes del evento
- Tened el admin abierto en el móvil por si hay que regenerar un QR

---

## Otras opciones gratis (sin dominio)

| Plataforma | URL gratis | Notas |
|------------|------------|-------|
| [Render](https://render.com) | `.onrender.com` | Recomendada, fácil con Node |
| [Railway](https://railway.app) | `.up.railway.app` | Créditos gratis limitados |
| [Fly.io](https://fly.io) | `.fly.dev` | Requiere tarjeta para verificar (no cobran si no pasas límites) |

---

## ¿Y un dominio propio?

No es obligatorio. Si más adelante queréis `www.zaidaysheila.com`, podéis comprarlo (~10 €/año) y conectarlo en Render. Hasta entonces, la URL `.onrender.com` funciona perfectamente para compartir con invitados.
