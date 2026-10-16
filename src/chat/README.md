# ChatStory — "El Chat"

A conversation between the cashier and the owner, read off the owner's
phone. No voiceover and no logo or UI until the owner sends a screenshot of
Punto Listo: the first frame is a chat, which is what stops the scroll.

1. **History** (`at: 0`): a few earlier messages from the day, so frame 0 is a
   full, lived-in screen; the last one is the hook.
2. **Messages**: each lands at `at` with a pop. `typing` seconds before it,
   the header says "escribiendo…" and a dots bubble shows (cashier), or the
   text types into the input bar (owner).
3. **Screenshot**: an `image` message — a still exported from a recording,
   with an optional `ring` in the image's own pixels.
4. **CTA**: the `takeaway` line over PosDemo's end card.

The chat is bottom-anchored like a real one; every bubble pushes the stack up
by its own height. Heights are computed, not measured, so copy breaks lines
with `\n` and never wraps — keep each line short enough for one row.

## New episode

1. Copy `src/videos/chat-faltante.props.ts`.
2. Export screenshots with ffmpeg (`-ss <s> -frames:v 1 -vf crop=w:h:x:y`)
   into `public/videos/punto-listo/<slug>/`; photos can come from Codex.
3. Register a `<Composition>` in the `chat` folder of `src/Root.tsx`.

The look is a generic chat (brand ink header, tomato accents), not a copy of
any messaging app.
