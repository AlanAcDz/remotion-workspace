# Un día en familia en VidantaWorld

Composition `vidanta-familia` (folder `vidanta-familia`), props in
`src/videos/vidanta-familia.props.ts`. Rally piece 2 for a VidantaWorld
Vacation Planner: six numbered family spaces of VidantaWorld Vallarta - Nuevo
Nayarit as one day, from her phone clips of Nov 12 2026. It shares the look of
`bon-una-tarde` (colors, Lora/Poppins from `src/bon/fonts.ts`, scrim, safe
areas, end card) but keeps its own code.

- One `segment` per script line. Its `chunks` are the line split for the
  screen, shown one after another, each for a share of the segment
  proportional to its length (about 13 characters a second). Joined with
  spaces they must read exactly as the script; `\n` only breaks the layout.
- `chapter: "3 · Alberca infantil"` numbers a space: the number is set in
  Poppins, the name in Lora italic, top left, for the first 2.8 s.
- `shots` fill their segment in proportion to `to - from`, in the original
  recording's seconds. `clips[*].sourceOffset` maps those onto the trimmed
  copies in `public/vidanta-familia/`. When a segment's duration differs from
  its shots' total, the footage is slowed or sped to fit (keep it within about
  0.85–1.15x), so in/out points never move.
- A segment's first shot dissolves in over 8 frames; the shot before it keeps
  playing under the dissolve, so leave about 0.3 s of clean footage after each
  segment's last `to` (0.5 s before the end card).
- `kind: "end-card"` is the designed card: the typeset `endCard.title` and
  `subtitle`, the call to action (its `chunks`), the planner logo and the tags.

## Adding the voiceover

1. Put one file per line in `public/vidanta-familia/voz/` (for example `01.mp3`).
2. Set each segment's `voice: "vidanta-familia/voz/01.mp3"`.
   `calculateVidantaFamiliaMetadata` makes the segment last the audio plus
   `voicePadding`, the captions re-time themselves, and the music drops to
   `music.underVoiceVolume`.
3. Re-check the cuts: a longer segment slows its shots down. Keep the total
   over 60 s (rally minimum).

## Footage

Originals are HEVC 1920x1080 with -90° rotation (one at 120 fps). Copies are
upright 1080x1920, 30 fps, H.264, muted:

```
ffmpeg -ss <in> -t <len> -i <original> -an \
  -vf "scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p" \
  -c:v libx264 -preset slow -crf 19 -movflags +faststart \
  public/vidanta-familia/<name>.mp4
```

No clip audio is used: it carries other guests' conversations. The props file
lists what each cut avoids (children in the water, seated guests and staff,
price tags, reflections of passers-by).

## Render

```
npx remotion render vidanta-familia out/vidanta-familia-render.mp4
ffmpeg -i out/vidanta-familia-render.mp4 \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 20 -color_range tv -c:a copy \
  -movflags +faststart out/vidanta-familia-review.mp4
```

If another composition's props fail validation, the default entry refuses to
render; `src/vidanta-familia/render-entry.tsx` registers this composition
alone: `npx remotion render src/vidanta-familia/render-entry.tsx vidanta-familia …`.

Remotion writes full-range `yuvj420p`; the second step makes a standard
`yuv420p` file for the platforms.
