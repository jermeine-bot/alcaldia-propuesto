# Carrusel mixto de la portada (imágenes y videos)

Fecha: 2026-11-12
Estado: propuesto

## Intención

Que el carrusel de la portada del CMS pueda combinar imágenes y videos, o quedar solo de videos, sin agregar un modo nuevo de fondo ni romper lo que ya está configurado.

## Contexto actual

- `hero.bg_type` tiene cuatro modos excluyentes: `video`, `image`, `carousel`, `none`.
- `carousel` solo acepta 6 imágenes guardadas como strings en `hero.carousel_images` (JSON).
- Las imágenes del carrusel se guardan como base64 dentro de la base de datos; hoy suman ~3.3 MB.
- Los videos se suben a `backend/uploads/` con `POST /api/hero/upload-video` (MP4/WebM, máximo 100 MB) y se guarda una URL.
- `Hero.jsx` monta las 6 imágenes y hace crossfade cada 5 s.

## Alcance

- **Sí**: 6 diapositivas; cada una elige Imagen o Video; subida o URL de video; imagen de respaldo (poster); compatibilidad con los datos actuales.
- **No**: reordenar o eliminar diapositivas, duración configurable, audio, más de 6 diapositivas, cambios en los otros modos de fondo.

## Enfoque elegido

**A. Carrusel mixto por diapositiva.** Un solo modo `carousel` donde cada casilla tiene tipo. Cubre "mezclar" y "solo videos" (las 6 en Video).

Se descartaron:

- **B. Modo aparte "Carrusel de videos"**: duplica interfaz y lógica, y no permite mezclar.
- **C. Lista flexible con agregar/quitar/reordenar**: más cómoda, pero amplía el alcance y no era lo pedido.

## Modelo de datos

`hero.carousel_images` sigue siendo un JSON de hasta 6 elementos. Nuevo formato:

```json
[
  { "type": "image", "src": "data:image/...", "poster": "" },
  { "type": "video", "src": "/uploads/hero_abc.mp4", "poster": "/img/hero-bg.jpg" }
]
```

- Los strings antiguos se normalizan a `{ "type": "image", "src": "<string>", "poster": "" }`.
- No hace falta migración: la columna ya es `TEXT`/`LONGTEXT`.
- Los videos nunca se guardan en base64; solo imágenes.

## Backend (`HeroController.php`)

- `getHero` devuelve siempre 6 objetos normalizados (string → imagen).
- `updateHero` valida cada elemento:
  - `type` solo `image` o `video` (por defecto `image`).
  - `src` string recortado; rechaza `data:video` para no inflar la base.
  - `poster` string opcional.
  - Rellena hasta 6 y descarta elementos sobrantes.
- Reutiliza `POST /api/hero/upload-video`; no hay endpoints nuevos.

## Admin (`HeroAdmin.jsx`)

Cada casilla muestra un selector **Imagen | Video**:

- Imagen: el `ImageUploader` actual.
- Video: campo de URL + subida MP4/WebM + vista previa + `ImageUploader` para el poster.
- Indicador de subida por casilla y aviso de peso recomendado (≤ 10 MB).
- Al guardar se envía el arreglo de objetos; el formulario actual no cambia en lo demás.

## Sitio público (`Hero.jsx`)

- Normaliza los datos y descarta casillas vacías.
- Imágenes: 5 s por diapositiva.
- Videos: mudos, `playsInline`, sin audio; la diapositiva avanza al terminar el video, con tope de 15 s.
- Crossfade de 1.2 s entre diapositivas.
- Solo se carga el video activo (y el saliente durante la transición); no los 6 a la vez.
- Si un video falla: se muestra su poster o `fallbackImg`.
- Si no hay ninguna diapositiva: se usa `bgImageUrl` o `fallbackImg` (comportamiento actual).
- Con `prefers-reduced-motion`: se muestra la primera diapositiva sin rotación.

## Decisiones tomadas

- Los videos van siempre mudos; el hero no lleva audio.
- Las URLs de video se guardan relativas (`/uploads/...`), no absolutas. Hoy `uploadFile` devuelve la URL absoluta del API; se corrige para el hero.
- El poster es opcional; si falta, se usa `fallbackImg`.
- La duración de imágenes queda fija en 5 s; no se agrega control en esta iteración.

## Riesgos y límites

- Peso: 6 videos pueden pesar decenas de MB. Se recomienda 6–12 s, 1080p, sin audio y ≤ 10 MB.
- Autoplay en iOS: puede bloquearse en modo de bajo consumo; el poster evita un fondo negro.
- Las imágenes actuales en base64 siguen pesando ~3.3 MB en la respuesta del API; moverlas a `/uploads/` queda fuera de alcance.

## Verificación

- Admin: cambiar tipo de casilla, subir video, guardar, recargar y comprobar persistencia.
- Público: carrusel mixto rota imágenes y videos; el video avanza al terminar; fallback si falla.
- Compatibilidad: el carrusel actual de 6 imágenes sigue funcionando sin cambios.
- `npm run lint` y build.
