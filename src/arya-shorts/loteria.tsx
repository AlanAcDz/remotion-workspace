import { loadFont as loadLilita } from "@remotion/google-fonts/LilitaOne";
import {
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SfxCues } from "../template/components/sfx-cues";
import type { PosDemoProps, Sfx } from "../template/schema";
import { withAlpha } from "../template/theme";
import {
  ARYA,
  centered,
  CORAL,
  PawPrint,
  POPPINS,
  ramp,
  ShortFrame,
  useSeconds,
} from "./shared";

/** The card face: rounded and chunky like the mascot, with ¡, ¿, ñ and accents. */
export const { fontFamily: lilita } = loadLilita("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const INK = "#5B3A26";
const PAPER = ARYA.colors.background;
/** The Codex art's own cream, so a card face and its picture read as one sheet. */
const CARD_PAPER = "#FDF5ED";
const CLOTH = ARYA.colors.accent;
const MUSTARD = "#F2B84B";
const STAMP_INK = "#D2573D";
const BACK = "#EE9B78";

const BOARD = { left: 102, top: 636, size: 876, pad: 22, gap: 14 };
const CELL = (BOARD.size - BOARD.pad * 2 - BOARD.gap * 2) / 3;
const CALLED = { left: 92, top: 238, width: 264, height: 360 };
const CALLER = { left: 392, top: 238, width: 600, height: 360 };

const FLIP_BEFORE = 4;
const FLIP_AFTER = 6;
const DROP = 8;

/** Where each bean sits inside its square, and how it lies. */
const BEAN_SPOTS = [
  { dx: 52, dy: 30, rotate: -18 },
  { dx: -48, dy: 36, rotate: 24 },
  { dx: 44, dy: 44, rotate: 8 },
  { dx: -40, dy: 26, rotate: -32 },
  { dx: 56, dy: 38, rotate: 40 },
  { dx: -52, dy: 42, rotate: -6 },
  { dx: 48, dy: 24, rotate: 16 },
  { dx: -44, dy: 34, rotate: -26 },
  { dx: 50, dy: 40, rotate: 30 },
];

/** Words the composition writes over an illustration, in fractions of the image. */
interface ArtLabel {
  text: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  color: string;
}

interface LoteriaCard {
  name: string;
  image: string;
  /** Square on the board, 0–8 in reading order. */
  cell: number;
  from: number;
  /** Second the bean lands on the board. */
  land: number;
  label?: ArtLabel;
}

export type LoteriaProps = {
  hook: { text: string; to: number };
  /** In call order; a card's number is its position here. */
  cards: LoteriaCard[];
  loteria: { text: string; at: number };
  lines: { text: string; from: number; to: number }[];
  grain: string;
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

const cellBox = (cell: number) => ({
  left: BOARD.left + BOARD.pad + (cell % 3) * (CELL + BOARD.gap),
  top: BOARD.top + BOARD.pad + Math.floor(cell / 3) * (CELL + BOARD.gap),
});

/** "Lotería": the tabla is dealt from frame 0 and fills, out of order, to ¡Lotería! */
export function Loteria(props: LoteriaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const stampAt = sec(props.loteria.at);
  const outroAt = sec(props.lines[0].from);
  const shake =
    frame >= stampAt + 5
      ? Math.sin((frame - stampAt - 5) * 2.4) *
        interpolate(frame, [stampAt + 5, stampAt + 14], [12, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <ShortFrame background={CLOTH} music={props.music} sfx={props.sfx}>
      <Tablecloth />

      <div style={{ opacity: 1 - ramp(frame, outroAt, outroAt + 8) }}>
        <Deck cards={props.cards} />
        <Caller hook={props.hook} cards={props.cards} />
      </div>

      <div style={{ position: "absolute", inset: 0, translate: `${shake}px 0px` }}>
        <Board cards={props.cards} />
        <Stamp text={props.loteria.text} at={props.loteria.at} />
      </div>

      {props.lines.map((line) => (
        <Sequence
          key={line.text}
          name={line.text}
          from={sec(line.from)}
          durationInFrames={sec(line.to - line.from)}
        >
          <TopLine text={line.text} />
        </Sequence>
      ))}

      <Img
        src={staticFile(props.grain)}
        style={{
          position: "absolute",
          inset: 0,
          width: 1080,
          height: 1920,
          mixBlendMode: "multiply",
          opacity: 0.12,
        }}
      />
      <LoteriaEndCard cta={props.cta} />
    </ShortFrame>
  );
}

/** ¡LOTERÍA! slammed onto the full tabla in stamp ink. */
function Stamp({ text, at }: { text: string; at: number }) {
  const frame = useCurrentFrame();
  const stampAt = useSeconds()(at);

  if (frame < stampAt) {
    return null;
  }

  const slam = ramp(frame, stampAt, stampAt + 5, Easing.in(Easing.quad));

  return (
    <div
      style={{
        position: "absolute",
        top: BOARD.top + BOARD.size / 2 - 120,
        ...centered(880),
        height: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `12px solid ${STAMP_INK}`,
        borderRadius: 34,
        outline: `4px solid ${STAMP_INK}`,
        outlineOffset: -26,
        backgroundColor: "rgba(255, 248, 239, 0.94)",
        boxShadow: "0 18px 40px rgba(10, 40, 40, 0.35)",
        color: STAMP_INK,
        fontFamily: lilita,
        fontSize: 150,
        lineHeight: 1,
        letterSpacing: "0.01em",
        rotate: "-8deg",
        scale: interpolate(slam, [0, 1], [2.6, 1]),
        opacity: ramp(frame, stampAt, stampAt + 2),
      }}
    >
      {text}
    </div>
  );
}

/** A woven gingham cloth: the kitchen table the game is played on. */
function Tablecloth() {
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <pattern id="gingham" width="72" height="72" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="36" height="72" fill="#FFFFFF" opacity="0.05" />
          <rect x="0" y="0" width="72" height="36" fill="#FFFFFF" opacity="0.05" />
        </pattern>
        <radialGradient id="lamp" cx="50%" cy="58%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#gingham)" />
      <rect width="1080" height="1920" fill="url(#lamp)" />
    </svg>
  );
}

function CardFace({
  card,
  number,
  width,
  height,
}: {
  card: LoteriaCard;
  number: number;
  width: number;
  height: number;
}) {
  const s = width / CELL;
  const band = 54 * s;
  const artWidth = width - 8 * s;
  const artHeight = height - band - 8 * s;
  const shown = Math.max(artWidth, artHeight);
  const label = card.label;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: CARD_PAPER,
        border: `${4 * s}px solid ${INK}`,
        borderRadius: 12 * s,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: artWidth,
          height: artHeight,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(card.image)}
          style={{
            position: "absolute",
            left: (artWidth - shown) / 2,
            top: (artHeight - shown) / 2,
            width: shown,
            height: shown,
          }}
        />
        {label ? (
          <div
            style={{
              position: "absolute",
              left: (artWidth - shown) / 2 + label.x * shown,
              top: (artHeight - shown) / 2 + label.y * shown,
              translate: "-50% -50%",
              rotate: `${label.rotate}deg`,
              fontFamily: lilita,
              fontSize: label.size * shown,
              lineHeight: 1,
              color: label.color,
              whiteSpace: "nowrap",
            }}
          >
            {label.text}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 6 * s,
          border: `${2.5 * s}px solid ${CORAL}`,
          borderRadius: 7 * s,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 12 * s,
          top: 12 * s,
          width: 44 * s,
          height: 44 * s,
          boxSizing: "border-box",
          borderRadius: "50%",
          border: `${3 * s}px solid ${INK}`,
          backgroundColor: MUSTARD,
          color: INK,
          fontFamily: lilita,
          fontSize: 27 * s,
          lineHeight: `${38 * s}px`,
          textAlign: "center",
        }}
      >
        {number}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: band,
          boxSizing: "border-box",
          borderTop: `${3 * s}px solid ${INK}`,
          backgroundColor: CARD_PAPER,
          color: INK,
          fontFamily: lilita,
          fontSize: 31 * s,
          lineHeight: `${band - 3 * s}px`,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {card.name}
      </div>
    </div>
  );
}

