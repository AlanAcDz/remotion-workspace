import {
  AbsoluteFill,
  Easing,
  interpolate,
  Interactive,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BeatPane } from "../../template/components/beat-pane";
import type { Pane } from "../../template/schema";
import type { TicketStoryProps } from "../schema";
import { COLORS, STAGE } from "../theme";

interface ProofCardProps {
  proof: NonNullable<TicketStoryProps["proof"]>;
}

const CARD_WIDTH = 860;
const CARD_TOP = STAGE.paperTop + 20;
const EXIT_FRAMES = 6;

/**
 * The real app, for one beat: a recording cropped to the value that backs the
 * receipt's claim, rising over the dimmed printer, with that value ringed.
 */
export function ProofCard({ proof }: ProofCardProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // The card takes the crop's own aspect, so the UI is never stretched.
  const cropWidth = proof.frame.width * proof.source.width;
  const cropHeight = proof.frame.height * proof.source.height;
  const cardHeight = Math.round((CARD_WIDTH * cropHeight) / cropWidth);

  const enter = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_FRAMES, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );

  const cutAt = proof.cut ? Math.round(proof.cut.at * fps) : null;
  const isCut = cutAt !== null && frame >= cutAt;

  // Each moment rings its own value; after a cut, the ring is the cut's.
  const highlight = isCut && proof.cut ? proof.cut.highlight : proof.highlight;
  const ringAt = Math.round(highlight.at * fps) + (isCut ? (cutAt ?? 0) : 0);
  const ring = interpolate(frame, [ringAt, ringAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });

  const pane = (trimBefore: number, crop: Pane["frame"]): Pane => ({
    clip: proof.clip,
    still: false,
    trimBefore,
    playbackRate: 1,
    frame: crop,
    zoomStart: 0,
  });

  return (
    <AbsoluteFill name="Prueba">
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(12, 10, 9, 0.72)",
          opacity: enter * (1 - exit),
        }}
      />
      <Interactive.Div
        name="Tarjeta de prueba"
        style={{
          position: "absolute",
          left: (1080 - CARD_WIDTH) / 2,
          top: CARD_TOP,
          width: CARD_WIDTH,
          height: cardHeight,
          borderRadius: 40,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 40px 90px rgba(0, 0, 0, 0.55)",
          translate: `0px ${(1 - enter) * 420 + exit * 1400}px`,
          rotate: `${(1 - enter) * 4}deg`,
        }}
      >
        <Sequence durationInFrames={cutAt ?? undefined}>
          <BeatPane
            pane={pane(proof.trimBefore, proof.frame)}
            containerWidth={CARD_WIDTH}
            containerHeight={cardHeight}
          />
        </Sequence>
        {proof.cut && cutAt !== null ? (
          <Sequence from={cutAt}>
            <BeatPane
              pane={pane(proof.cut.trimBefore, proof.cut.frame)}
              containerWidth={CARD_WIDTH}
              containerHeight={cardHeight}
            />
          </Sequence>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: highlight.left,
            top: highlight.top,
            width: highlight.width,
            height: highlight.height,
            borderRadius: 24,
            border: `7px solid ${COLORS.tomato}`,
            boxShadow: `0 0 0 9999px rgba(31, 26, 23, ${ring * 0.18})`,
            opacity: ring,
            scale: String(interpolate(ring, [0, 1], [1.15, 1])),
          }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
}
