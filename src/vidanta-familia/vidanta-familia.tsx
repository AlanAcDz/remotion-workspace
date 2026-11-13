import { Audio, Video } from "@remotion/media";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { lora, poppins } from "../bon/fonts";
import type {
  VidantaFamiliaClip,
  VidantaFamiliaProps,
  VidantaFamiliaSegment,
  VidantaFamiliaShot,
} from "./schema";

export const VIDANTA_FAMILIA_FPS = 30;

const COLORS = {
  forest: "#04372A",
  forestDeep: "#021F17",
  forestLight: "#0A4A39",
  cream: "#F1EBD8",
  bronze: "#B8894F",
} as const;

/** TikTok/Reels UI: keep text out of these bands (frame pixels). */
const SAFE = {
  top: 220,
  bottom: 420,
  left: 80,
  right: 160,
} as const;

/** Frames the next segment's first shot takes to dissolve in. */
const CROSSFADE = 8;
/** Frames the end card takes to rise over the last shot. */
const CARD_FADE = 15;
const CHUNK_IN = 7;
const CHUNK_OUT = 5;
const CHAPTER_HOLD = 2.8; // seconds
const CHAPTER_SEPARATOR = " · ";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TEXT_SHADOW = "0 2px 4px rgba(0, 0, 0, 0.35), 0 4px 22px rgba(0, 0, 0, 0.55)";
const CHAPTER_SHADOW = "0 1px 3px rgba(0, 0, 0, 0.45), 0 2px 16px rgba(0, 0, 0, 0.6)";

interface SegmentSlot {
  segment: VidantaFamiliaSegment;
  from: number;
  length: number;
}

interface ShotSlot {
  key: string;
  clip: VidantaFamiliaClip;
  shot: VidantaFamiliaShot;
  from: number;
  length: number;
  /** Frames it keeps playing under the next segment's dissolve. */
  tail: number;
  isDissolvingIn: boolean;
}

/**
 * Segment boundaries come from cumulative seconds, so rounding never drifts
 * across the timeline.
 */
function layoutSegments(segments: VidantaFamiliaSegment[], fps: number): SegmentSlot[] {
  let elapsed = 0;

  return segments.map((segment) => {
    const from = Math.round(elapsed * fps);
    elapsed += segment.duration;
    return { segment, from, length: Math.round(elapsed * fps) - from };
  });
}

/** Splits `length` frames by `weights`, rounding at cumulative boundaries. */
function splitFrames(length: number, weights: number[]): number[] {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulative = 0;

  return weights.map((weight) => {
    const start = Math.round((cumulative / total) * length);
    cumulative += weight;
    return Math.round((cumulative / total) * length) - start;
  });
}

/**
 * Shots fill their segment in proportion to their source length. When a voice
 * makes the segment longer or shorter, the footage is slowed or sped to fit,
 * so in/out points never change.
 */
function layoutShots(
  slots: SegmentSlot[],
  clips: VidantaFamiliaProps["clips"],
): ShotSlot[] {
  return slots.flatMap((slot, segmentIndex) => {
    if (slot.segment.kind !== "footage") {
      return [];
    }

    const { shots } = slot.segment;
    const next = slots[segmentIndex + 1]?.segment;
    const segmentTail = !next ? 0 : next.kind === "end-card" ? CARD_FADE : CROSSFADE;
    const lengths = splitFrames(
      slot.length,
      shots.map((shot) => shot.to - shot.from),
    );
    let offset = 0;

    return shots.map((shot, shotIndex) => {
      const clip = clips[shot.clip];
      if (!clip) {
        throw new Error(`Clip "${shot.clip}" is not defined in props.clips`);
      }

      const from = slot.from + offset;
      offset += lengths[shotIndex];

      return {
        key: `${slot.segment.name}-${shotIndex}`,
        clip,
        shot,
        from,
        length: lengths[shotIndex],
        tail: shotIndex === shots.length - 1 ? segmentTail : 0,
        isDissolvingIn: shotIndex === 0 && segmentIndex > 0,
      };
    });
  });
}

/**
 * Segments with a voice last as long as their audio plus `voicePadding`;
 * the rest keep their caption-paced `duration`.
 */
export const calculateVidantaFamiliaMetadata: CalculateMetadataFunction<
  VidantaFamiliaProps
