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
import { Headline } from "../ticket/components/headline";
import { PrinterBody, PrinterSlot } from "../ticket/components/printer";
import { ProofCard } from "../ticket/components/proof-card";
import { Receipt, type ReceiptRow } from "../ticket/components/receipt";
import { Centered, Line, ROW, Rule } from "../ticket/components/receipt-rows";
import { TICKET_SFX } from "../ticket/schema";
import { COLORS, formatMoney, STAGE } from "../ticket/theme";
import { ctaReceiptRows } from "../ticket/ticket-story";
import type { RetoTicketProps } from "./ticket-schema";

const PRINTED = -10; // already out of the printer on frame 0
const SLOT_GAP = 18; // matches Receipt: the last row clears the slot by this
const PAPER_PAD = 44;
const TEAR_LEAD = 16; // frames the receipt is torn off before the CTA prints
/**
 * The printer and the tear sit under the narration at El Ticket's level
 * (`voice.mechanicalLevel`, ~-15 dB): at full level they compete with it.
 */
const MECHANICAL_LEVEL = 0.17;

/**
 * Reto del mostrador #6 and on: the whole receipt is already printed on frame
 * 0 with one wrong line, the voice asks "¿Lo ves?", a three-beat countdown
 * scans the paper while the viewer hunts, then the wrong line is ringed, the
 * right amount takes the printer's display and a recording proves Punto
 * Listo would have got it right.
 */
export function RetoTicket(props: RetoTicketProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = (seconds: number) => Math.round(seconds * fps);
  const { receipt, pause, timing, headlines, music } = props;

  const pauseAt = sec(pause.at);
  const pauseFrames = sec(pause.for);
  const revealFrom = pauseAt + pauseFrames;
  const countBeat = pauseFrames / 3;
  const ringAt = sec(timing.ring);
  const correctAt = sec(timing.correct);
  const proofAt = sec(timing.proof);
  const ctaAt = sec(timing.cta);
  const shareAt = sec(timing.share);
  const beat = Math.round(fps / 2); // nastelbom at 120 bpm

  const rows = receiptRows(receipt);
  // Rows are stacked up from the slot, so the last one (CAMBIO) sits on it.
  const rowTop = (index: number) =>
    STAGE.slotY -
    SLOT_GAP -
    rows.slice(index).reduce((sum, row) => sum + row.height, 0);
  const firstItem = 4; // store, title, disclaimer, rule
  const changeRow = rows.length - 1;
  const scanRows = rows
    .map((_, index) => index)
    .filter(
      (index) =>
        index >= firstItem &&
        rows[index].key !== "rule-2" &&
        index <= changeRow,
    );

  const ctaRows = ctaReceiptRows(props.cta, (index) => beat * (1 + index));

  const display = displayAt(frame, props, {
    pauseAt,
    revealFrom,
    countBeat,
    ringAt,
    correctAt,
    ctaAt,
    beat,
  });

  return (
    <AbsoluteFill
      name="RetoTicket"
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 48%, #2E2722 0%, #1F1A17 55%, #120F0D 100%)",
      }}
    >
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
            [
              0,
              2,
              pauseAt,
              pauseAt + 4,
              revealFrom - 4,
              revealFrom,
              durationInFrames - 20,
              durationInFrames,
            ],
            [
              0,
              music.volume,
              music.volume,
              music.countdownVolume,
              music.countdownVolume,
              music.volume,
              music.volume,
              0,
            ],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <SfxCues
        cues={soundCues(fps, {
          pauseAt,
          countBeat,
          ringAt,
          correctAt,
          proofAt,
          proofRing: props.proof.highlight.at,
          ctaAt,
          beat,
        })}
      />

      <PrinterBody
        label={display.label}
        value={display.value}
        color={display.color}
      />
      <Sequence name="Ticket con error" durationInFrames={ctaAt}>
        <Receipt
          name="Ticket con error"
          rows={rows}
          tearAt={ctaAt - TEAR_LEAD}
        />
        <Scanner
          rowTops={scanRows.map(rowTop)}
          from={pauseAt}
          frames={pauseFrames}
        />
        <WrongLine
          top={rowTop(changeRow)}
          ringAt={ringAt}
          strikeAt={ringAt + 8}
          until={ctaAt - TEAR_LEAD}
        />
      </Sequence>
      <Sequence name="Ticket CTA" from={ctaAt}>
        <Receipt name="Ticket CTA" rows={ctaRows} />
      </Sequence>
      <PrinterSlot />

      <Sequence name="Titular pregunta" durationInFrames={revealFrom}>
        <Headline text={headlines.ask} animateIn={false} />
      </Sequence>
      <Sequence
        name="Titular respuesta"
        from={revealFrom}
        durationInFrames={proofAt - revealFrom}
      >
        <Headline text={headlines.reveal} />
      </Sequence>
      <Sequence
        name="Prueba"
        from={proofAt}
        durationInFrames={ctaAt - proofAt}
      >
        <ProofCard proof={props.proof} />
      </Sequence>
      <Sequence
        name="Titular prueba"
        from={proofAt}
        durationInFrames={ctaAt - proofAt}
      >
        <Headline text={headlines.proof} />
      </Sequence>
      <Sequence
        name="Titular CTA"
        from={ctaAt}
        durationInFrames={shareAt - ctaAt}
      >
        <Headline text={headlines.cta} />
      </Sequence>
      <Sequence name="Titular compartir" from={shareAt}>
        <Headline text={headlines.share} />
      </Sequence>

      <Sequence
        name="Cuenta regresiva"
        from={pauseAt}
        durationInFrames={pauseFrames}
      >
        <PromptChip text={pause.prompt} />
      </Sequence>
    </AbsoluteFill>
  );
}

