import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, EndCard, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";

/** Every shot of the format is a 3:4 portrait original: height over width. */
const PHOTO_ASPECT = 4 / 3;
const CROSSFADE = 5; // frames
const WORD_FADE = 5; // frames
const LINE_TOP = 1210;

export interface NoSabeShot {
  from: number;
  src: string;
  /** Top-left corner and width of the opening crop, as fractions of the photo. */
  crop: { x: number; y: number; width: number };
  /** The point the push-in moves toward, as fractions of the photo. */
  focus: { x: number; y: number };
}

export interface NoSabeLine {
  from: number;
  text: string;
  /** Top of the text box; defaults to the flipbook's line position. */
  top?: number;
  /** Frames of word arrival already elapsed when the line appears. */
  lead?: number;
}

export type NoSabeProps = {
  /** Ordered by `from`, in seconds; the first starts at 0. */
  shots: NoSabeShot[];
  /** The closing clip, played from its first frame after the last shot. */
  clip: { from: number; src: string };
  lines: NoSabeLine[];
  /** Frames between one word and the next. */
  wordGap: number;
  /** Scale every shot reaches by the time the next one takes over. */
  push: number;
  cta: PosDemoProps["cta"];
  /** Drawn here instead of `cta.note`; `\n` sets the break. */
  ctaNote: string;
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "No sabe": one photo per line, a slow push-in, words arriving one at a time. */
export function NoSabe(props: NoSabeProps) {
  const sec = useSeconds();
  const { durationInFrames } = useVideoConfig();
  const { shots, clip, lines, cta } = props;
  const shotEnds = [...shots.slice(1).map((shot) => shot.from), clip.from];
  const lineEnds = [...lines.slice(1).map((line) => line.from), cta.from];

  return (
    <ShortFrame background="#111111" music={props.music} duckAt={cta.from} sfx={props.sfx}>
      {shots.map((shot, index) => (
        <Sequence
          key={shot.src}
          name={`Foto ${index + 1}`}
          from={sec(shot.from)}
          durationInFrames={sec(shotEnds[index] - shot.from) + CROSSFADE}
        >
          <Shot shot={shot} push={props.push} fadesIn={index > 0} />
        </Sequence>
      ))}
      <Sequence name="Abrazo" from={sec(clip.from)}>
        <Clip src={clip.src} />
      </Sequence>

      {lines.map((line, index) => (
        <Sequence
          key={line.text}
          name={line.text}
          from={sec(line.from)}
          durationInFrames={sec(lineEnds[index] - line.from)}
        >
          <Line line={line} wordGap={props.wordGap} />
        </Sequence>
      ))}

      {sec(cta.from) < durationInFrames ? <EndCard cta={cta} /> : null}
      <Sequence name="CTA nota" from={sec(cta.from)}>
        <CtaNote text={props.ctaNote} revealAt={sec(cta.revealAt.note - cta.from)} />
      </Sequence>
    </ShortFrame>
  );
}

function Shot({ shot, push, fadesIn }: { shot: NoSabeShot; push: number; fadesIn: boolean }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const width = 1080 / shot.crop.width;
  const height = width * PHOTO_ASPECT;
  const origin = {
    x: (shot.focus.x - shot.crop.x) * width,
    y: (shot.focus.y - shot.crop.y) * height,
  };

  return (
    <AbsoluteFill
      style={{
        opacity: fadesIn ? ramp(frame, 0, CROSSFADE) : 1,
        transformOrigin: `${origin.x}px ${origin.y}px`,
        scale: String(interpolate(frame, [0, durationInFrames], [1, push])),
      }}
    >
      <Img
        src={staticFile(shot.src)}
        style={{
          position: "absolute",
          left: -shot.crop.x * width,
          top: -shot.crop.y * height,
          width,
          height,
          maxWidth: "none",
        }}
      />
    </AbsoluteFill>
  );
}

function Clip({ src }: { src: string }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ opacity: ramp(frame, 0, CROSSFADE) }}>
      <Video
        src={staticFile(src)}
        muted
        objectFit="cover"
        style={{ width: 1080, height: 1920 }}
      />
    </AbsoluteFill>
  );
}

/**
 * The flipbook's cream line, filled one word at a time. Unarrived words keep
 * their space so nothing reflows; `\n` in the text sets the break.
 */
function Line({ line, wordGap }: { line: NoSabeLine; wordGap: number }) {
  const frame = useCurrentFrame() + (line.lead ?? 0);
  const rows = line.text.split("\n").map((row) => row.split(" "));
  const rowStarts = rows.map((_, index) =>
    rows.slice(0, index).reduce((count, row) => count + row.length, 0),
  );

  return (
    <div
      style={{
        position: "absolute",
        top: line.top ?? LINE_TOP,
        ...centered(900),
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "22px 34px",
          borderRadius: 28,
          backgroundColor: ARYA.colors.background,
          color: ARYA.colors.ink,
          fontFamily: POPPINS,
          fontSize: 70,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          textAlign: "center",
          opacity: ramp(frame, 0, 3),
        }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            {row.map((word, wordIndex) => {
              const arrival = ramp(
                frame,
                (rowStarts[rowIndex] + wordIndex) * wordGap,
                (rowStarts[rowIndex] + wordIndex) * wordGap + WORD_FADE,
              );

              return (
                <span
                  key={wordIndex}
                  style={{
                    display: "inline-block",
                    marginRight: wordIndex < row.length - 1 ? "0.26em" : 0,
                    opacity: arrival,
                    translate: `0px ${interpolate(arrival, [0, 1], [14, 0])}px`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The CTA note in two smaller rows. The template's 56 px single note wraps a
 * line this long under the pill, so the card gets an empty note and this one.
 */
function CtaNote({ text, revealAt }: { text: string; revealAt: number }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 972,
        ...centered(936),
        textAlign: "center",
        whiteSpace: "pre-line",
        fontFamily: POPPINS,
        fontSize: 46,
        fontWeight: ARYA.weights.emphasis,
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        color: ARYA.colors.muted,
        opacity: ramp(frame, revealAt, revealAt + 14),
      }}
    >
      {text}
    </div>
  );
}
