import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { CaptionTrack } from "./components/caption-track";
import { MusicBed } from "./components/music-bed";
import "./fonts";
import { captionsFileFor, type PosDemoProps } from "./schema";
import { BeatScene } from "./scenes/beat-scene";
import { CtaScene } from "./scenes/cta-scene";
import { HookOverlay } from "./scenes/hook-overlay";

// Beats overlap by this many frames so one dissolves into the next
// instead of hard-cutting.
const CROSSFADE = 8;

export function PosDemo({
  audioFile,
  hook,
  captionStyle,
  music,
  beats,
  cta,
}: PosDemoProps) {
  const { fps, durationInFrames } = useVideoConfig();

  const ctaFrom = Math.round(cta.from * fps);
  const hookUntil = Math.round(hook.until * fps);

  return (
    <AbsoluteFill name="PosDemo" style={{ backgroundColor: "#F7F3EB" }}>
      <Audio name="Locución" src={staticFile(audioFile)} />

      {music ? <MusicBed music={music} ctaFrom={ctaFrom} /> : null}

      {beats.map((beat) => (
        <Sequence
          key={beat.name}
          name={beat.name}
          from={Math.round(beat.from * fps)}
          durationInFrames={
            Math.round((beat.to - beat.from) * fps) + CROSSFADE
          }
        >
          <BeatScene beat={beat} />
        </Sequence>
      ))}

      <Sequence name="Hook copy" durationInFrames={hookUntil + CROSSFADE}>
        <HookOverlay text={hook.text} subline={hook.subline} />
      </Sequence>

      <Sequence
        name="CTA"
        from={ctaFrom}
        durationInFrames={durationInFrames - ctaFrom}
      >
        <CtaScene cta={cta} />
      </Sequence>

      {/* One continuous track: the hook copy covers the opening, the CTA
          carries its own words, captions fill everything in between. */}
      <CaptionTrack
        captionsFile={captionsFileFor(audioFile)}
        visibleFrom={hookUntil}
        visibleUntil={ctaFrom}
        style={captionStyle}
      />
    </AbsoluteFill>
  );
}
