import { Easing, interpolate, Interactive, useCurrentFrame } from "remotion";
import { COLORS, SANS, STAGE } from "../theme";

interface HeadlineProps {
  /**
   * "Lo que tu tienda *pierde*" — starred words are painted tomato, and a
   * "\n" forces a line break where natural wrapping would orphan a word.
   */
  text: string;
  /** false holds the copy fully set from frame 0, which is also the thumbnail. */
  animateIn?: boolean;
}

const WORD_STAGGER = 1.5; // frames between words
const WORD_FRAMES = 8;

/** The big copy above the paper. Each word rises in, one after another. */
export function Headline({ text, animateIn = true }: HeadlineProps) {
  const frame = useCurrentFrame();
  const words = splitAccents(text);

  return (
    <Interactive.Div
      name="Titular"
      style={{
        position: "absolute",
        left: 60,
        top: STAGE.headlineTop,
        width: 960,
        textAlign: "center",
        fontFamily: SANS,
        fontSize: 88,
        fontWeight: 800,
        lineHeight: 1.04,
        letterSpacing: "-0.035em",
        color: COLORS.shopFloor,
      }}
    >
      {words.map(({ word, isAccent }, index) => {
        if (word === LINE_BREAK) {
          return <br key={`br-${index}`} />;
        }

        const start = index * WORD_STAGGER;
        const progress = animateIn
          ? interpolate(frame, [start, start + WORD_FRAMES], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })
          : 1;

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              margin: "0 0.12em",
              color: isAccent ? COLORS.tomato : undefined,
              opacity: progress,
              translate: `0px ${(1 - progress) * 36}px`,
            }}
          >
            {word}
          </span>
        );
      })}
    </Interactive.Div>
  );
}

const LINE_BREAK = "\n";

/** "a *b c* d" → words with b and c flagged: the stars wrap spans, not words. */
function splitAccents(text: string): { word: string; isAccent: boolean }[] {
  return text
    .replace(/\n/g, ` ${LINE_BREAK} `)
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .flatMap((part) => {
      const isAccent = part.startsWith("*") && part.endsWith("*");
      return part
        .replace(/\*/g, "")
        .split(" ")
        .filter(Boolean)
        .map((word) => ({ word, isAccent }));
    });
}