function CardBack({ width, height }: { width: number; height: number }) {
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        borderRadius: 12,
        border: `4px solid ${INK}`,
        backgroundColor: BACK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: 8,
          border: `3px solid ${PAPER}`,
        }}
      />
      <PawPrint size={width * 0.46} color={PAPER} />
    </div>
  );
}

/** The deck at the top left; each call turns its top card face up. */
function Deck({ cards }: { cards: LoteriaCard[] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const current = currentCard(cards, frame, sec);
  const pile = [
    { dx: 10, dy: 12, rotate: 4 },
    { dx: -8, dy: 8, rotate: -3 },
  ];

  return (
    <>
      {pile.map((spot) => (
        <div
          key={spot.rotate}
          style={{
            position: "absolute",
            left: CALLED.left + spot.dx,
            top: CALLED.top + spot.dy,
            rotate: `${spot.rotate}deg`,
            boxShadow: "0 10px 24px rgba(10, 40, 40, 0.3)",
            borderRadius: 12,
          }}
        >
          <CardBack width={CALLED.width} height={CALLED.height} />
        </div>
      ))}
      {current > 0 ? <CalledCard card={cards[current - 1]} number={current} flip={1} /> : null}
      <CalledCard
        card={cards[current]}
        number={current + 1}
        flip={ramp(
          frame,
          sec(cards[current].from) - FLIP_BEFORE,
          sec(cards[current].from) + FLIP_AFTER,
          Easing.inOut(Easing.cubic),
        )}
      />
    </>
  );
}

function CalledCard({
  card,
  number,
  flip,
}: {
  card: LoteriaCard;
  number: number;
  flip: number;
}) {
  const lift = Math.sin(flip * Math.PI);
  const isFaceUp = flip >= 0.5;

  return (
    <div
      style={{
        position: "absolute",
        left: CALLED.left,
        top: CALLED.top,
        borderRadius: 12,
        boxShadow: `0 ${10 + lift * 16}px ${24 + lift * 20}px rgba(10, 40, 40, 0.35)`,
        transform: `translate(${(1 - flip) * -26}px, ${lift * -18}px) perspective(1400px) rotateY(${(1 - flip) * 180}deg) scale(${1 + lift * 0.06})`,
      }}
    >
      <div style={{ transform: isFaceUp ? undefined : "rotateY(180deg)" }}>
        {isFaceUp ? (
          <CardFace card={card} number={number} width={CALLED.width} height={CALLED.height} />
        ) : (
          <CardBack width={CALLED.width} height={CALLED.height} />
        )}
      </div>
    </div>
  );
}

/** The caller's line beside the deck: the hook, then each card's name. */
function Caller({ hook, cards }: { hook: LoteriaProps["hook"]; cards: LoteriaCard[] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const current = currentCard(cards, frame, sec);
  const revealAt = sec(cards[current].from) - FLIP_BEFORE;
  const pop = ramp(frame, revealAt, revealAt + 6);
  const hookOut = ramp(frame, sec(hook.to) - 6, sec(hook.to));

  return (
    <div
      style={{
        position: "absolute",
        left: CALLER.left,
        top: CALLER.top,
        width: CALLER.width,
        height: CALLER.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: PAPER,
      }}
    >
      {hookOut < 1 ? (
        <div
          style={{
            fontFamily: POPPINS,
            fontSize: 50,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 14,
            opacity: 1 - hookOut,
          }}
        >
          {hook.text}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: lilita,
          fontSize: 112,
          lineHeight: 0.96,
          letterSpacing: "0.005em",
          textShadow: `0 6px 0 rgba(10, 40, 40, 0.35)`,
          opacity: pop,
          translate: `0px ${(1 - pop) * 30}px`,
          scale: interpolate(pop, [0, 1], [0.9, 1]),
          transformOrigin: "left center",
        }}
      >
        {cards[current].name}
      </div>
    </div>
  );
}

/** Index of the card being called (the last one whose flip has begun). */
function currentCard(
  cards: LoteriaCard[],
  frame: number,
  sec: (seconds: number) => number,
): number {
  const started = cards.filter((card) => frame >= sec(card.from) - FLIP_BEFORE);

  return Math.max(0, started.length - 1);
}

function Board({ cards }: { cards: LoteriaCard[] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const lastCell = cards[cards.length - 1].cell;
  const doneAt = sec(cards[cards.length - 1].land);
  const ripple = (cell: number) => {
    const distance =
      Math.abs((cell % 3) - (lastCell % 3)) +
      Math.abs(Math.floor(cell / 3) - Math.floor(lastCell / 3));
    const start = doneAt + distance * 2;

    return interpolate(frame, [start, start + 3, start + 14], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        left: BOARD.left,
        top: BOARD.top,
        width: BOARD.size,
        height: BOARD.size,
        boxSizing: "border-box",
        borderRadius: 24,
        border: `5px solid ${INK}`,
        backgroundColor: CORAL,
        boxShadow: "0 16px 0 rgba(10, 40, 40, 0.32), 0 30px 60px rgba(10, 40, 40, 0.3)",
      }}
    >
      {cards.map((card, index) => (
        <Square
          key={card.name}
          card={card}
          number={index + 1}
          glow={ripple(card.cell)}
        />
      ))}
    </div>
  );
}

function Square({
  card,
  number,
  glow,
}: {
  card: LoteriaCard;
  number: number;
  glow: number;
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const box = cellBox(card.cell);
  const calledAt = sec(card.from);
  const landAt = sec(card.land);
  const isWaiting = frame >= calledAt && frame < landAt;
  const pulse = isWaiting ? 0.55 + 0.45 * Math.sin((frame - calledAt) * 0.9) : 0;
  const ring = interpolate(frame, [landAt, landAt + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isRinging = frame >= landAt && ring < 1;

  return (
    <div
      style={{
        position: "absolute",
        left: box.left - BOARD.left - 5,
        top: box.top - BOARD.top - 5,
        width: CELL,
        height: CELL,
      }}
    >
      <CardFace card={card} number={number} width={CELL} height={CELL} />
      <div
        style={{
          position: "absolute",
          inset: -7,
          borderRadius: 16,
          border: `7px solid ${MUSTARD}`,
          opacity: Math.max(pulse, glow),
        }}
      />
      {glow > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            backgroundColor: MUSTARD,
            opacity: glow * 0.3,
          }}
        />
      ) : null}
      {isRinging ? (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 16,
            border: `6px solid ${PAPER}`,
            opacity: 1 - ring,
            scale: 1 + ring * 0.12,
          }}
        />
      ) : null}
      <Bean index={number - 1} landAt={landAt} />
    </div>
  );
}

