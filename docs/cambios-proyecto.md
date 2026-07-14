# Cambios del proyecto

## 2026-07-14 — QR único por mesa + publicación gratis (feature)

**Archivos:** `recuerdos/`, `js/recuerdos-*.js`, `server/index.js`, `docs/publicar-gratis.md`, `render.yaml`, `index.html`

**Tipo:** feature

**Qué se cambió:** Recuerdos en `/recuerdos/` separado de invitación. Cada mesa tiene QR único (`?mesa=&t=`). Acceso solo vía QR. Invitados solo ven sus fotos. Admin crea mesas y descarga QR. Guía Render gratis sin dominio.

**Resultado:** Mismo dominio, rutas distintas. Invitación pública; subir fotos solo con QR de mesa.

## 2026-07-13 — Historia real, recuerdos separados y galería privada (feature)

**Archivos:** `js/config.js`, `index.html`, `subir.html`, `galeria.html`, `qr.html`, `js/subir.js`, `js/galeria.js`, `js/qr.js`, `server/index.js`, `styles/recuerdos.css`

**Tipo:** feature

**Qué se cambió:** Datos reales de historia y programa; dress code libre/elegante; subida y galería en páginas aparte; privacidad (invitados solo ven sus archivos; novias ven todo con contraseña); QR corregido en `qr.html`.

**Contraseña admin por defecto:** `ZaidaSheila2027` (cambiar con variable `ADMIN_PASSWORD`).

## 2026-07-13 — Rediseño premium (enhancement)

**Archivos:** `index.html`, `styles/main.css`, `js/main.js`, `js/config.js`

**Tipo:** enhancement

**Qué se cambió:** Rediseño visual profesional (tipografía, paleta, animaciones), nuevas secciones (historia, programa, dress code, FAQ), mapa embebido, filtros galería, compartir invitación, añadir al calendario, barra progreso, botón RSVP flotante, combo en minijuego.

**Antes:** Diseño básico dorado con secciones simples.

**Resultado esperado:** Web con aspecto editorial/lujo, más completa y profesional para invitados.

## 2026-07-13 — Web de boda completa (feature)

**Archivos:** `index.html`, `styles/main.css`, `js/main.js`, `js/config.js`, `server/index.js`, `package.json`, `README.md`, `abrir-web.bat`

**Tipo:** feature

**Qué se cambió:** Creación inicial de la web de invitación para Zaida y Sheila (4 sep 2027, Valencia).

**Antes:** Proyecto vacío.

**Incluye:** invitación animada, cuenta atrás, RSVP WhatsApp + confeti, cuestionario alimentación, ubicación Maps, subida fotos/vídeos + QR, galería, canciones, regalos en efectivo, minijuego con ranking, clima estimado, diseño responsive.

**Resultado esperado:** Invitados acceden a la web, confirman por WhatsApp, suben recuerdos y disfrutan del minijuego.
