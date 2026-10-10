import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SfxCues } from "../template/components/sfx-cues";
import { SFX, type Sfx } from "../template/schema";
import { Headline } from "./components/headline";
import { PivotCard } from "./components/pivot-card";
import { PrinterBody, PrinterSlot } from "./components/printer";
import { ProofCard } from "./components/proof-card";
import { Receipt, type ReceiptRow } from "./components/receipt";
import {
  Barcode,
  Centered,
  Check,
  Line,
  Logo,
  Pill,
  ROW,
  Rule,
  Stamp,
  Total,
} from "./components/receipt-rows";
import { TICKET_SFX, type TicketStoryProps } from "./schema";
import { COLORS, formatMoney } from "./theme";
import { buildTimeline, type TicketTimeline } from "./timeline";

const PRINTED = -10; // rows already fully out of the printer on frame 0
const COUNT_FRAMES = 6; // the display rolls to each new total in 0.2s
const RAMP_FRAMES = 18; // an intermediate multiplier rolls in over 0.6s
const FINAL_TICKS = 7;

/**
 * "El Ticket": a thermal receipt prints what a shop leaks, the leak is
 * multiplied out to a month, the receipt is torn off, and Punto Listo answers
 * it — line by line on a second receipt, with a real recording, or both.
 * Every cue comes from `buildTimeline`.
 */