/** A pinto bean dropped onto the square, with a little squash on impact. */
function Bean({ index, landAt }: { index: number; landAt: number }) {
  const frame = useCurrentFrame();

  if (frame < landAt - DROP) {
    return null;
  }

  const spot = BEAN_SPOTS[index % BEAN_SPOTS.length];
  const fall = ramp(frame, landAt - DROP, landAt, Easing.in(Easing.quad));
  const squash = interpolate(frame, [landAt, landAt + 2, landAt + 6], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const width = 94;
  const height = 65;
  const left = CELL / 2 + spot.dx - width / 2;
  const top = (CELL - 54) / 2 + spot.dy - height / 2;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: left + 6,
          top: top + height - 14,
          width: width - 8,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "rgba(60, 30, 15, 0.35)",
          opacity: fall,
          scale: 0.4 + fall * 0.6,
          filter: "blur(3px)",
        }}
      />
      <svg
        width={width}
        height={height}
        viewBox="0 0 84 58"
        aria-hidden
        style={{
          position: "absolute",
          left,
          top,
          overflow: "visible",
          translate: `0px ${(1 - fall) * -360}px`,
          rotate: `${spot.rotate + (1 - fall) * 70}deg`,
          scale: `${(1.6 - fall * 0.6) * (1 + squash * 0.14)} ${(1.6 - fall * 0.6) * (1 - squash * 0.2)}`,
        }}
      >
        <path
          d="M10 30 C6 14 22 4 40 7 C52 9 58 15 66 12 C78 8 84 24 78 36 C72 50 54 55 38 53 C22 51 13 44 10 30 Z"
          fill="#C8915E"
          stroke={INK}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <g fill="#8A5634">
          <ellipse cx="26" cy="22" rx="6" ry="3.5" transform="rotate(-20 26 22)" />
          <ellipse cx="46" cy="38" rx="7" ry="3.5" transform="rotate(15 46 38)" />
          <ellipse cx="62" cy="24" rx="5" ry="3" transform="rotate(-30 62 24)" />
          <ellipse cx="30" cy="42" rx="4" ry="2.5" />
          <ellipse cx="68" cy="40" rx="4" ry="2.5" transform="rotate(25 68 40)" />
        </g>
        <path d="M20 18 C28 12 38 11 46 13" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 28 C44 30 48 30 52 28" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  );
}