function row(
  key: string,
  height: number,
  content: React.ReactNode,
): ReceiptRow {
  return { key, height, at: PRINTED, content };
}

function receiptRows(receipt: RetoTicketProps["receipt"]): ReceiptRow[] {
  return [
    row("store", 70, <Centered text={receipt.store} size={40} weight={700} />),
    row("title", 56, <Centered text={receipt.title} size={34} />),
    row(
      "disclaimer",
      46,
      <Centered
        text={receipt.disclaimer}
        size={24}
        weight={500}
        color={COLORS.muted}
      />,
    ),
    row("rule-1", ROW.rule, <Rule />),
    ...receipt.items.map((item, index) =>
      row(
        `item-${index}`,
        ROW.line,
        <Line label={item.label} value={formatMoney(item.amount)} />,
      ),
    ),
    row("rule-2", ROW.rule, <Rule />),
    row(
      "total",
      ROW.line,
      <Line label="TOTAL" value={formatMoney(receipt.total)} isBold />,
    ),
    row(
      "paid",
      ROW.line,
      <Line label="EFECTIVO" value={formatMoney(receipt.paid)} />,
    ),
    row(
      "change",
      ROW.line,
      <Line label="CAMBIO" value={formatMoney(receipt.change)} isBold />,
    ),
  ];
}

/** A marker that walks the paper line by line while the viewer looks. */
function Scanner({
  rowTops,
  from,
  frames,
}: {
  rowTops: number[];
  from: number;
  frames: number;
}) {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < 0 || local >= frames) {
    return null;
  }

  const position = interpolate(local, [0, frames], [0, rowTops.length - 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const index = Math.floor(position);
  const next = Math.min(rowTops.length - 1, index + 1);
  const top = interpolate(position - index, [0, 1], [rowTops[index], rowTops[next]]);

  return (
    <div
      style={{
        position: "absolute",
        left: STAGE.paperLeft + PAPER_PAD - 16,
        width: STAGE.paperWidth - PAPER_PAD * 2 + 32,
        top: top - 4,
        height: ROW.line + 8,
        borderRadius: 10,
        backgroundColor: "rgba(250, 204, 21, 0.35)",
        mixBlendMode: "multiply",
      }}
    />
  );
}

/** The ring around the wrong line, then a strike through its amount. */
function WrongLine({
  top,
  ringAt,
  strikeAt,
  until,
}: {
  top: number;
  ringAt: number;
  strikeAt: number;
  until: number;
}) {
  const frame = useCurrentFrame();
  if (frame < ringAt || frame >= until) {
    return null;
  }

  const ring = interpolate(frame, [ringAt, ringAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
  const strike = interpolate(frame, [strikeAt, strikeAt + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const valueLeft = STAGE.paperLeft + STAGE.paperWidth - PAPER_PAD - 190;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: STAGE.paperLeft + PAPER_PAD - 22,
          width: STAGE.paperWidth - PAPER_PAD * 2 + 44,
          top: top - 10,
          height: ROW.line + 20,
          borderRadius: 16,
          border: `7px solid ${COLORS.tomato}`,
          opacity: ring,
          scale: String(interpolate(ring, [0, 1], [1.15, 1])),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: valueLeft,
          top: top + ROW.line / 2 - 3,
          width: 196 * strike,
          height: 7,
          borderRadius: 4,
          backgroundColor: COLORS.tomato,
        }}
      />
    </>
  );
}

function PromptChip({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: STAGE.paperTop - 40,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "20px 40px",
          borderRadius: 999,
          backgroundColor: COLORS.tomato,
          color: "#FFFFFF",
          fontFamily: "Archivo",
          fontSize: 50,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          boxShadow: "0 18px 40px rgba(228, 77, 46, 0.45)",
          scale: String(interpolate(pop, [0, 1], [0.7, 1])),
          opacity: pop,
        }}
      >
        {text}
      </div>
    </div>
  );
}

