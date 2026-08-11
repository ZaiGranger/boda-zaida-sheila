# Aprendizajes

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
