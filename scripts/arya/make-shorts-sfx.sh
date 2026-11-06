#!/usr/bin/env bash
# Regenerates public/sfx/arya/*.mp3 for the no-voice Arya shorts. Synthesised
# with ffmpeg, so the pack is copyright-free by construction, and kept apart
# from scripts/make-sfx.sh so regenerating it never touches Punto Listo's pack.
set -euo pipefail

cd "$(dirname "$0")/../.."
OUT=public/sfx/arya
mkdir -p "$OUT"

# Pencil on paper: pink noise in the paper band, chopped into uneven strokes.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "anoisesrc=d=1.5:c=pink:r=48000:a=0.9:seed=7" \
  -af "highpass=f=1400,lowpass=f=6500,volume='0.25+0.75*abs(sin(2*PI*5.3*t)*sin(2*PI*8.1*t+1))':eval=frame,afade=t=in:d=0.02,afade=t=out:st=1.42:d=0.08" \
  -c:a libmp3lame -q:a 2 "$OUT/pencil.mp3"

# Wood knock: a short pitched thump plus a click, for a cup landing on a table.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='min(t/0.001,1)*(0.8*sin(2*PI*210*t)+0.5*sin(2*PI*480*t)*exp(-30*t))*exp(-38*t)':d=0.18:s=48000" \
  -c:a libmp3lame -q:a 2 "$OUT/knock.mp3"

# Low drone: two detuned low tones and a slow beat, audible on phone speakers.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='min(t/0.02,1)*(0.45*sin(2*PI*55*t)+0.35*sin(2*PI*110.7*t)+0.2*sin(2*PI*221*t)*(0.6+0.4*sin(2*PI*0.7*t)))':d=9:s=48000" \
  -c:a libmp3lame -q:a 2 "$OUT/drone.mp3"

# Trailer hit: a falling sub with a burst of noise on top.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='min(t/0.002,1)*sin(2*PI*(90*t-30*t*t))*exp(-3.2*t)':d=1.4:s=48000" \
  -f lavfi -i "anoisesrc=d=1.4:c=pink:r=48000:a=0.8:seed=13" \
  -filter_complex "[1:a]lowpass=f=1600,volume='exp(-12*t)':eval=frame[n];[0:a][n]amix=inputs=2:normalize=0" \
  -c:a libmp3lame -q:a 2 "$OUT/boom.mp3"

# Fridge door: a low seal pop, then the compressor hum settling in.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='min(t/0.003,1)*0.8*sin(2*PI*140*t)*exp(-18*t)+gt(t,0.12)*0.2*sin(2*PI*120*t)*min((t-0.12)/0.2,1)':d=1.6:s=48000" \
  -c:a libmp3lame -q:a 2 "$OUT/fridge.mp3"

ls -l "$OUT"
