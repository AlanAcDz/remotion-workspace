import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Interactive,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BeatPane } from "../template/components/beat-pane";
import { CaptionTrack } from "../template/components/caption-track";
import { MusicBed } from "../template/components/music-bed";
import { SfxCues } from "../template/components/sfx-cues";
import "../template/fonts";
import { captionsFileFor, type Pane } from "../template/schema";
import { CtaScene } from "../template/scenes/cta-scene";
import { THEMES } from "../template/theme";
import { caveat } from "./fonts";
import type { PhotoOverlay, PhotoScene, PhotoStoryProps } from "./schema";

const COLORS = {
  ink: "#1F1A17",
  tomato: "#E44D2E",
} as const;

const CTA_FADE = 8;
const CARD_ENTER = 9;

/**
 * "La Libreta" and the short loops: a real-looking photo owns the first frame
 * — no logo, no UI — and the story is written on it (a ballpoint hand, a red
 * loop) or said over it (speech bubbles). The app arrives later as a card over
 * the dimmed photo, then PosDemo's end card, or nothing at all for a loop.
 */
export function PhotoStory(props: PhotoStoryProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = (seconds: number) => Math.round(seconds * fps);
  const ctaFrom = props.cta ? sec(props.cta.from) : durationInFrames;

  // Writing on the paper rides the active scene's push-in.
  const active =
    props.scenes.find(
      (scene) => frame >= sec(scene.from) && frame < sec(scene.to),
    ) ?? props.scenes[props.scenes.length - 1];
  const paperZoom = zoomStyle(active, frame - sec(active.from), fps);

  const isOn = (overlay: PhotoOverlay) =>
    frame >= sec(overlay.from) &&
    (overlay.until === undefined || frame < sec(overlay.until));
  const paper = props.overlays.filter(
    (overlay) => overlay.type === "hand" || overlay.type === "circle",
  );
  const floating = props.overlays.filter(
    (overlay) =>
      overlay.type === "bubble" ||
      overlay.type === "pill" ||
      overlay.type === "title",
  );

  return (
    <AbsoluteFill name="PhotoStory" style={{ backgroundColor: COLORS.ink }}>
      <Audio name="Locución" src={staticFile(props.audioFile)} />
      {props.music ? (
        <MusicBed music={props.music} ctaFrom={ctaFrom} />
      ) : null}
      <SfxCues cues={props.sfx} />

      {props.scenes.map((scene) => (
        <Sequence
          key={scene.name}
          name={scene.name}
          from={sec(scene.from)}
          durationInFrames={sec(scene.to) - sec(scene.from)}
        >
          <SceneView scene={scene} />
        </Sequence>
      ))}

      <AbsoluteFill name="Sobre el papel" style={paperZoom}>
        {paper.map((overlay, index) =>
          isOn(overlay) ? (
            <OverlayView
              key={`paper-${index}`}
              overlay={overlay}
              since={frame - sec(overlay.from)}
              fps={fps}
            />
          ) : null,
        )}
      </AbsoluteFill>
      {floating.map((overlay, index) =>
        isOn(overlay) ? (
          <OverlayView
            key={`floating-${index}`}
            overlay={overlay}
            since={frame - sec(overlay.from)}
            fps={fps}
          />
        ) : null,
      )}

      <CaptionTrack
        captionsFile={captionsFileFor(props.audioFile)}
        visibleFrom={sec(props.captions.from)}
        visibleUntil={sec(props.captions.until)}
        style="video"
      />

      {props.cta ? (
        <Sequence name="CTA" from={ctaFrom}>
          <AbsoluteFill
            style={{
              backgroundColor: THEMES["punto-listo"].colors.background,
              opacity: interpolate(frame - ctaFrom, [0, CTA_FADE], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <CtaScene cta={props.cta} />
          </AbsoluteFill>
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
}

function zoomStyle(
  scene: PhotoScene,
  sceneFrame: number,
  fps: number,
): React.CSSProperties {
  const length = Math.max(1, Math.round((scene.to - scene.from) * fps));
  const scale = interpolate(
    sceneFrame,
    [0, length],
    [scene.zoom.from, scene.zoom.to],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return {
    scale: String(scale),
    transformOrigin: `${scene.zoom.originX * 100}% ${scene.zoom.originY * 100}%`,
  };
}

function SceneView({ scene }: { scene: PhotoScene }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <AbsoluteFill style={zoomStyle(scene, frame, fps)}>
        <Img
          src={staticFile(scene.photo)}
          style={{
            width: 1080,
            height: 1920,
            objectFit: "cover",
            maxWidth: "none",
            filter: scene.blur > 0 ? `blur(${scene.blur}px)` : undefined,
          }}
        />
      </AbsoluteFill>
      {scene.dim > 0 ? (
        <AbsoluteFill
          style={{ backgroundColor: `rgba(20, 16, 14, ${scene.dim})` }}
        />
      ) : null}
      {scene.card ? <CardView card={scene.card} /> : null}
    </AbsoluteFill>
  );
}

function CardView({ card }: { card: NonNullable<PhotoScene["card"]> }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const height = Math.round((card.width * card.crop.height) / card.crop.width);
  const scale = card.width / card.crop.width;
  const enter = interpolate(frame, [0, CARD_ENTER], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const pane: Pane = {
    clip: card.clip,
    still: card.still,
    trimBefore: card.trimBefore,
    playbackRate: 1,
    zoomStart: 0,
    frame: {
      x: card.crop.left / card.source.width,
      y: card.crop.top / card.source.height,
      width: card.crop.width / card.source.width,
      height: card.crop.height / card.source.height,
    },
  };

  const ring = card.ring;
  const ringAt = ring ? Math.round(ring.at * fps) : 0;
  const ringIn = ring
    ? interpolate(frame, [ringAt, ringAt + 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.8)),
      })
    : 0;

  return (
    <Interactive.Div
      name="Tarjeta de la app"
      style={{
        position: "absolute",
        left: (1080 - card.width) / 2,
        top: card.top,
        width: card.width,
        height,
        borderRadius: 40,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 40px 90px rgba(0, 0, 0, 0.5)",
        opacity: enter,
        translate: `0px ${(1 - enter) * 160}px`,
        scale: String(interpolate(enter, [0, 1], [0.94, 1])),
      }}
    >
      <BeatPane pane={pane} containerWidth={card.width} containerHeight={height} />
      {ring ? (
        <div
          style={{
            position: "absolute",
            left: (ring.left - card.crop.left) * scale,
            top: (ring.top - card.crop.top) * scale,
            width: ring.width * scale,
            height: ring.height * scale,
            borderRadius: 24,
            border: `7px solid ${COLORS.tomato}`,
            boxShadow: `0 0 0 9999px rgba(31, 26, 23, ${ringIn * 0.18})`,
            opacity: ringIn,
            scale: String(interpolate(ringIn, [0, 1], [1.12, 1])),
          }}
        />
      ) : null}
    </Interactive.Div>
  );
}

interface OverlayViewProps {
  overlay: PhotoOverlay;
  /** Frames since the overlay's `from`. */
  since: number;
  fps: number;
}

function OverlayView({ overlay, since, fps }: OverlayViewProps) {
  switch (overlay.type) {
    case "hand":
      return <Handwriting overlay={overlay} since={since} fps={fps} />;
    case "circle":
      return <HandCircle overlay={overlay} since={since} fps={fps} />;
    case "bubble":
      return <SpeechBubble overlay={overlay} since={since} />;
    case "pill":
      return <CtaPill overlay={overlay} since={since} />;
    case "title":
      return <TitleBand overlay={overlay} since={since} />;
    default:
      return null;
  }
}

type Of<T extends PhotoOverlay["type"]> = Extract<PhotoOverlay, { type: T }>;

/** Revealed left to right, as fast as the pen moves. */
function Handwriting({
  overlay,
  since,
  fps,
}: {
  overlay: Of<"hand">;
  since: number;
  fps: number;
}) {
  const frames = Math.round(overlay.write * fps);
  const progress =
    frames === 0 || overlay.from === 0
      ? 1
      : interpolate(since, [0, frames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        position: "absolute",
        left: overlay.x,
        top: overlay.y,
        fontFamily: caveat,
        fontSize: overlay.size,
        fontWeight: 700,
        lineHeight: 1,
        color: overlay.color,
        whiteSpace: "pre",
        // Caveat's last glyphs overhang their advance width; the padding keeps
        // them inside the box the reveal clips to.
        padding: "0 0.3em 0 0.1em",
        rotate: `${overlay.rotate}deg`,
        opacity: 0.92,
        mixBlendMode: "multiply",
        clipPath: `inset(-20% ${(1 - progress) * 100}% -20% -5%)`,
      }}
    >
      {overlay.text}
    </div>
  );
}

/** A loop and a bit, slightly wobbly, drawn in `draw` seconds. */
function HandCircle({
  overlay,
  since,
  fps,
}: {
  overlay: Of<"circle">;
  since: number;
  fps: number;
}) {
  const turns = 1.15;
  const steps = 90;
  const rx = overlay.width / 2;
  const ry = overlay.height / 2;
  const points = Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const angle = -Math.PI * 0.6 + t * turns * Math.PI * 2;
    // The second pass drifts outward, like a pen that does not close neatly.
    const wobble = 1 + 0.05 * Math.sin(angle * 3) + t * 0.08;
    return [
      rx + 14 + Math.cos(angle) * rx * wobble,
      ry + 14 + Math.sin(angle) * ry * wobble,
    ];
  });
  const length = points.reduce((sum, [x, y], index) => {
    if (index === 0) {
      return 0;
    }
    const [px, py] = points[index - 1];
    return sum + Math.hypot(x - px, y - py);
  }, 0);
  const d = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const frames = Math.round(overlay.draw * fps);
  const progress = interpolate(since, [0, Math.max(1, frames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <svg
      width={overlay.width * 1.3 + 28}
      height={overlay.height * 1.3 + 28}
      style={{
        position: "absolute",
        left: overlay.x - rx - 14,
        top: overlay.y - ry - 14,
        overflow: "visible",
        mixBlendMode: "multiply",
      }}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={overlay.color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
        opacity={0.9}
      />
    </svg>
  );
}

function popIn(since: number, isAlreadyThere: boolean): number {
  if (isAlreadyThere) {
    return 1;
  }
  return interpolate(since, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });
}

function SpeechBubble({
  overlay,
  since,
}: {
  overlay: Of<"bubble">;
  since: number;
}) {
  const progress = popIn(since, overlay.from === 0);
  const isLeft = overlay.side === "left";

  return (
    <div
      style={{
        position: "absolute",
        left: overlay.x,
        top: overlay.y,
        transformOrigin: isLeft ? "0% 100%" : "100% 100%",
        scale: String(progress),
        opacity: Math.min(1, progress * 1.5),
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "30px 46px",
          borderRadius: 48,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.35)",
          fontFamily: "Archivo",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: COLORS.ink,
          whiteSpace: "pre",
        }}
      >
        {overlay.text}
        <svg
          width={60}
          height={44}
          viewBox="0 0 60 44"
          style={{
            position: "absolute",
            bottom: -34,
            [isLeft ? "left" : "right"]: 54,
            scale: isLeft ? "1 1" : "-1 1",
          }}
          aria-hidden
        >
          <path d="M0 0h50L8 44z" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
}

function CtaPill({ overlay, since }: { overlay: Of<"pill">; since: number }) {
  const progress = popIn(since, overlay.from === 0);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: overlay.y,
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
          fontFamily: "Archivo",
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          boxShadow: "0 18px 40px rgba(228, 77, 46, 0.4)",
        }}
      >
        {overlay.text}
      </div>
    </div>
  );
}

/** "a *b c* d" → runs, with the starred ones painted tomato. */
function accentRuns(text: string): { text: string; isAccent: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) => {
      const isAccent = part.startsWith("*") && part.endsWith("*");
      return { text: isAccent ? part.slice(1, -1) : part, isAccent };
    });
}

function TitleBand({ overlay, since }: { overlay: Of<"title">; since: number }) {
  const progress = overlay.animate ? popIn(since, overlay.from === 0) : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: overlay.y,
        display: "flex",
        justifyContent: "center",
        opacity: Math.min(1, progress * 1.5),
        translate: `0px ${(1 - progress) * 40}px`,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 960,
          padding: overlay.kicker ? "52px 48px 34px" : "34px 48px",
          borderRadius: 36,
          backgroundColor: "#F7F4EF",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
          fontFamily: "Archivo",
          fontSize: overlay.size,
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: COLORS.ink,
          textAlign: "center",
          whiteSpace: "pre-line",
        }}
      >
        {overlay.kicker ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              translate: "-50% -50%",
              padding: "10px 26px",
              borderRadius: 999,
              backgroundColor: COLORS.tomato,
              color: "#FFFFFF",
              fontSize: 34,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {overlay.kicker}
          </div>
        ) : null}
        {accentRuns(overlay.text).map((run, index) => (
          <span
            key={index}
            style={{ color: run.isAccent ? COLORS.tomato : undefined }}
          >
            {run.text}
          </span>
        ))}
      </div>
    </div>
  );
}
