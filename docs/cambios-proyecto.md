# Cambios del proyecto

## 2026-07-14 — Hojas laterales solo tras abrir + dresscode sin etiquetas (enhancement)

**Archivos:** `index.html`, `styles/watercolor.css`, `js/main.js`

**Tipo:** enhancement

**Qué se cambió:** Hojas en laterales con blend crema (sin caja blanca), ocultas en el sobre; dresscode con 3 acuarelas sin textos de pareja.

## 2026-07-14 — Ajustes acuarela: dresscode, sobre grande y fondo hojas (enhancement)

**Archivos:** `index.html`, `styles/watercolor.css`, `js/main.js`

**Tipo:** enhancement

**Qué se cambió:** Acuarelas solo en dresscode; eliminada sección "En acuarela"; sobre más grande sin cuadrado duplicado; fondo eucalipto en toda la web; hero con más espacio.

## 2026-07-14 — Rediseño acuarela estilo invitación premium (enhancement)

**Archivos:** `styles/watercolor.css`, `index.html`, `images/watercolor-*.png`, `js/main.js`

**Tipo:** enhancement

**Qué se cambió:** Sobre tipo papel con sello de cera, solapas animadas, paleta crema, eucalipto acuarela, 3 ilustraciones de parejas, "Minuto a minuto" en lugar de Programa.


**Archivos:** `index.html`, `js/main.js`, `js/config.js`, `styles/main.css`

**Tipo:** feature

**Qué se cambió:** Enlace a playlist colaborativa de Spotify + formulario manual siempre visible. Sin necesidad de Premium de desarrollador.


**Archivos:** `server/index.js`, `js/main.js`, `js/config.js`, `index.html`, `styles/main.css`, `render.yaml`

**Tipo:** feature

**Qué se cambió:** Búsqueda Spotify para sugerir canciones; paleta floral verde claro con pétalos; sobre con sello, carta desplegable, explosión de pétalos y entrada animada al contenido.

**Configurar Spotify:** Crear app en developer.spotify.com y añadir `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` en Render.

## 2026-07-14 — Tema botánico verde + historia febrero 2020 (enhancement)

**Archivos:** `styles/main.css`, `styles/recuerdos.css`, `js/config.js`, `index.html`

**Tipo:** enhancement

**Qué se cambió:** Paleta verde salvia/musgo, hojas flotantes decorativas, botones y timeline en verde, historia corregida (febrero 2020, confinamiento marzo).

**Resultado:** Invitación con estética botánica elegante y texto de historia actualizado.


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
