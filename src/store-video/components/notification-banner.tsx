import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { NOTIFICATION } from "../copy";
import { ASSETS, beats, type Lang, type Platform } from "../schema";

const { fontFamily: roboto } = loadRoboto("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

interface NotificationBannerProps {
  lang: Lang;
  platform: Platform;
  left: number;
  top: number;
  width: number;
  /** px per point/dp of the captured screen. */
  point: number;
  /** Scene-relative beat the banner lands on. */
  at: number;
  exit: number;
}

/**
 * The app's real dose reminder as an overlay (iOS or Material style), ported
 * from store-screenshots/compose.ts `buildNotification()`. It drops in big
 * and bouncy, landing on the beat.
 */
export function NotificationBanner({
  lang,
  platform,
  left,
  top,
  width,
  point,
  at,
  exit,
}: NotificationBannerProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const copy = NOTIFICATION[lang];
  const pt = (value: number) => value * point;
  const isIos = platform === "ios";

  // The drop takes ~8 frames, so it starts that early to land on the beat.
  const local = frame - beats(at) + 8;
  const drop = spring({ frame: local, fps, config: { damping: 8, stiffness: 140, mass: 0.8 } });
  const wobble = Math.sin(local / 3) * interpolate(local, [6, 30], [3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (local < 0) {
    return null;
  }

  const icon = (
    <Img
      src={staticFile(`${ASSETS}/app-icon.png`)}
      style={{
        flex: "none",
        width: pt(isIos ? 38 : 36),
        height: pt(isIos ? 38 : 36),
        borderRadius: pt(isIos ? 9 : 18),
      }}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        display: "flex",
        gap: pt(isIos ? 10 : 12),
        alignItems: isIos ? "center" : "flex-start",
        padding: `${pt(isIos ? 12 : 16)}px ${pt(isIos ? 14 : 16)}px`,
        borderRadius: pt(isIos ? 24 : 28),
        background: isIos ? "rgba(246, 246, 246, 0.97)" : "#EEF4F3",
        boxShadow: `0 ${pt(10)}px ${pt(36)}px rgba(0, 0, 0, 0.2)`,
        fontFamily: isIos ? "-apple-system, 'SF Pro Text', 'Inter', sans-serif" : `${roboto}, 'Inter', sans-serif`,
        color: "#111111",
        opacity: 1 - exit,
        transform: `translateY(${(1 - drop) * -(top + 260)}px) scale(${1 + (1 - drop) * 0.12 - exit * 0.1}) rotate(${wobble}deg)`,
      }}
    >
      {icon}
      {isIos ? (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: pt(8),
            }}
          >
            <span style={{ fontSize: pt(15), lineHeight: 1.3, fontWeight: 600 }}>{copy.title}</span>
            <span style={{ flex: "none", fontSize: pt(13), color: "#7A7F7E" }}>{copy.time}</span>
          </div>
          <div style={{ fontSize: pt(15), lineHeight: 1.3 }}>{copy.body}</div>
        </div>
      ) : (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: pt(12), color: "#48514F", marginBottom: pt(2) }}>
            {copy.app} • {copy.time}
          </div>
          <div style={{ fontSize: pt(15), lineHeight: 1.3, fontWeight: 500 }}>{copy.title}</div>
          <div style={{ fontSize: pt(15), lineHeight: 1.3 }}>{copy.body}</div>
        </div>
      )}
    </div>
  );
}