function TopLine({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 8);

  return (
    <div
      style={{
        position: "absolute",
        top: CALLED.top,
        height: CALLED.height,
        ...centered(900),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 84,
        fontWeight: 700,
        lineHeight: 1.12,
        letterSpacing: "-0.03em",
        color: PAPER,
        whiteSpace: "pre-line",
        textShadow: "0 6px 0 rgba(10, 40, 40, 0.3)",
        opacity: rise,
        translate: `0px ${(1 - rise) * 36}px`,
      }}
    >
      {text}
    </div>
  );
}

/**
 * PosDemo's end card, re-laid for a note that needs two lines: the template's
 * note slot is one line tall, and "Recordatorio de pastillas para mascotas"
 * wraps into its pill.
 */
function LoteriaEndCard({ cta }: { cta: PosDemoProps["cta"] }) {
  const sec = useSeconds();

  return (
    <Sequence name="CTA" from={sec(cta.from)}>
      <LoteriaEndCardContent cta={cta} />
    </Sequence>
  );
}

function LoteriaEndCardContent({ cta }: { cta: PosDemoProps["cta"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { colors, weights, ctaLogo } = ARYA;
  const line2At = sec(cta.revealAt.line2 - cta.from);
  const noteAt = sec(cta.revealAt.note - cta.from);
  const pillAt = sec(cta.revealAt.pill - cta.from);
  const reveal = (at: number) => ({
    opacity: ramp(frame, at, at + 14),
    translate: `0px ${(1 - ramp(frame, at, at + 18)) * 24}px`,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.background,
        fontFamily: POPPINS,
        opacity: ramp(frame, 0, 6),
      }}
    >
      <SfxCues cues={cta.sfx} />
      <Img
        src={staticFile(cta.logo)}
        style={{
          position: "absolute",
          top: ctaLogo.full.top,
          ...centered(ctaLogo.full.width),
          opacity: ramp(frame, 0, 12),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 790,
          ...centered(936),
          textAlign: "center",
          fontSize: 148,
          fontWeight: weights.display,
          lineHeight: 1,
          letterSpacing: "-0.045em",
          color: colors.accent,
          ...reveal(line2At),
        }}
      >
        {cta.line2}
      </div>
      <div
        style={{
          position: "absolute",
          top: 966,
          ...centered(800),
          textAlign: "center",
          fontSize: 56,
          fontWeight: weights.emphasis,
          lineHeight: 1.18,
          letterSpacing: "-0.01em",
          color: colors.muted,
          ...reveal(noteAt),
        }}
      >
        {cta.note}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1150,
          ...centered(600),
          textAlign: "center",
          padding: "28px 0",
          borderRadius: 999,
          backgroundColor: colors.pill,
          color: colors.onPill,
          fontSize: 52,
          fontWeight: weights.emphasis,
          letterSpacing: "-0.01em",
          boxShadow: `0 20px 44px ${withAlpha(colors.pill, 0.32)}`,
          ...reveal(pillAt),
        }}
      >
        {cta.pill}
      </div>
    </div>
  );
}