> = async ({ props }) => {
  const segments = await Promise.all(
    props.segments.map(async (segment) => {
      if (!segment.voice) {
        return segment;
      }
      const seconds = await getAudioDurationInSeconds(staticFile(segment.voice));
      return { ...segment, duration: seconds + segment.voicePadding };
    }),
  );
  const seconds = segments.reduce((sum, segment) => sum + segment.duration, 0);

  return {
    durationInFrames: Math.round(seconds * VIDANTA_FAMILIA_FPS),
    props: { ...props, segments },
  };
};

/**
 * "Un día en familia en VidantaWorld": phone footage of the resort's family
 * spaces cut to a script, one segment per line. Captions stand in for the
 * voiceover until it is recorded; the last segment is the planner's end card.
 */
export function VidantaFamilia(props: VidantaFamiliaProps) {
  const { fps, durationInFrames } = useVideoConfig();
  const slots = layoutSegments(props.segments, fps);
  const shots = layoutShots(slots, props.clips);
  const hasVoice = props.segments.some((segment) => segment.voice);
  const musicLevel = hasVoice ? props.music.underVoiceVolume : props.music.volume;
  const fadeOutFrom = durationInFrames - Math.round(props.music.fadeOut * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDeep }}>
      <Audio
        name="Música"
        src={staticFile(props.music.src)}
        trimBefore={Math.round(props.music.trimBefore * fps)}
        volume={(frame) =>
          interpolate(
            frame,
            [0, 6, fadeOutFrom, durationInFrames],
            [0, musicLevel, musicLevel, 0],
            CLAMP,
          )
        }
      />

      {shots.map((slot) => (
        <Sequence
          key={slot.key}
          name={slot.key}
          from={slot.from}
          durationInFrames={slot.length + slot.tail}
          premountFor={fps}
        >
          <ShotView slot={slot} />
        </Sequence>
      ))}

      <Scrim />

      {slots.map(({ segment, from, length }, segmentIndex) => (
        <Sequence
          key={segment.name}
          name={segment.name}
          from={from}
          durationInFrames={segment.kind === "end-card" ? undefined : length}
        >
          {segment.voice ? (
            <Audio name="Locución" src={staticFile(segment.voice)} />
          ) : null}
          {segment.kind === "end-card" ? (
            <EndCard segment={segment} endCard={props.endCard} />
          ) : (
            <>
              {segment.chapter ? <ChapterMark text={segment.chapter} /> : null}
              <Captions
                segment={segment}
                length={length}
                isOpening={segmentIndex === 0}
              />
            </>
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function ShotView({ slot }: { slot: ShotSlot }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sourceFrames = (slot.shot.to - slot.shot.from) * fps;

  return (
    <AbsoluteFill
      style={{
        opacity: slot.isDissolvingIn ? interpolate(frame, [0, CROSSFADE], [0, 1], CLAMP) : 1,
      }}
    >
      <Video
        src={staticFile(slot.clip.src)}
        trimBefore={Math.round((slot.shot.from - slot.clip.sourceOffset) * fps)}
        playbackRate={sourceFrames / slot.length}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
}

/** Lifts the captions off bright daytime footage without a visible box. */
function Scrim() {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(4, 18, 14, 0.42) 0px, rgba(4, 18, 14, 0.2) 300px, rgba(4, 18, 14, 0) 480px, rgba(4, 18, 14, 0) 980px, rgba(4, 18, 14, 0.46) 1280px, rgba(4, 18, 14, 0.56) 1520px, rgba(4, 18, 14, 0.32) 1920px)",
      }}
    />
  );
}

/** "3 · Alberca infantil": the number set in the sans, the space in the serif. */
function ChapterMark({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const holdUntil = Math.round(CHAPTER_HOLD * fps);
  const progress = interpolate(
    frame,
    [6, 20, holdUntil, holdUntil + 12],
    [0, 1, 1, 0],
    CLAMP,
  );
  const separatorIndex = text.indexOf(CHAPTER_SEPARATOR);
  const number = separatorIndex >= 0 ? text.slice(0, separatorIndex) : null;
  const name = separatorIndex >= 0 ? text.slice(separatorIndex + CHAPTER_SEPARATOR.length) : text;

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top + 40,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: progress,
        translate: `${(1 - progress) * -16}px 0px`,
      }}
    >
      <div style={{ width: 44, height: 2, backgroundColor: COLORS.bronze }} />
      {number ? (
        <div
          style={{
            fontFamily: poppins,
            fontWeight: 600,
            fontSize: 34,
            color: COLORS.cream,
            textShadow: CHAPTER_SHADOW,
          }}
        >
          {number}
          <span style={{ color: COLORS.bronze }}>{CHAPTER_SEPARATOR.trimEnd()}</span>
        </div>
      ) : null}
      <div
        style={{
          fontFamily: lora,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 42,
          color: COLORS.cream,
          textShadow: CHAPTER_SHADOW,
        }}
      >
        {name}
      </div>
    </div>
  );
}

