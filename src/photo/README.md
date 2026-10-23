# PhotoStory — "La Libreta" and short loops

A real-looking photo owns the first frame — no logo, no UI. The story is
written on it (`hand`, a ballpoint Caveat that writes left to right;
`circle`, a red loop drawn in) or said over it (`bubble`), with word captions
from the voiceover. The app arrives as a `card` over the dimmed, blurred photo,
then PosDemo's end card — or a `pill` and no end card at all, for a loop.

- Photos are cover-fitted to 1080x1920. A 1024x1536 image scales 1.25x and
  loses 100px a side: image (x, y) lands at frame (1.25x - 100, 1.25y).
- `hand` and `circle` ride the active scene's push-in, so they stay on the
  paper; give them `until` so they leave with their scene.
- For a loop, end on a scene that eases back to frame 0's framing and repeats
  frame 0's overlays.
- `title` is big copy on a paper band, with an optional tomato `kicker` chip:
  a format's title card, a list entry ("Los de siempre"), a verse ("La
  Calaverita"). Where bands carry the words, limit `captions` to the rest.

## New episode

1. Copy `src/videos/libreta-kilo.props.ts` (or `coca-loop.props.ts`, or
   `clientes-quincena.props.ts` / `calaverita-merma.props.ts` for bands).
2. Generate the photo with Codex — blank surfaces where text will be written,
   no brand logos — and keep the exact numbers in the composition.
3. Register a `<Composition>` in the `photo` folder of `src/Root.tsx`.
