import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BeatPane } from "../template/components/beat-pane";
import { SfxCues } from "../template/components/sfx-cues";
import "../template/fonts";
import { SFX, type Pane, type Rect } from "../template/schema";
import { CtaScene } from "../template/scenes/cta-scene";
import { TICKET_SFX } from "../ticket/schema";
import { cardSize, type RetoProps } from "./schema";

const INK = "#221E18";
const TOMATO = "#DE5134";
const PAPER = "#F7F4EF";

const CARD_TOP = 600;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * "Reto del mostrador": a counter-side sum the viewer tries to solve before
 * Punto Listo does. The question sits over a still of the real UI, the voice
 * stops for a three-beat countdown that asks for a comment, then the
 * recording plays and the app produces the answer on its own.
 *
 * The countdown is cut into a single voice take — part one plays until
 * `pause.at`, part two resumes from that point `pause.for` seconds later — so
 * the silence is exact and the take is never re-generated to make room for it.
 */
export function RetoMostrador(props: RetoProps) {
  const { fps } = useVideoConfig();
  const { pause, answer, cta, music } = props;

  const pauseAt = Math.round(pause.at * fps);
  const pauseFrames = Math.round(pause.for * fps);
  const revealFrom = pauseAt + pauseFrames;
  const ctaFrom = Math.round(cta.from * fps);
  const answerAt = revealFrom + Math.round(answer.at * fps);
  const beat = pauseFrames / 3;

  const cues = [
    ...[0, 1, 2].map((index) => ({
      sound: TICKET_SFX.tick,
      at: (pauseAt + index * beat) / fps,
      volume: 0.5,
    })),
    { sound: SFX.whoosh, at: revealFrom / fps, volume: 0.2 },
    { sound: SFX.ding, at: answerAt / fps, volume: 0.3 },
  ];

  return (
    <AbsoluteFill name="RetoMostrador" style={{ backgroundColor: PAPER }}>
      <Sequence name="Voz · pregunta" durationInFrames={pauseAt}>
        <Audio src={staticFile(props.audioFile)} />
      </Sequence>
      <Sequence name="Voz · respuesta" from={revealFrom}>
        <Audio src={staticFile(props.audioFile)} trimBefore={pauseAt} />
      </Sequence>
      <Audio
        name="Música"
        src={staticFile(music.src)}
        trimBefore={Math.round(music.trimBefore * fps)}
        loop
        volume={(f) =>
          interpolate(
            f,
            [0, 2, pauseAt, pauseAt + 4, revealFrom - 4, revealFrom],
            [
              0,
              music.volume,
              music.volume,
              music.countdownVolume,
              music.countdownVolume,
              music.volume,
            ],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <SfxCues cues={cues} />

      <Sequence name="Reto" durationInFrames={ctaFrom}>
        <QuestionBlock {...props} answerAt={answerAt} />
        <RetoCard
          {...props}
          revealFrom={revealFrom}
          answerAt={answerAt}
          ctaFrom={ctaFrom}
        />
        <Sequence
          name="Cuenta regresiva"
          from={pauseAt}
          durationInFrames={pauseFrames}
        >
          <Countdown prompt={pause.prompt} beat={beat} />
        </Sequence>
      </Sequence>

      <Sequence name="CTA" from={ctaFrom}>
        <CtaScene cta={cta} />
      </Sequence>
    </AbsoluteFill>
  );
}

interface QuestionBlockProps extends RetoProps {
  answerAt: number;
}

/** Episode pill, the facts, and the ask — which turns into the answer. */
function QuestionBlock({
  episode,
  question,
  answer,
  answerAt,
}: QuestionBlockProps) {
  const frame = useCurrentFrame();
  const swap = interpolate(frame, [answerAt, answerAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <Interactive.Div
      name="Pregunta"
      style={{
        position: "absolute",
        left: 60,
        top: 150,
        width: 960,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "Archivo",
        color: INK,
      }}
    >
      <div
        style={{
          padding: "10px 26px",
          borderRadius: 999,
          backgroundColor: INK,
          color: PAPER,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginBottom: 22,
        }}
      >
        {episode}
      </div>
      {question.facts.map((fact) => (
        <div
          key={fact}
          style={{
            fontSize: 70,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
          }}
        >
          {fact}
        </div>
      ))}
      <div style={{ position: "relative", width: "100%", height: 104 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: 10,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: TOMATO,
            opacity: 1 - swap,
            translate: `0px ${swap * -30}px`,
          }}
        >
          {question.ask}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: 10,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: TOMATO,
            opacity: swap,
            scale: String(interpolate(swap, [0, 1], [1.25, 1])),
          }}
        >
          {answer.text}
        </div>
      </div>
    </Interactive.Div>
  );
}

interface RetoCardProps extends RetoProps {
  revealFrom: number;
  answerAt: number;
  ctaFrom: number;
}

/** The real UI: a still with the giveaway numbers masked, then the recording. */
function RetoCard({
  card,
  answer,
  revealFrom,
  answerAt,
  ctaFrom,
}: RetoCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height } = cardSize(card);

  const isRevealed = frame >= revealFrom;
  const holdFrom = revealFrom + Math.round(card.holdAt * fps);
  const ring = interpolate(frame, [answerAt, answerAt + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
  const subline = interpolate(frame, [answerAt + 12, answerAt + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  // Frame 0 doubles as the thumbnail, so nothing fades in; the still pushes in
  // slowly instead, so the opening is never a frozen frame.
  const stillPane: Pane = {
    clip: card.still,
    still: true,
    trimBefore: 0,
    playbackRate: 1,
    frame: card.frame,
    zoomTo: pushedIn(card.frame, 0.06),
    zoomStart: 0,
    zoomEnd: revealFrom / fps,
  };

  return (
    <>
      <Interactive.Div
        name="Tarjeta UI"
        style={{
          position: "absolute",
          left: (1080 - width) / 2,
          top: CARD_TOP,
          width,
          height,
          borderRadius: 36,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          border: "2px solid rgba(34, 30, 24, 0.10)",
          boxShadow: "0 30px 70px rgba(34, 30, 24, 0.20)",
        }}
      >
        {isRevealed ? (
          <>
            <Sequence
              from={revealFrom}
              durationInFrames={holdFrom - revealFrom}
            >
              <BeatPane
                pane={{
                  clip: card.clip,
                  still: false,
                  trimBefore: card.trimBefore,
                  playbackRate: 1,
                  frame: card.frame,
                  zoomStart: 0,
                }}
                containerWidth={width}
                containerHeight={height}
              />
            </Sequence>
            <Sequence from={holdFrom} durationInFrames={ctaFrom - holdFrom}>
              <BeatPane
                pane={{
                  clip: card.answerStill,
                  still: true,
                  trimBefore: 0,
                  playbackRate: 1,
                  frame: card.frame,
                  zoomStart: 0,
                }}
                containerWidth={width}
                containerHeight={height}
              />
            </Sequence>
          </>
        ) : (
          <>
            <BeatPane
              pane={stillPane}
              containerWidth={width}
              containerHeight={height}
            />
            {card.masks.map((mask) => (
              <div
                key={`${mask.left}-${mask.top}`}
                style={{
                  position: "absolute",
                  ...mask,
                  borderRadius: 14,
                  backgroundColor: TOMATO,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Archivo",
                  fontWeight: 800,
                  fontSize: Math.min(mask.height * 0.75, 64),
                }}
              >
                ?
              </div>
            ))}
          </>
        )}

        <div
          style={{
            position: "absolute",
            ...answer.ring,
            borderRadius: 20,
            border: `7px solid ${TOMATO}`,
            opacity: ring,
            scale: String(interpolate(ring, [0, 1], [1.12, 1])),
          }}
        />
      </Interactive.Div>

      <div
        style={{
          position: "absolute",
          left: 60,
          top: CARD_TOP + height + 34,
          width: 960,
          textAlign: "center",
          fontFamily: "Archivo",
          fontSize: 50,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: INK,
          opacity: subline,
          translate: `0px ${(1 - subline) * 16}px`,
        }}
      >
        {answer.subline}
      </div>
    </>
  );
}

/** The same rect shrunk about its centre — a push-in that keeps the aspect. */
function pushedIn(rect: Rect, amount: number): Rect {
  return {
    x: rect.x + (rect.width * amount) / 2,
    y: rect.y + (rect.height * amount) / 2,
    width: rect.width * (1 - amount),
    height: rect.height * (1 - amount),
  };
}

interface CountdownProps {
  prompt: string;
  beat: number;
}

/** Three beats, one number each, over a dimmed card. */
function Countdown({ prompt, beat }: CountdownProps) {
  const frame = useCurrentFrame();
  const index = Math.min(2, Math.floor(frame / beat));
  const local = frame - index * beat;
  const pop = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });

  return (
    <AbsoluteFill name="Cuenta regresiva">
      <AbsoluteFill style={{ backgroundColor: "rgba(247, 244, 239, 0.55)" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CARD_TOP,
          width: 1080,
          height: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          fontFamily: "Archivo",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 999,
            backgroundColor: TOMATO,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 210,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            boxShadow: "0 30px 70px rgba(222, 81, 52, 0.45)",
            scale: String(interpolate(pop, [0, 1], [0.6, 1])),
          }}
        >
          {3 - index}
        </div>
        <div
          style={{
            padding: "22px 40px",
            borderRadius: 999,
            backgroundColor: INK,
            color: PAPER,
            fontSize: 50,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {prompt}
        </div>
      </div>
    </AbsoluteFill>
  );
}
