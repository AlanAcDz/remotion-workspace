import { Video } from "@remotion/media";
import {
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mapPoint, type Box, type View } from "../layout";
import type { Cue, Point, Shot } from "../scenes";
import { ASSETS, beats, COLORS, type Lang, type Platform } from "../schema";

const SHOT_FADE = 6;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

interface ScreenCardProps {
  box: Box;
  radius: number;
  view: View;
  shots: Shot[];
  cues: Cue[];
  bursts: (Point & { at: number })[];
  platform: Platform;
  lang: Lang;
  /** 0 by day, 1 at night: the shadow turns into a soft glow. */
  night: number;
  style: React.CSSProperties;
}

/**
 * Real app footage in a floating, rounded screen card with a soft shadow
 * (no device frame, per App Store guideline 2.3.4). Taps and beats are
 * marked with overlay rings; nothing here draws app UI.
 */
export function ScreenCard({
  box,
  radius,
  view,
  shots,
  cues,
  bursts,
  platform,
  lang,
  night,
  style,
}: ScreenCardProps) {
  const scale = box.width / 760;

  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          border: `${Math.round(4 * scale)}px solid rgba(255, 255, 255, 0.85)`,
          boxShadow: `0 ${30 * scale}px ${80 * scale}px rgba(41, 54, 41, ${0.22 * (1 - night)}), 0 0 ${90 * scale}px rgba(57, 172, 172, ${0.35 * night})`,
        }}
      >
        {shots.map((shot, index) => (
          <ShotLayer
            key={index}
            shot={shot}
            nextAt={shots[index + 1]?.at}
            isFirst={index === 0}
            view={view}
            platform={platform}
            lang={lang}
          />
        ))}
        {cues.map((cue, index) => (
          <CueRing key={index} cue={cue} view={view} scale={scale} />
        ))}
      </div>
      {bursts.map((burst, index) => (
        <CheckBurst key={index} at={burst.at} center={mapPoint(burst, view)} scale={scale} />
      ))}
    </div>
  );
}

function shotSrc(shot: Shot, platform: Platform, lang: Lang) {
  return `${ASSETS}/clips/${platform}/${lang}/${shot.clip}.mp4`;
}

interface ShotLayerProps {
  shot: Shot;
  nextAt?: number;
  isFirst: boolean;
  view: View;
  platform: Platform;
  lang: Lang;
}

function ShotLayer({ shot, nextAt, isFirst, view, platform, lang }: ShotLayerProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = beats(shot.at);
  const end = nextAt === undefined ? Infinity : beats(nextAt) + SHOT_FADE;

  if (frame < start || frame >= end) {
    return null;
  }

  const opacity = isFirst ? 1 : interpolate(frame, [start, start + SHOT_FADE], [0, 1], CLAMP);
  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    maxWidth: "none",
    left: view.x,
    top: view.y,
    width: view.width,
    height: view.height,
    opacity,
  };
  const src = staticFile(shotSrc(shot, platform, lang));

  return (
    <Sequence from={start} layout="none">
      <Video
        src={src}
        trimBefore={Math.round(shot.trimBefore * fps)}
        objectFit="fill"
        muted
        style={mediaStyle}
      />
    </Sequence>
  );
}

const CUE_FRAMES = 26;

