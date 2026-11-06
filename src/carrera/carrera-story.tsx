import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Interactive,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Handwriting } from "../photo/photo-story";
import { BeatPane } from "../template/components/beat-pane";
import { CaptionTrack } from "../template/components/caption-track";
import { MusicBed } from "../template/components/music-bed";
import { SfxCues } from "../template/components/sfx-cues";
import "../template/fonts";
import { captionsFileFor, type Pane } from "../template/schema";
import type { CarreraStoryProps } from "./schema";

const COLORS = {
  ink: "#1F1A17",
  tomato: "#E44D2E",
  paperLabel: "#CFC6BC",
} as const;

const FONT = "Archivo";

/** Top to bottom. Captions own the band below `card`, as in every template. */
const LAYOUT = {
  paperHeight: 640,
  bandTop: 640,
  bandHeight: 96,
  cardTop: 736,
  cardHeight: 600,
  /** Leaves the platform's right-hand icons clear. */
  cardLeft: 30,
  cardWidth: 900,
  disclaimerTop: 1344,
} as const;

const RING_FRAMES = 8;
const WINNER_BADGE = "¡PRIMERO!";
/** The commentator peaks near 0 dBFS; this leaves headroom over the bed. */
const VOICE_LEVEL = 0.8;

/**
 * "La Carrera": the same sum on paper and in the app, side by side from frame
 * 0, so the product is on screen before anyone can scroll. Paper owns the top
 * half and the real recording the bottom, at 1×. No times on screen: the band
 * only says who got there first, because the paper half is staged. The card
 * pans to follow the action, but the footage keeps its real speed.
 */
export function CarreraStory(props: CarreraStoryProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill name="CarreraStory" style={{ backgroundColor: COLORS.ink }}>
      <Audio
        name="Narrador"
        src={staticFile(props.audioFile)}
        volume={VOICE_LEVEL}
      />
      {props.music ? (
        <MusicBed music={props.music} ctaFrom={durationInFrames} />
      ) : null}
      <SfxCues cues={props.sfx} />

      <Paper paper={props.paper} frame={frame} fps={fps} />
      <AppCard
        app={props.app}
        finishedAt={sec(props.finish.app)}
        frame={frame}
      />
      <RaceBand props={props} frame={frame} fps={fps} />
      <Title text={props.title} />

      <div
        style={{
          position: "absolute",
          left: LAYOUT.cardLeft,
          top: LAYOUT.disclaimerTop,
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 500,
          color: COLORS.paperLabel,
        }}
      >
        {props.disclaimer}
      </div>

      <CaptionTrack
        captionsFile={captionsFileFor(props.audioFile)}
        visibleFrom={sec(props.captions.from)}
        visibleUntil={sec(props.captions.until)}
        style="video"
      />
      <Pill text={props.pill.text} since={frame - sec(props.pill.from)} />
    </AbsoluteFill>
  );
}

interface PaperProps {
  paper: CarreraStoryProps["paper"];
  frame: number;
  fps: number;
}

function Paper({ paper, frame, fps }: PaperProps) {
  return (
    <Interactive.Div
      name="La libreta"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: LAYOUT.paperHeight,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile(paper.photo)}
        style={{
          position: "absolute",
          left: 0,
          top: -paper.offsetY,
          width: 1080,
          maxWidth: "none",
        }}
      />
      {paper.lines.map((line, index) =>
        frame >= Math.round(line.from * fps) ? (
          <Handwriting
            key={index}
            overlay={line}
            since={frame - Math.round(line.from * fps)}
            fps={fps}
          />
        ) : null,
      )}
    </Interactive.Div>
  );
}

interface AppCardProps {
  app: CarreraStoryProps["app"];
  finishedAt: number;
  frame: number;
}

