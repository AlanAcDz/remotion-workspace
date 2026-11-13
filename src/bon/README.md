# BON — phone footage cut to a script

Composition `bon-una-tarde` (folder `bon`), props in
`src/videos/bon-una-tarde.props.ts`. Phone clips from BON Luxury Theme Park's
Private Soft Opening, cut to a VidantaWorld Vacation Planner's voiceover.

- One `segment` per spoken line. Its `chunks` are the line split for the
  screen; joined with spaces they read exactly as she says it (`\n` only
  breaks the layout, `{plannerName}` is filled from the `plannerName` prop).
- `shots` fill their segment in proportion to `to - from`, in the original
  recording's seconds. `clips[*].sourceOffset` maps those onto the trimmed
  copies in `public/bon/`. When a segment's duration differs from its shots'
  total, the footage is slowed or sped to fit, so in/out points never move;
  keep the totals close to the segment so it plays at about 1x.
- A shot's `label` names a ride while that shot is on screen (consecutive
  shots with the same label share one). Labels sit on the chapter mark's row
  and wait for a chapter mark to fade.
- A segment's first shot dissolves in over 8 frames; the shot before it keeps
  playing under the dissolve, so leave about 0.3 s of clean footage after each
  segment's last `to` (0.5 s before the end card).
- `kind: "end-card"` is the designed card: typeset BON, the call to action
  (its `chunks`), the planner logo and the tags.

## Voiceover

`voiceover.src` is one continuous file that starts on frame 0
(`public/audio/bon-una-tarde-voz.mp3`, edited from the planner's WhatsApp voice
note: opening "Hola," dropped, pauses tightened to about 0.3–0.45 s with 25 ms
crossfades, high-pass, light denoise, mild compression, -16 LUFS, under
-2.5 dBTP). With it set:

- each segment runs from its `start` to the next one's (seconds of the voice
  file), and the end card holds `voiceover.endHold` seconds after the voice;
- each chunk appears at its `at`, the second she starts saying it;
- the music sits at `music.underVoiceVolume` and rises to
  `music.endCardVolume` once the voice ends.

Without `voiceover`, segments fall back to `duration` and chunks share it in
proportion to their length (about 13 characters a second). Word onsets were
taken from Whisper (large-v3) cross-checked against the waveform; re-check
them by ear if the voice file changes.

## Footage

Copies are upright 1080x1920, 30 fps, H.264, muted:

```
ffmpeg -ss <in> -t <len> -i <original> -an \
  -vf "scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p" \
  -c:v libx264 -preset slow -crf 19 public/bon/<name>.mp4
```

Never use the audio of `20261111_182450.mp4` (commercial song). The props file
lists what each cut avoids: identifiable guests and staff, minors, signage
naming anything other than Floresta Drop and Sky Ship, the PELIGRO and
"KIDS COVE" signs, Tempest Towers and the water play area. Originals are in
`~/Downloads/Videos vidanta/Bon/`; never modify them.

## Render

```
npx remotion render bon-una-tarde out/bon-una-tarde-final-render.mp4
ffmpeg -i out/bon-una-tarde-final-render.mp4 \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 20 -color_range tv -c:a copy \
  -movflags +faststart out/bon-una-tarde-final.mp4
```

Remotion writes full-range `yuvj420p`; the second step makes a standard
`yuv420p` file for the platforms.
