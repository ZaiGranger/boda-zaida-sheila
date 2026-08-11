# Aprendizajes

## Contraseña admin en Render

**Contexto:** Login admin fallaba en producción con la clave corta antigua.

**Problema:** `generateValue: true` en Render creó otra contraseña; local y docs no coincidían.

**Solución:** Fijar en `render.yaml` / código / README la contraseña larga que ya funciona en Render. No imprimir secretos en logs.

**Regla:** Una sola contraseña documentada; nunca `generateValue` para claves que debáis recordar.

## Galería por mesa vs por invitado

**Contexto:** Sistema de QR de mesas para fotos de boda.

**Problema:** Filtrar por `guestId` hacía que cada persona solo viera lo suyo, no lo de la mesa.

**Solución:** Con QR válido, `/api/gallery` devuelve todo lo de esa `mesaId`. Admin sigue viendo todo. El nombre del invitado solo etiqueta quién subió.

**Regla:** Aclarar siempre con la pareja si la privacidad es “por mesa” o “por persona” antes de implementar.

## Estilo limpio sobre capas CSS existentes

**Contexto:** La web ya tenía `main.css` + `watercolor.css` + `editorial.css` con muchas reglas `!important` y botones poco diferenciados.

**Problema:** Cambiar colores/hover en un solo archivo no bastaba; los overrides se pisaban entre sí.

**Solución:** Añadir `white-planner.css` al final de la cascada con la paleta, botones (3 variantes) y contador, y bajar cache `?v=`.

**Regla:** En rediseños visuales, preferir una capa final de overrides + cache bust, en vez de reescribir todo de golpe.

## Textos largos vs claridad

**Contexto:** Pedido estilo The White Planner (menos saturación, más claridad).

**Problema:** Textos de sección demasiado largos competían con la jerarquía visual.

**Solución:** Acortar copy en HTML/`config.js` y dejar la info clave en títulos + iconos.

**Regla:** En webs de boda, priorizar una frase corta por bloque; el detalle va en FAQ o al confirmar.
