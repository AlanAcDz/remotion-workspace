import {
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, EndCard, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";

const ROW = { top: 330, height: 176, gap: 12, left: 90, width: 900 };
const LABEL_WIDTH = 150;
const TIERS = ["S", "A", "B", "C"];
const TIER_COLORS: Record<string, string> = {
  S: "#EE9B78",
  A: "#F5BEA3",
  B: "#9BD8D2",
  C: "#39ACAC",
};
const STAGE = { top: 1090, size: 370 };
const FLY_FRAMES = 10;

interface TierEntry {
  tier: string;
  image: string;
  name: string;
  line: string;
  from: number;
  flyAt: number;
}

export type TierListProps = {
  title: string;
  entries: TierEntry[];
  ask: { text: string; from: number; to: number };
  health: { text: string; from: number; to: number };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

const rowTop = (tier: string) =>
  ROW.top + TIERS.indexOf(tier) * (ROW.height + ROW.gap);

/** "Tier List": the board is there from frame 0 and fills from C up to S. */
export function TierList(props: TierListProps) {
  const sec = useSeconds();

  return (
    <ShortFrame background={ARYA.colors.background} music={props.music} sfx={props.sfx}>
      <div
        style={{
          position: "absolute",
          top: 236,
          ...centered(900),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
        }}
      >
        {props.title}
      </div>

      {TIERS.map((tier) => (
        <div
          key={tier}
          style={{
            position: "absolute",
            left: ROW.left,
            top: rowTop(tier),
            width: ROW.width,
            height: ROW.height,
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 6px 18px rgba(25, 38, 38, 0.08)",
          }}
        >
          <div
            style={{
              width: LABEL_WIDTH,
              height: ROW.height,
              backgroundColor: TIER_COLORS[tier],
              color: ARYA.colors.ink,
              fontFamily: POPPINS,
              fontSize: 96,
              fontWeight: 700,
              lineHeight: `${ROW.height}px`,
              textAlign: "center",
            }}
          >
            {tier}
          </div>
        </div>
      ))}

      {props.entries.map((entry) => (
        <Card key={entry.tier} entry={entry} />
      ))}

      <Sequence from={sec(props.ask.from)} durationInFrames={sec(props.ask.to - props.ask.from)}>
        <BottomLine text={props.ask.text} size={92} />
      </Sequence>
      <Sequence from={sec(props.health.from)} durationInFrames={sec(props.health.to - props.health.from)}>
        <BottomLine text={props.health.text} size={68} />
      </Sequence>
      <EndCard cta={props.cta} />
    </ShortFrame>
  );
}

function Card({ entry }: { entry: TierEntry }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(entry.from);
  const flyAt = sec(entry.flyAt);

  if (frame < start - 4) {
    return null;
  }

  const fall = ramp(frame, start - 4, start + 6, Easing.in(Easing.quad));
  const fly = ramp(frame, flyAt, flyAt + FLY_FRAMES);
  const settledSize = ROW.height - 20;
  const size = interpolate(fly, [0, 1], [STAGE.size, settledSize]);
  const left = interpolate(fly, [0, 1], [ROW.left, ROW.left + LABEL_WIDTH + 14]);
  const top = interpolate(
    fly,
    [0, 1],
    [STAGE.top + (fall - 1) * 480, rowTop(entry.tier) + 10],
  );
  const rowText = ramp(frame, flyAt + FLY_FRAMES - 2, flyAt + FLY_FRAMES + 5);

  return (
    <>
      <Img
        src={staticFile(entry.image)}
        style={{
          position: "absolute",
          left,
          top,
          width: size,
          height: size,
          borderRadius: 24,
          boxShadow: "0 12px 28px rgba(25, 38, 38, 0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: ROW.left + STAGE.size + 30,
          top: STAGE.top + 16,
          width: 500,
          fontFamily: POPPINS,
          color: ARYA.colors.ink,
          opacity: ramp(frame, start + 4, start + 9) * (1 - fly),
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
          {entry.name}
        </div>
        <div style={{ marginTop: 14, fontSize: 46, fontWeight: 500, lineHeight: 1.16, color: ARYA.colors.muted }}>
          {entry.line}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: ROW.left + LABEL_WIDTH + settledSize + 30,
          top: rowTop(entry.tier),
          width: 520,
          height: ROW.height,
          display: "flex",
          alignItems: "center",
          fontFamily: POPPINS,
          fontSize: 46,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: ARYA.colors.ink,
          opacity: rowText,
        }}
      >
        {entry.name}
      </div>
    </>
  );
}

function BottomLine({ text, size }: { text: string; size: number }) {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 8);

  return (
    <div
      style={{
        position: "absolute",
        top: 1120,
        ...centered(880),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1.14,
        letterSpacing: "-0.03em",
        color: ARYA.colors.accent,
        whiteSpace: "pre-line",
        opacity: rise,
        translate: `0px ${(1 - rise) * 40}px`,
      }}
    >
      {text}
    </div>
  );
}