interface CaptionsProps {
  segment: VidantaFamiliaSegment;
  length: number;
  /** The hook is already set on frame 0, with no fade in. */
  isOpening: boolean;
}

function Captions({ segment, length, isOpening }: CaptionsProps) {
  const frame = useCurrentFrame();
  const lengths = splitFrames(
    length,
    segment.chunks.map((chunk) => chunk.length),
  );
  const starts = lengths.map((_, index) =>
    lengths.slice(0, index).reduce((sum, value) => sum + value, 0),
  );
  const index = starts.filter((start) => frame >= start).length - 1;
  if (index < 0) {
    return null;
  }

  const since = frame - starts[index];
  const chunkLength = lengths[index];
  const enter =
    isOpening && index === 0
      ? 1
      : interpolate(since, [0, CHUNK_IN], [0, 1], { ...CLAMP, easing: EASE });
  const exit = interpolate(since, [chunkLength - CHUNK_OUT, chunkLength], [1, 0], CLAMP);
  const { isEmphasized } = segment;

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.right,
        bottom: SAFE.bottom + 40,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        opacity: Math.min(enter, exit),
        translate: `0px ${(1 - enter) * 18}px`,
      }}
    >
      <div style={{ width: 56, height: 3, backgroundColor: COLORS.bronze }} />
      <div
        style={{
          fontFamily: isEmphasized ? lora : poppins,
          fontWeight: isEmphasized ? 600 : 500,
          fontSize: isEmphasized ? 74 : 60,
          lineHeight: isEmphasized ? 1.14 : 1.24,
          letterSpacing: isEmphasized ? "-0.01em" : "0em",
          color: COLORS.cream,
          whiteSpace: "pre-line",
          textWrap: "balance",
          textShadow: TEXT_SHADOW,
        }}
      >
        {segment.chunks[index]}
      </div>
    </div>
  );
}

interface EndCardProps {
  segment: VidantaFamiliaSegment;
  endCard: VidantaFamiliaProps["endCard"];
}

function EndCard({ segment, endCard }: EndCardProps) {
  const frame = useCurrentFrame();
  const appear = (delay: number) =>
    interpolate(frame, [delay, delay + 14], [0, 1], { ...CLAMP, easing: EASE });
  const rise = (delay: number) => ({
    opacity: appear(delay),
    translate: `0px ${(1 - appear(delay)) * 20}px`,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, CARD_FADE], [0, 1], CLAMP),
        background: `radial-gradient(ellipse 90% 60% at 50% 42%, ${COLORS.forestLight} 0%, ${COLORS.forest} 55%, ${COLORS.forestDeep} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 48,
          border: `2px solid ${COLORS.bronze}`,
          opacity: 0.35,
          borderRadius: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE.right,
          right: SAFE.right,
          top: SAFE.top + 60,
          bottom: SAFE.bottom + 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...rise(6),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: lora,
              fontWeight: 600,
              fontSize: 100,
              lineHeight: 1,
              letterSpacing: "0.01em",
              color: COLORS.cream,
            }}
          >
            {endCard.title}
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: poppins,
              fontWeight: 500,
              fontSize: 25,
              letterSpacing: "0.3em",
              marginRight: "-0.3em",
              textTransform: "uppercase",
              color: COLORS.bronze,
            }}
          >
            {endCard.subtitle}
          </div>
        </div>

        <div
          style={{
            ...rise(12),
            width: 120,
            height: 2,
            backgroundColor: COLORS.bronze,
            marginTop: 56,
            marginBottom: 56,
          }}
        />

        <div
          style={{
            ...rise(16),
            fontFamily: lora,
            fontWeight: 500,
            fontSize: 60,
            lineHeight: 1.18,
            color: COLORS.cream,
            whiteSpace: "pre-line",
          }}
        >
          {segment.chunks.join("\n")}
        </div>

        <Img src={staticFile(endCard.logo)} style={{ ...rise(26), width: 460, marginTop: 84 }} />

        <div
          style={{
            ...rise(34),
            marginTop: 44,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontFamily: poppins,
            fontWeight: 400,
            fontSize: 30,
            letterSpacing: "0.02em",
            color: COLORS.cream,
            opacity: appear(34) * 0.85,
          }}
        >
          {endCard.tags.map((tag) => (
            <div key={tag}>{tag}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
