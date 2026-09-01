---
name: scroll-de-navegacion
description: El scroll de navegación es GLOBAL (src/app/scroll-restoration.ts); nunca volver a los parches de scrollTo por página.
metadata:
  type: project
---

**Desde 2026-09-01 el scroll de navegación tiene una sola fuente de verdad:
`src/app/scroll-restoration.ts`** (registrado en `app.config.ts` con
`withInMemoryScrolling(...'disabled')` — el router emite los eventos `Scroll` igual y el
servicio decide).

- Navegación nueva ⇒ arriba SIEMPRE, en todas las rutas.
- Back/forward ⇒ restaura la posición real **con reintentos ~800 ms**, porque la altura del
  documento se asienta tarde (pósters del portafolio miden al cargar; el scroll-hijack de
  industrias ajusta su alto por JS). El scroll manual del visitante aborta la restauración.
- Los `#fragmentos` van por `scrollToAnchor`.

**Why:** el router estaba sin gestión de scroll y cada página nueva heredaba la altura anterior;
había parches locales de `scrollTo(0,0)` en contacto e industria que tapaban solo esas páginas y
peleaban contra el back. Se quitaron.

**How to apply:** una página que "entra corrida" o un back que "no vuelve donde estaba" se
arregla EN EL SERVICIO (o subiendo su ventana de reintentos), **nunca agregando `scrollTo` por
página** — eso recrea el bug del back. Mismo servicio, idéntico, en nolo-simple y
LinkDesign-simple: si se toca en uno, replicar en el otro.
