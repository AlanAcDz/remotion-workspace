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

## A reto on paper

`reto-suma-libreta.props.ts` (Reto #10) plays RetoTicket's find-the-error
mechanic on a notebook page:

- `pause` cuts a silence into the take at `pause.at` (the take's own clock),
  as RetoTicket does; the voice and its captions resume `pause.for` seconds
  later. Every other time in the props is on the final timeline.
- `pause.captions` takes the take's captions split at `pause.at` (question
  and answer files, both on the take's clock). Without it a caption page can
  join "¿Lo ves?" to "Aquí:" and show the answer's first word before the
  countdown.
- A `countdown` overlay counts 3 · 2 · 1 under a tomato prompt chip for its
  `for` seconds; put a `tick` from `TICKET_SFX` on each beat.
- A `hand` line takes `strike: { at }` to be crossed out in red at `at`.
- `hasVoice: false` renders a silent draft without captions while the take
  does not exist yet. Set it back before the review render.

## New episode

1. Copy `src/videos/libreta-kilo.props.ts` (or `coca-loop.props.ts`, or
   `clientes-quincena.props.ts` / `calaverita-merma.props.ts` for bands).
2. Generate the photo with Codex — blank surfaces where text will be written,
   no brand logos — and keep the exact numbers in the composition.
3. Register a `<Composition>` in the `photo` folder of `src/Root.tsx`.
