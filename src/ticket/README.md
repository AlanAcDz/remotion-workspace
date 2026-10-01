# TicketStory — "El Ticket"

A second Punto Listo format, built as a creative experiment next to `PosDemo`.
No voiceover and no screen-recording-first layout: a thermal receipt prints
what a shop leaks in a day, the printer's display counts it up, the day is
multiplied into a month, the receipt is torn off, and Punto Listo prints the
answer to every line. One real-UI proof beat, then the CTA prints as a receipt.

## Structure (all on the music's beat grid, see `timeline.ts`)

| Phase        | Beats      | What happens                                                     |
| ------------ | ---------- | ---------------------------------------------------------------- |
| Hook         | 0–2        | Headline set from frame 0 (the thumbnail), receipt header out    |
| Leaks        | 2 per line | A line prints, the display rolls to the new total                |
| Month        | 1 + 2      | `× 30` prints, the display accelerates to the month, hit + shake |
| Tear / pivot | 3 + 1 + 2  | Receipt ripped away, logo card                                   |
| Fix          | 1 per line | Same leaks, answered and checked off (`n/n` on the display)      |
| Proof        | 5          | Optional: a recording cropped to the number, ringed              |
| CTA          | 1 + 5 + 3  | Logo, notes, barcode, pill, "gracias"                            |

Length is derived from the props, so adding a line pushes everything after it
back by whole beats — there are no hand-written timestamps.

## New episode

1. Copy `src/videos/ticket-tienda.props.ts`. Keep leak labels ≤ 22 characters
   and one fix line per leak, in the same order.
2. Headlines: `*stars*` paint words tomato; `\n` forces a line break.
3. Proof crop: measure the source rectangle off a still, as in `PosDemo`
   (`frame` is fractions of the source; `highlight` is card pixels, card width
   860).
4. Register a `<Composition>` in the `ticket` folder of `src/Root.tsx`.

The amounts are illustrative — keep the `*CIFRAS DE EJEMPLO` line on the
receipt, especially when the video runs as a paid ad.

## Sounds

`printer`, `tear` and `tick` are synthesised in `scripts/make-sfx.sh` like the
rest of the pack. The mix has no voice to duck under, so levels are set for
~-15 LUFS integrated with peaks under -1 dBFS; re-measure after changing cues:

```console
ffmpeg -i out/.../preview.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```

## Narrated and single-leak episodes

`ticket-kilo.props.ts` is the second shape the template supports:

- `voice.audioFile` adds a narration track (drop `music.volume` to ~0.12).
- `loss.lineStart` / `loss.lineBeats` print lines faster — 0.5 / 1 starts the
  printer on frame 0 and prints a line every half second.
- `loss.unit` makes the multipliers multiply one line's amount instead of the
  lines' sum, and `loss.multipliers` chains them (× 60 ventas → × 30 días).
- `fix` is optional: without it the pivot goes straight to the proof.
- `timing` pins the story beats to the narration's words, in seconds read off
  the caption JSON; the receipt lines stay on the beat grid.
