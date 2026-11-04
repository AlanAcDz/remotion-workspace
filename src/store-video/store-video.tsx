import "../template/fonts";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Character } from "./components/character";
import { EndCard } from "./components/end-card";
import { Headline } from "./components/headline";
import { NotificationBanner } from "./components/notification-banner";
import { ScreenCard } from "./components/screen-card";
import { inkAt, nightAt, Sky } from "./components/sky";
import { HEADLINES } from "./copy";
import { placeCharacter, stageLayout, viewAt, type Side, type StageLayout } from "./layout";
import { buildScenes, END_CARD_FROM, mediaSize, type SceneSpec } from "./scenes";
import {
  beats,
  DURATION,
  MUSIC,
  ORIENTATION,
  PLATFORM,
  type Lang,
  type Orientation,
  type Platform,
  type StoreVideoProps,
} from "./schema";

/** Frames a scene keeps playing past its cut while it leaves and the next one arrives. */
const EXIT = 8;
const MUSIC_FADE_FROM = DURATION - 36;

/**
 * Arya's store video: "A day of care, from first drop to bedtime".
 * App Store preview (886×1920, iOS) or Google Play promo (1920×1080, Android),
 * music only, every cut and tap on the 100 BPM bed.
 */
export function StoreVideo({ lang, store }: StoreVideoProps) {
  const platform = PLATFORM[store];
  const orientation = ORIENTATION[store];
  const scenes = buildScenes(platform, lang);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sky />
      {scenes.map((spec, index) => (
        <Sequence
          key={spec.id}
          name={spec.id}
          from={beats(spec.from)}
          durationInFrames={beats(spec.to - spec.from) + EXIT}
        >
          <SceneView
            spec={spec}
            index={index}
            lang={lang}
            platform={platform}
            orientation={orientation}
          />
        </Sequence>
      ))}
      <Sequence name="end-card" from={beats(END_CARD_FROM)}>
        <EndCard lang={lang} store={store} orientation={orientation} />
      </Sequence>
      <Audio
        name="Music"
        src={staticFile(MUSIC.src)}
        volume={(frame) =>
          interpolate(frame, [0, 2, MUSIC_FADE_FROM, DURATION], [0, MUSIC.volume, MUSIC.volume, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
}

interface SceneViewProps {
  spec: SceneSpec;
  index: number;
  lang: Lang;
  platform: Platform;
  orientation: Orientation;
}

function SceneView({ spec, index, lang, platform, orientation }: SceneViewProps) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const globalFrame = frame + beats(spec.from);
  const length = beats(spec.to - spec.from);
  const side: Side = orientation === "landscape" && index % 2 === 1 ? "right" : "left";
  const layout = croppedLayout(stageLayout(orientation, side), spec.cardCrop, platform, orientation);
  const { card } = layout;

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 120, mass: 0.8 } });
  const exit = interpolate(frame, [length, length + EXIT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const headlineExit = interpolate(frame, [length - 2, length + 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const night = nightAt(globalFrame);
  const ink = inkAt(globalFrame);
  const view = viewAt(frame, spec.view, card, mediaSize(platform));
  const float = Math.sin((globalFrame / beats(4)) * Math.PI * 2) * 6;

  // Portrait swipes right-to-left; landscape cards arrive from and leave to their own side.
  const enterFrom = orientation === "portrait" ? 1 : side === "left" ? -1 : 1;
  const exitTo = orientation === "portrait" ? -1 : enterFrom;
  const travel = orientation === "portrait" ? width : width * 0.6;
  const isOpening = index === 0;
  const arrival = isOpening ? 0 : 1 - enter;
  const cardX = enterFrom * arrival * travel + exitTo * exit * travel;
  const cardY = isOpening ? (1 - enter) * 260 : 0;
  const cardRotate = enterFrom * arrival * 5 + exitTo * exit * 4;

  const headline = HEADLINES[lang][spec.headline];

  return (
    <AbsoluteFill>
      <Headline
        copy={headline}
        lineAt={spec.lineAt}
        wordStep={spec.wordStep}
        accentAt={spec.accentAt}
        left={layout.panel.left}
        top={layout.headline.top}
        width={layout.panel.width}
        maxSize={layout.headline.maxSize}
        ink={ink}
        exit={headlineExit}
      />
      <ScreenCard
        box={card}
        radius={layout.radius}
        view={view}
        shots={spec.shots}
        cues={spec.cues}
        bursts={spec.bursts}
        platform={platform}
        lang={lang}
        night={night}
        style={{
          opacity: isOpening ? Math.min(1, enter * 1.5) : 1,
          transform: `translate(${cardX}px, ${cardY + float}px) rotate(${cardRotate}deg)`,
        }}
      />
      {spec.characters.map((character) => {
        const placement = orientation === "portrait" ? character.portrait : character.landscape;
        const placed = placeCharacter(placement, layout, side, view);
        const isOnCard = placement.on !== "panel";
        const file = typeof character.file === "string" ? character.file : character.file[lang];

        return (
          <AbsoluteFill
            key={file}
            style={{
              transform: isOnCard ? `translate(${cardX}px, ${cardY + float}px)` : undefined,
            }}
          >
            <Character
              file={file}
              placed={placed}
              at={character.at}
              motion={character.motion}
              exit={exit}
            />
          </AbsoluteFill>
        );
      })}
      {spec.notificationAt === undefined ? null : (
        <SceneNotification
          lang={lang}
          platform={platform}
          orientation={orientation}
          card={card}
          at={spec.notificationAt}
          exit={exit}
          offsetX={cardX}
        />
      )}
    </AbsoluteFill>
  );
}

/** A cropped portrait card spans the headline's width; its height keeps just the top `crop` of the screen. */
function croppedLayout(
  stage: StageLayout,
  crop: number | undefined,
  platform: Platform,
  orientation: Orientation,
): StageLayout {
  if (crop === undefined || orientation === "landscape") {
    return stage;
  }

  const media = mediaSize(platform);
  const { panel } = stage;

  return {
    ...stage,
    card: {
      left: panel.left,
      top: stage.card.top,
      width: panel.width,
      height: Math.round(((panel.width * media.height) / media.width) * crop),
    },
  };
}

function SceneNotification({
  lang,
  platform,
  orientation,
  card,
  at,
  exit,
  offsetX,
}: {
  lang: Lang;
  platform: Platform;
  orientation: Orientation;
  card: { left: number; top: number; width: number };
  at: number;
  exit: number;
  offsetX: number;
}) {
  const { width: canvasWidth } = useVideoConfig();
  // Bigger than native so it reads at store-thumbnail size; wider than the card so it pops out of it.
  const bannerWidth = orientation === "portrait" ? canvasWidth - 56 : card.width + 240;
  const point = bannerWidth / (orientation === "portrait" ? 350 : 340);
  const left = card.left + card.width / 2 - bannerWidth / 2 + offsetX;

  return (
    <NotificationBanner
      lang={lang}
      platform={platform}
      left={left}
      top={card.top + 36}
      width={bannerWidth}
      point={point}
      at={at}
      exit={exit}
    />
  );
}
