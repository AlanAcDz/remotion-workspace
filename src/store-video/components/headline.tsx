import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Headline as HeadlineCopy } from "../copy";
import { beats, COLORS } from "../schema";

/** Poppins Bold averages ~0.6 em per character; sizes each headline to fit its widest line. */
const EM_PER_CHAR = 0.6;
const WORD_STAGGER = 3; // frames
/** The outgoing headline clears in the first frames after a cut; this one waits for it. */
const ENTER_DELAY = 4;
const UNDERLINE_LAG = 8; // frames
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

interface HeadlineProps {
  copy: HeadlineCopy;
  /** Beats (scene-relative) when each line lands. */
  lineAt: [number, number];
  /** Beats between words, for a word-per-beat entrance. */
  wordStep?: number;
  accentAt: number;
  left: number;
  top: number;
  width: number;
  maxSize: number;
  ink: string;
  /** 0 → 1 while the scene leaves. */
  exit: number;
}

export function fitHeadlineSize(lines: readonly string[], width: number, maxSize: number) {
  const longest = Math.max(...lines.map((line) => line.length));

  return Math.min(maxSize, Math.floor(width / (longest * EM_PER_CHAR)));
}

/** Big, short kinetic copy: words spring up on the beat, the accent gets a teal swoosh. */
export function Headline({
  copy,
  lineAt,
  wordStep,
  accentAt,
  left,
  top,
  width,
  maxSize,
  ink,
  exit,
}: HeadlineProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fontSize = fitHeadlineSize(copy.lines, width, maxSize);
  let wordIndex = 0;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        fontFamily: "Poppins",
        fontWeight: 700,
        fontSize,
        lineHeight: 1.14,
        letterSpacing: "-0.01em",
        color: ink,
        textAlign: "center",
        opacity: 1 - exit,
        transform: `translateY(${-40 * exit}px)`,
      }}
    >
      {copy.lines.map((line, lineIndex) => {
        const words = line.split(" ");
        const accentWords = copy.accent?.split(" ") ?? [];
        const accentStart = findSequence(words, accentWords);
        const accentEnd = accentStart + accentWords.length;

        const renderWord = (word: string, index: number) => {
          const enterAt = wordStep
            ? beats(wordIndex * wordStep)
            : beats(lineAt[lineIndex]) + index * WORD_STAGGER;
          wordIndex += 1;
          const pop = spring({
            frame: frame - enterAt - ENTER_DELAY,
            fps,
            config: { damping: 11, stiffness: 190, mass: 0.6 },
          });

          return (
            <span
              key={`${word}-${index}`}
              style={{
                display: "inline-block",
                opacity: Math.min(1, pop * 2),
                transform: `translateY(${(1 - pop) * 0.55}em) scale(${0.65 + 0.35 * pop}) rotate(${(1 - pop) * -8}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          );
        };

        if (accentStart < 0) {
          return (
            <div key={lineIndex} style={{ whiteSpace: "nowrap" }}>
              {words.map(renderWord)}
            </div>
          );
        }

        // Drawn once the accent words have settled, so it never reads as a strikethrough.
        const underlineFrom = beats(accentAt) + ENTER_DELAY + UNDERLINE_LAG;
        const underline = interpolate(frame, [underlineFrom, underlineFrom + 12], [0, 1], CLAMP);

        return (
          <div key={lineIndex} style={{ whiteSpace: "nowrap" }}>
            {words.slice(0, accentStart).map((word, index) => renderWord(word, index))}
            <span style={{ position: "relative", display: "inline-block" }}>
              {words
                .slice(accentStart, accentEnd)
                .map((word, index) => renderWord(word, accentStart + index))}
              <svg
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  left: "-2%",
                  bottom: "-0.08em",
                  width: accentEnd < words.length ? "96%" : "104%",
                  height: "0.28em",
                  overflow: "visible",
                  opacity: underline > 0 ? 1 : 0,
                  clipPath: `inset(-50% ${(1 - underline) * 100}% -50% -5%)`,
                }}
              >
                <path
                  d="M2 8 C 25 3, 55 11, 98 4"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: fontSize * 0.11 }}
                />
              </svg>
            </span>
            {words.slice(accentEnd).map((word, index) => renderWord(word, accentEnd + index))}
          </div>
        );
      })}
    </div>
  );
}

function findSequence(words: string[], target: string[]) {
  if (target.length === 0) {
    return -1;
  }

  return words.findIndex((_, start) =>
    target.every((word, offset) => words[start + offset] === word),
  );
}
