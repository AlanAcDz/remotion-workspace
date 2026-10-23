# Carousel slides

1080x1350 `<Still>`s in Punto Listo's palette, one per slide: a `cover` (photo
with the headline), numbered `tip`s (photo above the copy) and a closing
`cta`. "*word*" is painted tomato and "\n" breaks the line.

## New carousel

1. Generate the photos with Codex (unbranded, no text) into
   `public/videos/punto-listo/<plc-slug>/`.
2. Copy `src/videos/dia-de-muertos.carousel.ts` and register its slides in the
   `carrusel` folder of `src/Root.tsx`.
3. Render each slide:
   `npx remotion still src/index.ts <Id>-01 out/punto-listo/<plc-slug>/01.jpg --image-format=jpeg --jpeg-quality=92`