export function TicketStory(props: TicketStoryProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = buildTimeline(props, fps);
  const { loss, fix, proof, cta, pivot } = props;

  const lineSum = loss.lines.reduce((sum, line) => sum + line.amount, 0);
  const chain = multiplierChain(props, lineSum);
  const monthTotal = chain[chain.length - 1];
  const display = displayAt(frame, props, t, lineSum, chain);

  // The month total lands like a slammed drawer: a short damped shake.
  const sinceTotal = frame - t.total;
  const shake =
    sinceTotal >= 0 && sinceTotal < 18
      ? Math.sin(sinceTotal * 1.9) * 16 * Math.exp(-sinceTotal / 4)
      : 0;
  const flash =
    sinceTotal >= 0
      ? interpolate(sinceTotal, [0, 12], [0.35, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  const lossRows: ReceiptRow[] = [
    printRow(
      "store",
      70,
      PRINTED,
      <Centered text={loss.store} size={40} weight={700} />,
    ),
    printRow("title", 56, PRINTED, <Centered text={loss.title} size={34} />),
    printRow(
      "disclaimer",
      46,
      PRINTED,
      <Centered
        text={loss.disclaimer}
        size={24}
        weight={500}
        color={COLORS.muted}
      />,
    ),
    printRow("rule", ROW.rule, PRINTED, <Rule />),
    ...loss.lines.map((line, index) =>
      printRow(
        `line-${index}`,
        ROW.line,
        t.lossLines[index],
        <Line label={line.label} value={formatMoney(line.amount)} />,
      ),
    ),
    ...(loss.subtotalLabel && t.subtotal !== null
      ? [
          printRow(
            "subtotal",
            96,
            t.subtotal,
            <div style={{ width: "100%" }}>
              <Rule />
              <div style={{ height: 18 }} />
              <Line
                label={loss.subtotalLabel}
                value={formatMoney(lineSum)}
                isBold
              />
            </div>,
          ),
        ]
      : []),
    ...loss.multipliers.map((multiplier, index) =>
      printRow(
        `multiplier-${index}`,
        ROW.line,
        t.multipliers[index],
        <Line
          label={multiplier.label}
          value={`× ${multiplier.factor}`}
          isBold
        />,
      ),
    ),
    printRow(
      "total",
      150,
      t.total,
      <Total label={loss.totalLabel} value={formatMoney(monthTotal)} />,
    ),
  ];

  const fixRows: ReceiptRow[] =
    fix && t.fix
      ? [
          printRow("logo", 130, 0, <Logo src={pivot.logo} />),
          printRow(
            "folio",
            50,
            0,
            <Centered text={fix.header} size={30} weight={500} />,
          ),
          printRow("rule", ROW.rule, 0, <Rule />),
          ...fix.lines.map((line, index) =>
            printRow(
              `fix-${index}`,
              ROW.check,
              (t.fix?.lines[index] ?? 0) - (t.fix?.header ?? 0),
              <Check label={line} />,
            ),
          ),
          printRow(
            "stamp",
            150,
            t.fix.stamp - t.fix.header,
            <Stamp text={fix.stamp} at={t.fix.stamp - t.fix.header} />,
          ),
        ]
      : [];

  const ctaAt = (index: number) => t.ctaRows[index] - t.cta;
  const ctaRows: ReceiptRow[] = [
    printRow("logo", 150, ctaAt(0), <Logo src={cta.logo} />),
    printRow(
      "notes",
      ROW.line * cta.lines.length,
      ctaAt(1),
      <div style={{ width: "100%" }}>
        {cta.lines.map((line) => (
          <div
            key={line}
            style={{ height: ROW.line, display: "flex", alignItems: "center" }}
          >
            <Centered text={line} size={36} weight={600} />
          </div>
        ))}
      </div>,
    ),
    printRow(
      "barcode",
      170,
      ctaAt(2),
      <div style={{ width: "100%" }}>
        <Rule />
        <div style={{ height: 24 }} />
        <Barcode seed={cta.pill} />
      </div>,
    ),
    printRow("pill", 120, ctaAt(3), <Pill text={cta.pill} />),
    printRow(
      "thanks",
      70,
      ctaAt(4),
      <Centered text="¡GRACIAS POR SU PREFERENCIA!" size={28} weight={500} />,
    ),
  ];

  // The pivot card holds until whatever answers the leak takes the frame.
  const pivotEnd = t.fix?.header ?? t.proof ?? t.cta;
  const proofEnd = t.fix?.tear ?? t.cta;

  return (
    <AbsoluteFill
      name="TicketStory"
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 48%, #2E2722 0%, #1F1A17 55%, #120F0D 100%)",
      }}
    >
      {props.voice ? (
        <Audio name="Locución" src={staticFile(props.voice.audioFile)} />
      ) : null}
      <Audio
        name="Música"
        src={staticFile(props.music.src)}
        trimBefore={Math.round(props.music.trimBefore * fps)}
        loop
        volume={(f) =>
          interpolate(
            f,
            [0, 1, t.end - t.beat * 2, t.end],
            [0, props.music.volume, props.music.volume, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />
      <SfxCues cues={soundCues(props, t, fps)} />

      <AbsoluteFill style={{ translate: `${shake}px ${shake * 0.4}px` }}>
        <PrinterBody
          label={display.label}
          value={display.value}
          color={display.color}
        />

        <Sequence name="Ticket de fugas" durationInFrames={t.pivot}>
          <Receipt name="Ticket de fugas" rows={lossRows} tearAt={t.lossTear} />
        </Sequence>
        {t.fix ? (
          <Sequence
            name="Ticket Punto Listo"
            from={t.fix.header}
            durationInFrames={t.cta - t.fix.header}
          >
            <Receipt
              name="Ticket Punto Listo"
              rows={fixRows}
              tearAt={t.fix.tear - t.fix.header}
            />
          </Sequence>
        ) : null}
        <Sequence name="Ticket CTA" from={t.cta}>
          <Receipt name="Ticket CTA" rows={ctaRows} />
        </Sequence>

        <PrinterSlot />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 60%, transparent 30%, ${COLORS.tomato})`,
          opacity: flash,
        }}
      />

      {props.coldOpen && t.coldOpenEnd !== null ? (
        <>
          <Sequence name="Titular gancho" durationInFrames={t.coldOpenEnd}>
            <Headline text={props.coldOpen.headline} animateIn={false} />
          </Sequence>
          <Sequence
            name="Titular día"
            from={t.coldOpenEnd}
            durationInFrames={t.multipliers[0] - t.coldOpenEnd}
          >
            <Headline text={loss.headline} />
          </Sequence>
        </>
      ) : (
        <Sequence name="Titular día" durationInFrames={t.multipliers[0]}>
          <Headline text={loss.headline} animateIn={false} />
        </Sequence>
      )}
      <Sequence
        name="Titular mes"
        from={t.multipliers[0]}
        durationInFrames={t.pivot - t.multipliers[0]}
      >
        <Headline text={loss.monthHeadline} />
      </Sequence>
      {fix && t.fix ? (
        <Sequence
          name="Titular fix"
          from={t.fix.header}
          durationInFrames={(t.proof ?? t.cta) - t.fix.header}
        >
          <Headline text={fix.headline} />
        </Sequence>
      ) : null}
      {proof && t.proof !== null ? (
        <>
          <Sequence
            name="Prueba"
            from={t.proof}
            durationInFrames={proofEnd - t.proof}
          >
            <ProofCard proof={proof} />
          </Sequence>
          <Sequence
            name="Titular prueba"
            from={t.proof}
            durationInFrames={t.cta - t.proof}
          >
            <Headline text={proof.headline} />
          </Sequence>
        </>
      ) : null}
      <Sequence name="Titular CTA" from={t.cta}>
        <Headline text={cta.headline} />
      </Sequence>

      <Sequence
        name="Giro"
        from={t.pivot}
        durationInFrames={pivotEnd - t.pivot}
      >
        <PivotCard kicker={pivot.kicker} logo={pivot.logo} />
      </Sequence>
    </AbsoluteFill>
  );
}

function printRow(
  key: string,
  height: number,
  at: number,
  content: React.ReactNode,
): ReceiptRow {
  return { key, height, at, content };
}

/** The running total after each multiplier: [× 60 → day, × 30 → month]. */
function multiplierChain(props: TicketStoryProps, lineSum: number): number[] {
  const base = props.loss.unit ?? lineSum;

  return props.loss.multipliers.reduce<number[]>(
    (totals, multiplier) => [
      ...totals,
      (totals.length > 0 ? totals[totals.length - 1] : base) *
        multiplier.factor,
    ],
    [],
  );
}

interface DisplayState {
  label: string;
  value: string;
  color: string;
}

/** What the printer's display reads on a given frame — the video's scoreboard. */
function displayAt(
  frame: number,
  props: TicketStoryProps,
  t: TicketTimeline,
  lineSum: number,
  chain: number[],
): DisplayState {
  const { loss, fix, cta } = props;

  if (t.coldOpenEnd !== null && frame < t.coldOpenEnd) {
    return {
      label: loss.multipliers[loss.multipliers.length - 1].display,
      value: formatMoney(chain[chain.length - 1]),
      color: COLORS.tomato,
    };
  }

  if (frame < t.multipliers[0]) {
    const running = loss.lines.reduce(
      (sum, line, index) =>
        sum +
        line.amount *
          interpolate(
            frame,
            [t.lossLines[index], t.lossLines[index] + COUNT_FRAMES],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
      0,
    );
    return {
      label: loss.displayDay,
      value: formatMoney(running),
      color: COLORS.tomato,
    };
  }

  if (frame < t.pivot) {
    // The latest multiplier that has printed owns the display. The last one
    // accelerates into the total, so its final digits blur past.
    const index = t.multipliers.filter((at) => frame >= at).length - 1;
    const isLast = index === chain.length - 1;
    const from = index === 0 ? lineSum : chain[index - 1];
    const start = t.multipliers[index];
    const end = isLast
      ? t.total
      : Math.min(start + RAMP_FRAMES, t.multipliers[index + 1]);
    const value = interpolate(frame, [start, end], [from, chain[index]], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: isLast ? Easing.in(Easing.quad) : Easing.out(Easing.cubic),
    });

    return {
      label: loss.multipliers[index].display,
      value: formatMoney(value),
      color: COLORS.tomato,
    };
  }

  if (frame < t.cta && fix && t.fix && frame >= t.fix.header) {
    const checked = t.fix.lines.filter((at) => frame >= at).length;
    return {
      label: fix.displayLabel,
      value: `${checked}/${fix.lines.length}`,
      color: COLORS.successGlow,
    };
  }

  if (frame < t.cta) {
    return { label: "", value: "", color: COLORS.muted };
  }

  return {
    label: cta.displayLabel,
    value: frame >= t.ctaRows[0] ? cta.displayValue : "",
    color: COLORS.shopFloor,
  };
}

/** Every sound, in absolute seconds, hung on the same cues as the picture. */
function soundCues(
  props: TicketStoryProps,
  t: TicketTimeline,
  fps: number,
): Sfx[] {
  const s = (frameAt: number) => frameAt / fps;
  // The printer layer steps back when there is a voice to carry the video.
  const mech = props.voice?.mechanicalLevel ?? 1;
  const printer = (frameAt: number, volume = 0.55): Sfx => ({
    sound: TICKET_SFX.printer,
    at: s(frameAt),
    volume: volume * mech,
  });

  const lastMultiplier = t.multipliers[t.multipliers.length - 1];
  const finalTicks = Array.from({ length: FINAL_TICKS }, (_, index) => {
    // Ticks bunch up toward the total, matching the display's acceleration.
    const progress = Math.sqrt(index / FINAL_TICKS);
    return {
      sound: TICKET_SFX.tick,
      at: s(lastMultiplier + progress * (t.total - lastMultiplier)),
      volume: 0.45 * mech,
    };
  });

  const cues: Sfx[] = [
    ...t.lossLines.map((at) => printer(at)),
    ...t.lossLines.map((at) => ({
      sound: TICKET_SFX.tick,
      at: s(at + 2),
      volume: 0.4 * mech,
    })),
    ...(t.subtotal === null ? [] : [printer(t.subtotal)]),
    ...t.multipliers.map((at) => printer(at)),
    ...finalTicks,
    printer(t.total, 0.35),
    { sound: SFX.softHit, at: s(t.total), volume: 0.35 },
    { sound: TICKET_SFX.tear, at: s(t.lossTear), volume: 0.55 * mech },
    { sound: SFX.whoosh, at: s(t.pivot - 3), volume: 0.45 },
    { sound: SFX.softHit, at: s(t.pivot), volume: 0.4 },
    ...t.ctaRows.map((at) => printer(at, 0.45)),
    { sound: SFX.ding, at: s(t.ctaRows[3] + 2), volume: 0.3 },
  ];

  if (t.coldOpenEnd !== null) {
    // The total lands on frame 0, then the display rewinds to zero.
    cues.push(
      { sound: SFX.softHit, at: 0, volume: 0.22 },
      { sound: SFX.whoosh, at: s(t.coldOpenEnd - 4), volume: 0.4 },
    );
  }

  if (t.fix) {
    cues.push(
      printer(t.fix.header),
      ...t.fix.lines.map((at) => printer(at, 0.45)),
      ...t.fix.lines.map((at) => ({
        sound: SFX.pop,
        at: s(at + 3),
        volume: 0.5,
      })),
      { sound: SFX.softHit, at: s(t.fix.stamp + 3), volume: 0.5 },
      { sound: SFX.ding, at: s(t.fix.stamp + 4), volume: 0.35 },
      { sound: TICKET_SFX.tear, at: s(t.fix.tear), volume: 0.5 * mech },
    );
  }

  if (props.proof && t.proof !== null) {
    cues.push(
      { sound: SFX.whoosh, at: s(t.proof), volume: 0.45 },
      {
        sound: SFX.pop,
        at: s(t.proof) + props.proof.highlight.at,
        volume: 0.55,
      },
    );
    const { cut } = props.proof;
    if (cut) {
      cues.push(
        { sound: SFX.whoosh, at: s(t.proof) + cut.at, volume: 0.3 },
        {
          sound: SFX.pop,
          at: s(t.proof) + cut.at + cut.highlight.at,
          volume: 0.4,
        },
      );
    }
  }

  return cues;
}