function CueRing({ cue, view, scale }: { cue: Cue; view: View; scale: number }) {
  const frame = useCurrentFrame();
  const local = frame - beats(cue.at);

  if (local < 0 || local > CUE_FRAMES + 10) {
    return null;
  }

  const { x, y } = mapPoint(cue, view);
  const grow = interpolate(local, [0, CUE_FRAMES], [0, 1], CLAMP);
  const ease = 1 - (1 - grow) ** 3;
  const fade = interpolate(local, [CUE_FRAMES * 0.35, CUE_FRAMES], [1, 0], CLAMP);
  const isTap = cue.kind === "tap";
  const isNote = cue.kind === "note";
  const radius = (isTap ? 22 + 46 * ease : isNote ? 26 + 50 * ease : 24 + 30 * ease) * scale;
  const press = isTap ? interpolate(local, [0, 4, 12], [0, 1, 0], CLAMP) : 0;

  return (
    <>
      {isTap ? (
        <div
          style={{
            position: "absolute",
            left: x - 30 * scale,
            top: y - 30 * scale,
            width: 60 * scale,
            height: 60 * scale,
            borderRadius: "50%",
            backgroundColor: "rgba(57, 172, 172, 0.35)",
            border: `${3 * scale}px solid rgba(255, 255, 255, 0.9)`,
            opacity: press,
            transform: `scale(${0.7 + 0.3 * press})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: "50%",
          border: `${(isNote ? 7 : 5) * scale}px solid ${COLORS.accent}`,
          backgroundColor: isNote ? "rgba(57, 172, 172, 0.14)" : "transparent",
          opacity: fade * (cue.kind === "pulse" ? 0.7 : 1),
        }}
      />
      {isNote ? <MusicNote local={local} x={x} y={y} scale={scale} seed={cue.fx + cue.fy} /> : null}
    </>
  );
}

function MusicNote({
  local,
  x,
  y,
  scale,
  seed,
}: {
  local: number;
  x: number;
  y: number;
  scale: number;
  seed: number;
}) {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: local, fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
  const rise = interpolate(local, [0, 34], [0, 1], CLAMP);
  const fade = interpolate(local, [20, 34], [1, 0], CLAMP);
  const drift = (seed * 1000) % 2 > 1 ? 1 : -1;
  const size = 54 * scale;

  return (
    <svg
      viewBox="0 0 24 30"
      width={size}
      height={size * 1.25}
      style={{
        position: "absolute",
        left: x + drift * 34 * scale - size / 2,
        top: y - 70 * scale - rise * 70 * scale - size,
        opacity: fade,
        transform: `scale(${pop}) rotate(${drift * 12 * rise}deg)`,
        overflow: "visible",
        filter: "drop-shadow(0 3px 6px rgba(41, 54, 41, 0.25))",
      }}
    >
      <ellipse cx="8" cy="24" rx="6.5" ry="5" fill={COLORS.accent} transform="rotate(-22 8 24)" />
      <rect x="12.6" y="3" width="2.8" height="21" rx="1.2" fill={COLORS.accent} />
      <path d="M14 3 C 19 5, 23 8, 21 15 C 20 11, 17 9.5, 14 9 Z" fill={COLORS.accent} />
    </svg>
  );
}

const BURST_COUNT = 9;

/** A burst of teal checkmarks from the point the user just tapped. */
function CheckBurst({ at, center, scale }: { at: number; center: { x: number; y: number }; scale: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - beats(at);

  if (local < 0 || local > 40) {
    return null;
  }

  const fly = spring({ frame: local, fps, config: { damping: 14, stiffness: 120, mass: 0.7 } });
  const fade = interpolate(local, [20, 38], [1, 0], CLAMP);

  return (
    <>
      {Array.from({ length: BURST_COUNT }, (_, index) => {
        const angle = (index / BURST_COUNT) * Math.PI * 2 - Math.PI / 2 + 0.3;
        const distance = (150 + (index % 3) * 45) * scale * fly;
        const size = (index % 2 === 0 ? 58 : 44) * scale;

        return (
          <CheckBadge
            key={index}
            size={size}
            x={center.x + Math.cos(angle) * distance}
            y={center.y + Math.sin(angle) * distance}
            opacity={fade}
            scale={fly}
            rotate={(index % 2 === 0 ? -1 : 1) * 14 * fly}
          />
        );
      })}
    </>
  );
}

function CheckBadge({
  size,
  x,
  y,
  opacity,
  scale,
  rotate,
}: {
  size: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  rotate: number;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        filter: "drop-shadow(0 4px 8px rgba(41, 54, 41, 0.22))",
      }}
    >
      <circle cx="20" cy="20" r="19" fill={COLORS.accent} stroke="#FFFFFF" strokeWidth="2.5" />
      <path
        d="M11.5 20.5 L17.5 26.5 L28.5 14"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
