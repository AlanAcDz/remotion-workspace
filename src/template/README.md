# PosDemo template

One component, many videos. Everything that changes between videos lives in
`src/videos/<name>.props.ts`, validated by `schema.ts` and editable in Remotion
Studio's props panel.

## Adding a video

1. **Script** → one idea, hook pays off, readable on mute.
2. **Voiceover + captions** → generate both from the approved script with the
   pinned Punto Listo voice:

   ```console
   pnpm punto-listo:voice --slug <name> --script <path-to-script.txt>
   ```

   The command makes one ElevenLabs request and writes
   `public/audio/<name>.mp3` plus `public/captions/<name>.json`. Run it first
   with `--dry-run` to validate the inputs without consuming credits. It
   refuses to overwrite an existing take unless `--force` is explicit.
   `ELEVENLABS_API_KEY` must be set in the gitignored `.env` file. For a
   manually recorded voiceover, `node sub.mjs public/audio/<name>.mp3` remains
   available as the local Whisper fallback.

3. **Cue sheet** → read the beat boundaries straight out of that JSON rather
   than guessing. Guessed timings put video 01's `folio` beat 3.5s late.
4. **Clips** → drop recordings in `public/videos/<project>/`.
5. **Props** → write `src/videos/<name>.props.ts`, register a `<Composition>`
   in `src/Root.tsx`, render.

## Framing clips

`pane.frame` is a crop rectangle in **fractions of the clip's own frame**, so
the same numbers work for a 1280x720 desktop master and an 860x1864 phone
recording. The pane scales that region up to fill its box — crop _into_ the UI
at 1.3x–1.8x rather than shrinking a whole screenshot into the panel.

To convert a pixel rectangle: `x = left / clipWidth`, `width = w / clipWidth`,
and the same over `clipHeight` for `y` / `height`. Keep the rect's aspect close
to its box's, or `objectFit: cover` will trim the edges.

`pane.zoomTo` is a second rectangle: the beat pushes in from `frame` to
`zoomTo`. Use it once per video.

## Layouts

Every video is cut on the same split: the UI takes the **top two thirds** of the
frame (1080x1280, `UI_ZONE`) and captions take the bottom third. `FRAME` and
`UI_ZONE` in `schema.ts` are the only place that ratio is written down — the
panel box, the caption band and the hook copy are all derived from them.

- `panel` (default) — a landscape recording in a rounded card, centred in the UI
  zone. Use `captionStyle: "paper"`.
- `mobile-ui` — a portrait recording filling the UI zone edge to edge. Use
  `captionStyle: "paper"`. This is the default for new videos.
- `fullframe` — a portrait clip covering the whole 1080x1920 frame, for
  mobile-viewport recordings. Use `captionStyle: "video"` so captions get the
  white-on-dark-stroke treatment that survives over footage.

For `mobile-ui`, do not hand-write crop rects: call `uiWindow(source, topPx)`.
It returns a full-width window with the UI zone's exact aspect, so the recording
lands at 1:1 with no distortion, and `topPx` is simply the source pixel row the
window starts at — the number you measure off a still. Sliding that one number
up and down the phone screen is how a single take is cut into beats
(see `videos/corte.props.ts`).

Multiple `panes` in one beat give you a two-up: each pane's `box` positions it
inside the panel and turns it into a card.

`callout.left` / `callout.top` are panel pixels. For a `mobile-ui` beat that is
`(sourceRow - windowTop) * (UI_ZONE.width / sourceWidth)` — derive it from the
same measured rows as the crop instead of eyeballing it.

## Gotchas

- Tailwind preflight caps `img`/`video` at `max-width: 100%`, which silently
  shrinks framed clips. `BeatPane` sets `maxWidth: "none"`; anything new that
  renders media must too.
- `cropLeft`/`cropTop`/... on `<Video>` **mask in place** — they do not reframe
  a clip into its box. That is why framing is done with explicit
  `left`/`top`/`width`/`height`.
