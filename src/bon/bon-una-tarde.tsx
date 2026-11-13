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
import { lora, poppins } from "./fonts";
import type { BonClip, BonProps, BonSegment, BonShot } from "./schema";

export const BON_FPS = 30;

const COLORS = {
  forest: "#04372A",
  forestDeep: "#021F17",
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
const CHAPTER_HOLD = 2.6; // seconds

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

interface SegmentSlot {
  segment: BonSegment;
  from: number;
  length: number;
}

interface ShotSlot {
  key: string;
  clip: BonClip;
  shot: BonShot;
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
function layoutSegments(segments: BonSegment[], fps: number): SegmentSlot[] {
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
function layoutShots(slots: SegmentSlot[], clips: BonProps["clips"]): ShotSlot[] {
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

interface LabelSpan {
  key: string;
  text: string;
  from: number;
  length: number;
}

/**
 * Consecutive shots with the same label share one label. Labels sit on the
 * chapter mark's row, so one that starts under a chapter mark waits for it.
 */
function layoutLabels(shots: ShotSlot[], slots: SegmentSlot[], fps: number): LabelSpan[] {
  const chapters = slots
    .filter((slot) => slot.segment.chapter)
    .map((slot) => ({ from: slot.from, to: slot.from + Math.round(CHAPTER_HOLD * fps) + 12 }));

  const spans = shots.reduce<LabelSpan[]>((merged, slot) => {
    const text = slot.shot.label;
    if (!text) {
      return merged;
    }

    const last = merged[merged.length - 1];
    if (last && last.text === text && last.from + last.length === slot.from) {
      return [
        ...merged.slice(0, -1),
        { ...last, length: slot.from + slot.length - last.from },
      ];
    }

    return [...merged, { key: slot.key, text, from: slot.from, length: slot.length }];
  }, []);

  return spans
    .map((span) => {
      const chapter = chapters.find(
        (window) => span.from < window.to && span.from + span.length > window.from,
      );
      const delay = chapter ? Math.max(0, chapter.to - span.from) : 0;
      return { ...span, from: span.from + delay, length: span.length - delay };
    })
    .filter((span) => span.length >= fps);
}

/**
 * With a voiceover, each segment runs from its `start` to the next one's, and
 * the end card holds `endHold` seconds after the voice ends. Without one, the
 * segments keep their caption-paced `duration`.
 */
export const calculateBonMetadata: CalculateMetadataFunction<BonProps> = async ({
  props,
}) => {
  if (!props.voiceover) {
    const seconds = props.segments.reduce((sum, segment) => sum + segment.duration, 0);
    return { durationInFrames: Math.round(seconds * BON_FPS), props };
  }

  const voiceSeconds = await getAudioDurationInSeconds(
    staticFile(props.voiceover.src),
  );
  const end = voiceSeconds + props.voiceover.endHold;
  if (props.segments[0].start !== 0) {
    throw new Error("The first segment must start at 0 when there is a voiceover");
  }

  const segments = props.segments.map((segment, index) => {
    const nextStart = index + 1 < props.segments.length
      ? props.segments[index + 1].start
      : end;
    if (segment.start === undefined || nextStart === undefined) {
      throw new Error(`Segment "${segment.name}" needs a start for the voiceover`);
    }
    return { ...segment, duration: nextStart - segment.start };
  });

  return {
    durationInFrames: Math.round(end * BON_FPS),
    props: { ...props, segments },
  };
};

/**
 * "Una tarde en BON": phone footage from BON's Private Soft Opening cut to the
 * planner's voiceover, one segment per line, with her words as captions. The
 * last segment is the planner's end card.
 */
export function BonUnaTarde(props: BonProps) {
  const { fps, durationInFrames } = useVideoConfig();
  const slots = layoutSegments(props.segments, fps);
  const shots = layoutShots(slots, props.clips);
  const labels = layoutLabels(shots, slots, fps);
  const { music, voiceover } = props;
  const fadeOutFrom = durationInFrames - Math.round(music.fadeOut * fps);
  const voiceEnd = voiceover
    ? durationInFrames - Math.round(voiceover.endHold * fps)
    : fadeOutFrom - 2;
  const swellFrom = Math.min(voiceEnd, fadeOutFrom - 2);
  const musicLevel = voiceover ? music.underVoiceVolume : music.volume;
  const endLevel = voiceover ? music.endCardVolume : music.volume;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.forestDeep }}>
      <Audio
        name="Música"
        src={staticFile(music.src)}
        trimBefore={Math.round(music.trimBefore * fps)}
        volume={(frame) =>
          interpolate(
            frame,
            [0, 6, swellFrom, Math.min(swellFrom + 15, fadeOutFrom - 1), fadeOutFrom, durationInFrames],
            [0, musicLevel, musicLevel, endLevel, endLevel, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      {voiceover ? (
        <Audio name="Locución" src={staticFile(voiceover.src)} />
      ) : null}

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

      {labels.map((label) => (
        <Sequence
          key={label.key}
          name={`Etiqueta: ${label.text}`}
          from={label.from}
          durationInFrames={label.length}
        >
          <LocationLabel text={label.text} length={label.length} />
        </Sequence>
      ))}

      {slots.map(({ segment, from, length }, segmentIndex) => (
        <Sequence
          key={segment.name}
          name={segment.name}
          from={from}
          durationInFrames={segment.kind === "end-card" ? undefined : length}
        >
          {segment.kind === "end-card" ? (
            <EndCard
              segment={segment}
              plannerName={props.plannerName}
              logo={props.endCard.logo}
              tags={props.endCard.tags}
            />
          ) : (
            <>
              {segment.chapter ? <ChapterMark text={segment.chapter} /> : null}
              <Captions
                segment={segment}
                length={length}
                isOpening={segmentIndex === 0}
                isVoiced={Boolean(voiceover)}
                plannerName={props.plannerName}
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
        opacity: slot.isDissolvingIn
          ? interpolate(frame, [0, CROSSFADE], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1,
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

/** Lifts the captions off bright footage without a visible box. */
function Scrim() {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(4, 18, 14, 0.32) 0px, rgba(4, 18, 14, 0) 400px, rgba(4, 18, 14, 0) 1000px, rgba(4, 18, 14, 0.42) 1300px, rgba(4, 18, 14, 0.5) 1520px, rgba(4, 18, 14, 0.3) 1920px)",
      }}
    />
  );
}

function ChapterMark({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const holdUntil = Math.round(CHAPTER_HOLD * fps);
  const progress = interpolate(frame, [6, 20, holdUntil, holdUntil + 12], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      <div
        style={{
          fontFamily: lora,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 40,
          color: COLORS.cream,
          textShadow: "0 2px 14px rgba(0, 0, 0, 0.55)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Fills in the planner's name, kept as a prop so it is easy to correct. */
function fillText(text: string, plannerName: string): string {
  return text.replace(/\{plannerName\}/g, plannerName);
}

/**
 * Frame each chunk appears at, from the segment's start. Voiced chunks
 * appear as she starts saying them; otherwise each gets a share of the
 * segment proportional to its length.
 */
function chunkStarts(
  segment: BonSegment,
  length: number,
  fps: number,
  isVoiced: boolean,
): number[] {
  const { start } = segment;
  const isTimed =
    isVoiced &&
    start !== undefined &&
    segment.chunks.every((chunk) => chunk.at !== undefined);

  if (isTimed) {
    return segment.chunks.map((chunk) =>
      Math.min(Math.max(Math.round(((chunk.at ?? start) - start) * fps), 0), length - 1),
    );
  }

  const lengths = splitFrames(
    length,
    segment.chunks.map((chunk) => chunk.text.length),
  );
  return lengths.map((_, index) =>
    lengths.slice(0, index).reduce((sum, value) => sum + value, 0),
  );
}

interface LocationLabelProps {
  text: string;
  /** Frames the labelled shots stay on screen. */
  length: number;
}

/** Names what is on screen, on the chapter mark's row. */
function LocationLabel({ text, length }: LocationLabelProps) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [4, 16, length - 10, length], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top + 48,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: progress,
        translate: `${(1 - progress) * -12}px 0px`,
      }}
    >
      <div style={{ width: 28, height: 2, backgroundColor: COLORS.bronze }} />
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: COLORS.cream,
          textShadow: "0 2px 6px rgba(0, 0, 0, 0.75), 0 0 22px rgba(0, 0, 0, 0.55)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

interface CaptionsProps {
  segment: BonSegment;
  length: number;
  /** The hook is already set on frame 0, with no fade in. */
  isOpening: boolean;
  isVoiced: boolean;
  plannerName: string;
}

function Captions({ segment, length, isOpening, isVoiced, plannerName }: CaptionsProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starts = chunkStarts(segment, length, fps, isVoiced).map((start, index) =>
    isOpening && index === 0 ? 0 : start,
  );
  const index = starts.filter((start) => frame >= start).length - 1;
  if (index < 0) {
    return null;
  }

  const chunkLength = (starts[index + 1] ?? length) - starts[index];
  const since = frame - starts[index];
  const enter =
    isOpening && index === 0
      ? 1
      : interpolate(since, [0, CHUNK_IN], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE,
        });
  const exit = interpolate(since, [chunkLength - CHUNK_OUT, chunkLength], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isEmphasized = segment.isEmphasized;

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
          textShadow:
            "0 2px 4px rgba(0, 0, 0, 0.35), 0 4px 22px rgba(0, 0, 0, 0.55)",
        }}
      >
        {fillText(segment.chunks[index].text, plannerName)}
      </div>
    </div>
  );
}

interface EndCardProps {
  segment: BonSegment;
  plannerName: string;
  logo: string;
  tags: string[];
}

function EndCard({ segment, plannerName, logo, tags }: EndCardProps) {
  const frame = useCurrentFrame();
  const appear = (delay: number) =>
    interpolate(frame, [delay, delay + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    });
  const rise = (delay: number) => ({
    opacity: appear(delay),
    translate: `0px ${(1 - appear(delay)) * 20}px`,
  });

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, CARD_FADE], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        background: `radial-gradient(ellipse 90% 60% at 50% 42%, #0A4A39 0%, ${COLORS.forest} 55%, ${COLORS.forestDeep} 100%)`,
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
        <div style={{ ...rise(6), display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: lora,
              fontWeight: 600,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: "0.16em",
              marginRight: "-0.16em",
              color: COLORS.cream,
            }}
          >
            BON
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: poppins,
              fontWeight: 500,
              fontSize: 26,
              letterSpacing: "0.42em",
              marginRight: "-0.42em",
              color: COLORS.bronze,
            }}
          >
            LUXURY THEME PARK
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
            fontSize: 62,
            lineHeight: 1.18,
            color: COLORS.cream,
            whiteSpace: "pre-line",
          }}
        >
          {segment.chunks
            .map((chunk) => fillText(chunk.text, plannerName))
            .join("\n")}
        </div>

        <Img
          src={staticFile(logo)}
          style={{ ...rise(26), width: 460, marginTop: 84 }}
        />

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
          {tags.map((tag) => (
            <div key={tag}>{tag}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
