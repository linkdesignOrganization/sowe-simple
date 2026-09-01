# Memory Index

- [Google Ads conversiones](google-ads-conversiones.md) — modelo de 2 acciones (Contacto/Scroll), cuenta AW-16767245191 compartida LinkDesign+SOWE, bug agendar→scroll corregido, pendientes de SOWE
- [Deploy de nolo-simple en Azure](project-nolo-azure-deploy.md) — SWA en prod sirviendo **nolo.ar** (rebrand Sowe→Nolo hecho); SSG/SEO + /software/:slug + **industrias (es/en)** + **Pulso (1er viewcase)** live; CRM conectado (AR→hola@nolo.ar)
- [⚠️ Rebrand AR: Sowe → Nolo (2026-06-15)](project-nolo-rebrand.md) — la marca argentina pasó a Nolo (nolo.ar, hola@nolo.ar, repo nolo-simple); **GO-LIVE HECHO 2026-06-15**: nolo.ar+www.nolo.ar live, sowe.ar removido (SWA+CRM); voseo se mantiene; Link Design NO cambia
- [Candado del lead scoring (3 repos)] — desde 2026-08-11 `src/app/lead-form/utils/lead-score-vectors.shared.ts` (idéntico byte a byte en CRM + LinkDesign + acá) corre 22 vectores contra `lead-score.ts`; **regla de Robert: la prioridad #1 es Google Ads** — la copia de LOS SITIOS es la fuente de verdad (alimenta el value de Smart Bidding); si hay divergencia se alinea el CRM, nunca este repo; la fórmula se toca en los 3 o en ninguno. Ver cabecera del archivo shared.
- [Scroll de navegación global](scroll-de-navegacion.md) — nueva ruta arriba, back con reintentos; NUNCA parches de scrollTo por página (src/app/scroll-restoration.ts, idéntico en ambos sitios)
