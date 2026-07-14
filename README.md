# Web de Boda — Zaida & Sheila

Invitación digital para el **4 de septiembre de 2027** en Valencia.

## Inicio rápido (local)

```bash
npm install
npm start
```

- Invitación: http://localhost:3001
- Admin mesas/QR: http://localhost:3001/recuerdos/admin.html

**Contraseña admin por defecto:** `ZaidaSheila2027`

## Recuerdos por mesa (QR)

- Cada **mesa** tiene un QR único
- Los invitados **solo acceden escaneando el QR** de su mesa
- Cada persona **solo ve las fotos que sube**
- **Vosotras** veis todo en el panel admin

### Panel admin (solo novias)
`/recuerdos/admin.html` → crear mesas → descargar QR → imprimir uno por mesa

## Publicar GRATIS (sin dominio)

Guía completa: **[docs/publicar-gratis.md](docs/publicar-gratis.md)**

Resumen: sube el proyecto a GitHub y despliega en [Render.com](https://render.com) (plan free). Obtendrás una URL gratis como `https://boda-zaida-sheila.onrender.com`.

Después pon esa URL en `js/config.js` → `siteUrl`.

## Configuración

Edita `js/config.js`: WhatsApp, foto (`images/couple.jpg`), `siteUrl` al publicar.