function AppCard({ app, finishedAt, frame }: AppCardProps) {
  const { fps } = useVideoConfig();
  const isHolding = frame >= Math.round(app.holdAt * fps);

  const rect = (top: number) => ({
    x: app.left / app.source.width,
    y: top / app.source.height,
    width: app.width / app.source.width,
    height: app.height / app.source.height,
  });

  const pane: Pane = isHolding
    ? {
        clip: app.holdStill,
        still: true,
        trimBefore: 0,
        playbackRate: 1,
        frame: rect(app.to.top),
        zoomStart: 0,
      }
    : {
        clip: app.clip,
        still: false,
        trimBefore: app.trimBefore,
        playbackRate: 1,
        frame: rect(app.from.top),
        zoomTo: rect(app.to.top),
        zoomStart: app.panAt,
        zoomEnd: app.panAt + app.panFor,
      };

  const scale = LAYOUT.cardWidth / app.width;
  const ringIn = interpolate(
    frame,
    [finishedAt, finishedAt + RING_FRAMES],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.8)),
    },
  );

  return (
    <Interactive.Div
      name="Punto Listo"
      style={{
        position: "absolute",
        left: LAYOUT.cardLeft,
        top: LAYOUT.cardTop,
        width: LAYOUT.cardWidth,
        height: LAYOUT.cardHeight,
        borderRadius: 32,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
      }}
    >
      <BeatPane
        pane={pane}
        containerWidth={LAYOUT.cardWidth}
        containerHeight={LAYOUT.cardHeight}
      />
      <div
        style={{
          position: "absolute",
          left: (app.ring.left - app.left) * scale,
          top: (app.ring.top - app.to.top) * scale,
          width: app.ring.width * scale,
          height: app.ring.height * scale,
          borderRadius: 24,
          border: `8px solid ${COLORS.tomato}`,
          opacity: ringIn,
          scale: String(interpolate(ringIn, [0, 1], [1.12, 1])),
        }}
      />
    </Interactive.Div>
  );
}

interface RaceBandProps {
  props: CarreraStoryProps;
  frame: number;
  fps: number;
}

function RaceBand({ props, frame, fps }: RaceBandProps) {
  const { finish, labels } = props;
  const firstAt = Math.min(finish.paper, finish.app);
  const lane = (label: string, finishedAt: number) => (
    <Lane
      label={label}
      since={frame - Math.round(finishedAt * fps)}
      isWinner={finishedAt === firstAt}
      frame={frame}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: LAYOUT.bandTop,
        width: 1080,
        height: LAYOUT.bandHeight,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `0 ${LAYOUT.cardLeft + 6}px`,
        backgroundColor: COLORS.ink,
        fontFamily: FONT,
      }}
    >
      {lane(labels.paper, finish.paper)}
      {lane(labels.app, finish.app)}
    </div>
  );
}

interface LaneProps {
  label: string;
  /** Frames since this side finished; negative while it is still racing. */
  since: number;
  isWinner: boolean;
  frame: number;
}

/** A side's name, its dots while it races, and the badge if it won. */
function Lane({ label, since, isWinner, frame }: LaneProps) {
  const isDone = since >= 0;
  const badge = interpolate(since, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2.2)),
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <span
        style={{
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: "0.02em",
          color: isDone && isWinner ? "#FFFFFF" : COLORS.paperLabel,
        }}
      >
        {label}
      </span>
      {isDone ? null : <RacingDots frame={frame} />}
      {isDone && isWinner ? (
        <span
          style={{
            padding: "8px 22px",
            borderRadius: 999,
            backgroundColor: COLORS.tomato,
            color: "#FFFFFF",
            fontSize: 38,
            fontWeight: 800,
            scale: String(badge),
          }}
        >
          {WINNER_BADGE}
        </span>
      ) : null}
    </div>
  );
}

function RacingDots({ frame }: { frame: number }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[0, 1, 2].map((index) => {
        const lift = Math.max(0, Math.sin(((frame - index * 4) / 18) * Math.PI * 2));
        return (
          <div
            key={index}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: COLORS.paperLabel,
              opacity: 0.45 + lift * 0.55,
              translate: `0px ${-lift * 8}px`,
            }}
          />
        );
      })}
    </div>
  );
}

function Title({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 116,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "16px 34px",
          borderRadius: 22,
          backgroundColor: COLORS.ink,
          color: "#FFFFFF",
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Pill({ text, since }: { text: string; since: number }) {
  if (since < 0) {
    return null;
  }

  const progress = interpolate(since, [0, 9], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 1470,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        opacity: progress,
        scale: String(interpolate(progress, [0, 1], [0.9, 1])),
      }}
    >
      <div
        style={{
          padding: "22px 44px",
          borderRadius: 999,
          backgroundColor: COLORS.tomato,
          color: "#FFFFFF",
          fontFamily: FONT,
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {text}
      </div>
    </div>
  );
}
