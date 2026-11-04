import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { END_CARD } from "../copy";
import { ASSETS, beats, COLORS, type Lang, type Orientation, type Store } from "../schema";
import { fitHeadlineSize } from "./headline";

interface Friend {
  file: string;
  /** Centre in canvas px; width in px. */
  x: number;
  y: number;
  width: number;
  at: number;
  tilt: number;
}

interface EndLayout {
  icon: { x: number; y: number; size: number };
  name: { top: number; size: number };
  tagline: { top: number; width: number; maxSize: number };
  badge: { top: number; height: number };
  friends: Friend[];
}

const LAYOUT: Record<Orientation, EndLayout> = {
  portrait: {
    icon: { x: 443, y: 600, size: 300 },
    name: { top: 820, size: 150 },
    tagline: { top: 1035, width: 760, maxSize: 72 },
    badge: { top: 1260, height: 110 },
    friends: [
      { file: "multiple-pets.png", x: 190, y: 1540, width: 330, at: 0.5, tilt: -4 },
      { file: "stay-organized.png", x: 690, y: 1530, width: 300, at: 1, tilt: 4 },
      { file: "no-pending-doses.png", x: 700, y: 400, width: 230, at: 1.5, tilt: 6 },
    ],
  },
  landscape: {
    icon: { x: 960, y: 250, size: 230 },
    name: { top: 390, size: 120 },
    tagline: { top: 560, width: 900, maxSize: 64 },
    badge: { top: 770, height: 96 },
    friends: [
      { file: "multiple-pets.png", x: 360, y: 760, width: 380, at: 0.5, tilt: -4 },
      { file: "stay-organized.png", x: 1570, y: 760, width: 340, at: 1, tilt: 4 },
      { file: "no-pending-doses.png", x: 1260, y: 210, width: 220, at: 1.5, tilt: 6 },
    ],
  },
};

/** The app icon at night with the characters gathered round; Play adds the official badge. */
export function EndCard({
  lang,
  store,
  orientation,
}: {
  lang: Lang;
  store: Store;
  orientation: Orientation;
}) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const layout = LAYOUT[orientation];
  const copy = END_CARD[lang];
  const popAt = (at: number, damping = 10) =>
    spring({ frame: frame - beats(at), fps, config: { damping, stiffness: 150, mass: 0.7 } });

  const iconPop = popAt(0, 9);
  const namePop = popAt(0.5, 12);
  const taglinePop = popAt(1, 14);
  const badgePop = popAt(2, 14);
  const glow = 0.5 + 0.5 * Math.sin((frame / beats(2)) * Math.PI);
  const taglineSize = fitHeadlineSize(copy.tagline, layout.tagline.width, layout.tagline.maxSize);
  const { icon } = layout;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: icon.x - icon.size,
          top: icon.y - icon.size,
          width: icon.size * 2,
          height: icon.size * 2,
          borderRadius: "50%",
          opacity: iconPop * (0.55 + 0.25 * glow),
          background: "radial-gradient(circle, rgba(57,172,172,0.55) 0%, rgba(57,172,172,0) 65%)",
        }}
      />
      <Img
        src={staticFile(`${ASSETS}/app-icon.png`)}
        style={{
          position: "absolute",
          left: icon.x - icon.size / 2,
          top: icon.y - icon.size / 2,
          width: icon.size,
          height: icon.size,
          borderRadius: icon.size * 0.2237,
          boxShadow: `0 ${icon.size * 0.08}px ${icon.size * 0.25}px rgba(0, 0, 0, 0.35)`,
          transform: `scale(${iconPop}) rotate(${(1 - iconPop) * -20}deg)`,
        }}
      />
      {layout.friends.map((friend) => {
        const pop = popAt(friend.at, 9);
        const sway = Math.sin(((frame - beats(friend.at)) / beats(1)) * Math.PI) * 3;

        return (
          <Img
            key={friend.file}
            src={staticFile(`${ASSETS}/characters/${friend.file}`)}
            style={{
              position: "absolute",
              left: friend.x - friend.width / 2,
              top: friend.y,
              width: friend.width,
              transformOrigin: "50% 100%",
              transform: `translateY(-50%) scale(${pop}) rotate(${friend.tilt + sway * pop}deg)`,
              filter: "drop-shadow(0 12px 22px rgba(0, 0, 0, 0.3))",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          width,
          top: layout.name.top,
          textAlign: "center",
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: layout.name.size,
          lineHeight: 1.1,
          color: COLORS.cream,
          opacity: Math.min(1, namePop * 2),
          transform: `translateY(${(1 - namePop) * 60}px) scale(${0.8 + 0.2 * namePop})`,
        }}
      >
        {copy.name}
      </div>
      <div
        style={{
          position: "absolute",
          left: (width - layout.tagline.width) / 2,
          width: layout.tagline.width,
          top: layout.tagline.top,
          textAlign: "center",
          fontFamily: "Poppins",
          fontWeight: 600,
          fontSize: taglineSize,
          lineHeight: 1.18,
          color: COLORS.cream,
          opacity: Math.min(1, taglinePop * 2),
          transform: `translateY(${(1 - taglinePop) * 40}px)`,
        }}
      >
        {copy.tagline.map((line, index) => (
          <div
            key={line}
            style={{
              display: orientation === "portrait" ? "block" : "inline",
              color: index === 0 ? COLORS.accent : COLORS.cream,
            }}
          >
            {line}
            {orientation === "landscape" && index === 0 ? " " : ""}
          </div>
        ))}
      </div>
      {store === "google" ? (
        <Img
          src={staticFile(`${ASSETS}/badges/google-play-${lang}.png`)}
          style={{
            position: "absolute",
            left: "50%",
            top: layout.badge.top,
            height: layout.badge.height,
            opacity: Math.min(1, badgePop * 2),
            transform: `translateX(-50%) translateY(${(1 - badgePop) * 30}px)`,
          }}
        />
      ) : null}
      {store === "google" ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            bottom: 28,
            textAlign: "center",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: 18,
            color: "rgba(255, 248, 239, 0.6)",
            opacity: Math.min(1, badgePop * 2),
          }}
        >
          Google Play and the Google Play logo are trademarks of Google LLC.
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
