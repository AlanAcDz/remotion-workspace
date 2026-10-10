# RetoMostrador — "Reto del mostrador"

A counter-side sum the viewer tries to solve before Punto Listo does. Built
from the two best performers so far: 02b's opening (a real number answered on
screen within a second) and 03b's quiz.

1. **Question** (0 → `pause.at`): episode pill, the facts and the ask over a
   still of the real UI. Numbers in the still that would give the answer away
   are covered with `card.masks`.
2. **Countdown** (`pause.for`, three beats): the voice stops, the bed comes up,
   3 · 2 · 1 and "¡Comenta tu respuesta!".
3. **Reveal**: the recording plays from `card.trimBefore`; the value lands
   `answer.at` seconds in, the ask becomes `answer.text` and the value is
   ringed. At `card.holdAt` the card holds on `card.answerStill`, because the
   recording moves on to other screens.
4. **CTA**: PosDemo's end card.

## New episode

1. Find a moment in an existing take where the app computes a number. Export
   a still before it (`still`) and one after it (`answerStill`) into
   `public/videos/punto-listo/reto/`.
2. Write the question and answer as one voice take and generate it with
   `pnpm punto-listo:voice`. Set `pause.at` inside the silence between the
   question and the answer (`ffmpeg -af silencedetect` finds it).
3. Measure crops, masks and the ring in source pixels; `toCard()` converts.
4. CTA times are the voice's word times plus `pause.for`.

## Lettered options

`reto-cambio-opciones.props.ts` asks for one letter instead of an amount:

- `question.options` (two or three) sit under the card and stay above the
  countdown's dimming; `answer.correct` is the index filled on the reveal.
  Set `pause.prompt` to "Comenta A, B o C" and keep the crop short enough that
  the options and subline clear the platform UI.
- `follow` swaps the subline for a follow ask ("Sigue la cuenta para el
  próximo reto") when the voice says it, before the CTA.