interface Marks {
  pauseAt: number;
  revealFrom: number;
  countBeat: number;
  ringAt: number;
  correctAt: number;
  ctaAt: number;
  beat: number;
}

/** The printer's display: total, the countdown, the overpay, the right change. */
function displayAt(frame: number, props: RetoTicketProps, marks: Marks) {
  const { receipt, cta } = props;

  if (frame < marks.pauseAt) {
    return {
      label: "TOTAL",
      value: formatMoney(receipt.total),
      color: COLORS.tomato,
    };
  }
  if (frame < marks.revealFrom) {
    const index = Math.min(
      2,
      Math.floor((frame - marks.pauseAt) / marks.countBeat),
    );
    return { label: "¿DÓNDE ESTÁ?", value: String(3 - index), color: COLORS.tomato };
  }
  if (frame < marks.ringAt) {
    return { label: "", value: "", color: COLORS.muted };
  }
  if (frame < marks.correctAt) {
    return {
      label: "SE DIERON DE MÁS",
      value: formatMoney(receipt.change - props.correctChange),
      color: COLORS.tomato,
    };
  }
  if (frame < marks.ctaAt) {
    return {
      label: "CAMBIO CORRECTO",
      value: formatMoney(props.correctChange),
      color: COLORS.successGlow,
    };
  }
  return {
    label: cta.displayLabel,
    value: frame >= marks.ctaAt + marks.beat ? cta.displayValue : "",
    color: COLORS.shopFloor,
  };
}

interface CueMarks {
  pauseAt: number;
  countBeat: number;
  ringAt: number;
  correctAt: number;
  proofAt: number;
  proofRing: number;
  ctaAt: number;
  beat: number;
}

function soundCues(fps: number, marks: CueMarks): Sfx[] {
  const s = (frame: number) => frame / fps;
  const printer = (frame: number): Sfx => ({
    sound: TICKET_SFX.printer,
    at: s(frame),
    volume: 0.45 * MECHANICAL_LEVEL,
  });

  return [
    ...[0, 1, 2].map((index) => ({
      sound: TICKET_SFX.tick,
      at: s(Math.round(marks.pauseAt + index * marks.countBeat)),
      volume: 0.6,
    })),
    { sound: SFX.softHit, at: s(marks.ringAt), volume: 0.45 },
    { sound: SFX.pop, at: s(marks.correctAt), volume: 0.5 },
    { sound: SFX.whoosh, at: s(marks.proofAt), volume: 0.45 },
    { sound: SFX.pop, at: s(marks.proofAt) + marks.proofRing, volume: 0.55 },
    {
      sound: TICKET_SFX.tear,
      at: s(marks.ctaAt - TEAR_LEAD),
      volume: 0.55 * MECHANICAL_LEVEL,
    },
    ...[1, 2, 3, 4, 5].map((index) => printer(marks.ctaAt + marks.beat * index)),
    { sound: SFX.ding, at: s(marks.ctaAt + marks.beat * 4 + 2), volume: 0.3 },
  ];
}
