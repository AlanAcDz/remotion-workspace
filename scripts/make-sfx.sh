#!/usr/bin/env bash
# Regenerates public/sfx/*.mp3 — every sound is synthesised from scratch with
# ffmpeg, so the pack is copyright-free by construction. Each file is peak
# normalised to -1 dBFS; per-cue levels live in the video props, not here.
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=public/sfx
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT"

# Peak normalise to -1 dBFS and encode.
encode() {
  local src=$1 dst=$2
  local peak
  # Upmix to stereo first: ffmpeg applies a -3 dB pan law on mono -> stereo,
  # so measuring before the upmix would normalise to the wrong peak.
  ffmpeg -hide_banner -loglevel error -y -i "$src" \
    -af "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo" \
    "$TMP/stereo-$dst.wav"
  peak=$(ffmpeg -hide_banner -nostats -i "$TMP/stereo-$dst.wav" -af volumedetect -f null - 2>&1 |
    sed -n 's/.*max_volume: \(-*[0-9.]*\) dB.*/\1/p')
  ffmpeg -hide_banner -loglevel error -y -i "$TMP/stereo-$dst.wav" \
    -af "volume=$(echo "-1 - ($peak)" | bc)dB" \
    -c:a libmp3lame -q:a 2 "$OUT/$dst"
}

# Beat transition — a blow, not a swish. Narrow resonant bands ring like metal;
# these two are deliberately wide (non-resonant) so there is no pitch to hear.
# Air first, body just behind it, and the whole thing darkens as it decays,
# which is what real breath does. The body sits at 300-900 Hz rather than down
# at 160 Hz: phone speakers roll off below ~500 Hz, and a blow nobody hears on
# a phone is not a blow. Everything above 2.6 kHz is gone — that band is where
# harshness lives.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "anoisesrc=d=0.55:c=pink:r=48000:a=0.9:seed=11" \
  -filter_complex "\
[0:a]asplit=2[air][body]; \
[air]highpass=f=700,lowpass=f=2000,\
volume='0.55*(1-exp(-t/0.025))*exp(-t/0.10)':eval=frame[a]; \
[body]highpass=f=200,highpass=f=260,lowpass=f=950,lowpass=f=1300,\
volume='1.0*(1-exp(-t/0.045))*exp(-t/0.17)':eval=frame[b]; \
[a][b]amix=inputs=2:normalize=0,lowpass=f=2600,afade=t=out:st=0.45:d=0.1" \
  "$TMP/whoosh.wav"
encode "$TMP/whoosh.wav" whoosh.mp3

# Callout pop-in — gives the spring animation some weight.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='0.85*sin(2*PI*(400*t+16.7*(1-exp(-30*t))))*min(t/0.004,1)*exp(-24*t)':d=0.24:s=48000" \
  -f lavfi -i "anoisesrc=d=0.24:c=pink:r=48000:a=0.5:seed=3" \
  -filter_complex "[1:a]highpass=f=1800,volume='0.35*exp(-110*t)':eval=frame[click]; \
[0:a][click]amix=inputs=2:normalize=0,afade=t=out:st=0.2:d=0.04" \
  "$TMP/pop.wav"
encode "$TMP/pop.wav" pop.mp3

# The money moment — two ascending bell notes, C6 then G6, with their octaves.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='min(t/0.003,1)*(0.5*sin(2*PI*1046.5*t)*exp(-5.5*t)+0.22*sin(2*PI*2093*t)*exp(-9*t))+gt(t,0.13)*(0.5*sin(2*PI*1568*(t-0.13))*exp(-4.5*(t-0.13))+0.2*sin(2*PI*3136*(t-0.13))*exp(-8*(t-0.13)))':d=1.5:s=48000" \
  -af "afade=t=out:st=1.2:d=0.3" \
  "$TMP/ding.wav"
encode "$TMP/ding.wav" ding.mp3

# CTA card — one soft low hit, no sparkle, so the ask lands in the quiet.
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "aevalsrc=exprs='min(t/0.005,1)*(0.9*sin(2*PI*(72*t+4.8*(1-exp(-12*t))))*exp(-6*t)+0.18*sin(2*PI*216*t)*exp(-11*t))':d=1.1:s=48000" \
  -af "afade=t=out:st=0.85:d=0.25" \
  "$TMP/soft-hit.wav"
encode "$TMP/soft-hit.wav" soft-hit.mp3

ls -l "$OUT"
