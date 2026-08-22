import { Video } from "@remotion/media";
import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Pane, Rect } from "../schema";

const WHOLE_CLIP: Rect = { x: 0, y: 0, width: 1, height: 1 };

interface BeatPaneProps {
  pane: Pane;
  containerWidth: number;
  containerHeight: number;
}

/**
 * One clip framed inside its container.
 *
 * The clip is rendered oversized and offset so that `pane.frame` — a
 * normalized crop of the source — exactly fills the box. That crops *into*
 * the UI at 1.3x–1.8x instead of shrinking a whole screenshot into the frame.
 * `pane.zoomTo` animates the same four numbers to a second rect for a push-in.
 */
export function BeatPane({
  pane,
  containerWidth,
  containerHeight,
}: BeatPaneProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const box = pane.box ?? {
    left: 0,
    top: 0,
    width: containerWidth,
    height: containerHeight,
    radius: 0,
  };

  const start = pane.frame ?? WHOLE_CLIP;
  const end = pane.zoomTo ?? start;
  const hasZoom = pane.zoomTo !== undefined;

  const zoomStart = Math.round(pane.zoomStart * fps);
  const zoomEnd = Math.round(
    (pane.zoomEnd ?? (durationInFrames / fps) * 0.6) * fps,
  );

  const widthOf = (rect: Rect) => box.width / rect.width;
  const heightOf = (rect: Rect) => box.height / rect.height;

  const animate = (from: number, to: number) => {
    if (!hasZoom || zoomEnd <= zoomStart) {
      return from;
    }

    return interpolate(frame, [zoomStart, zoomEnd], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 0, 0.15, 1),
    });
  };

  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    maxWidth: "none", // Tailwind preflight caps media at 100% otherwise
    left: animate(-start.x * widthOf(start), -end.x * widthOf(end)),
    top: animate(-start.y * heightOf(start), -end.y * heightOf(end)),
    width: animate(widthOf(start), widthOf(end)),
    height: animate(heightOf(start), heightOf(end)),
  };

  const isCard = pane.box !== undefined;

  return (
    <Interactive.Div
      name={pane.clip}
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
        overflow: "hidden",
        backgroundColor: isCard ? "#FFFFFF" : "transparent",
        border: isCard ? "2px solid rgba(34, 30, 24, 0.10)" : "none",
        boxShadow: isCard ? "0 24px 48px rgba(34, 30, 24, 0.16)" : "none",
      }}
    >
      {pane.still ? (
        <Img src={staticFile(pane.clip)} style={mediaStyle} />
      ) : (
        <Video
          src={staticFile(pane.clip)}
          trimBefore={Math.round(pane.trimBefore * fps)}
          playbackRate={pane.playbackRate}
          objectFit="cover"
          style={mediaStyle}
        />
      )}
    </Interactive.Div>
  );
}
