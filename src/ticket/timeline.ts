import type { TicketStoryProps } from "./schema";

/**
 * Every cue in the video sits on the music's beat grid, so the printer, the
 * counter and the cuts all hit with the bed instead of drifting against it.
 * Positions are counted in beats and converted to frames once, here — adding a
 * receipt line pushes everything after it back by whole beats.
 *
 * A narrated episode passes `timing` to pin the story beats (multipliers,
 * total, tear, pivot, proof, CTA) to the words that say them; the receipt
 * lines still print on the grid.
 */
export interface TicketTimeline {
  beat: number; // frames per beat
  lossLines: number[];
  subtotal: number | null;
  multipliers: number[];
  total: number;
  lossTear: number;
  pivot: number;
  /** The answer receipt, when the episode has one. */
  fix: {
    header: number;
    lines: number[];
    stamp: number;
    tear: number;
  } | null;
  proof: number | null;
  cta: number;
  ctaRows: number[];
  end: number;
}

const MULTIPLIER_BEATS = 2;
const FIX_LINE_BEATS = 1; // the answers come twice as fast as the problems
const PROOF_BEATS = 5;
const CTA_ROWS = 5; // logo, the notes, barcode, pill and thanks

export function buildTimeline(
  props: TicketStoryProps,
  fps: number,
): TicketTimeline {
  const beat = (fps * 60) / props.music.bpm;
  const at = (beats: number) => Math.round(beats * beat);
  const sec = (seconds: number) => Math.round(seconds * fps);
  const { loss, fix, proof, timing } = props;

  const lossLines = loss.lines.map((_, index) =>
    at(loss.lineStart + loss.lineBeats * index),
  );
  const afterLines = loss.lineStart + loss.lineBeats * loss.lines.length;
  const subtotal = loss.subtotalLabel ? afterLines : null;
  const firstMultiplier = afterLines + (subtotal === null ? 0 : 1);

  // Beat-grid positions, used wherever `timing` does not pin a cue.
  const gridMultipliers = loss.multipliers.map(
    (_, index) => firstMultiplier + MULTIPLIER_BEATS * index,
  );
  const gridTotal = gridMultipliers[gridMultipliers.length - 1] + 2;
  const total = timing ? sec(timing.total) : at(gridTotal);
  const lossTear = timing ? sec(timing.tear) : at(gridTotal + 3);
  const pivot = timing ? sec(timing.pivot) : at(gridTotal + 4);
  const pivotBeats = timing
    ? timing.pivot * (props.music.bpm / 60)
    : gridTotal + 4;

  const fixHeaderBeats = pivotBeats + 2;
  const stampBeats = fix
    ? fixHeaderBeats + 1 + FIX_LINE_BEATS * fix.lines.length
    : null;

  const proofBeats = proof
    ? stampBeats === null
      ? pivotBeats + 2
      : stampBeats + 3
    : null;
  const proofAt = proof
    ? timing?.proof !== undefined
      ? sec(timing.proof)
      : at(proofBeats ?? 0)
    : null;

  const fixTearBeats =
    stampBeats === null
      ? null
      : proofBeats === null
        ? stampBeats + 3
        : proofBeats + PROOF_BEATS;

  const ctaBeats =
    fixTearBeats !== null
      ? fixTearBeats + 1
      : proofBeats !== null
        ? proofBeats + PROOF_BEATS
        : pivotBeats + 2;
  const cta = timing ? sec(timing.cta) : at(ctaBeats);
  const ctaRows = Array.from(
    { length: CTA_ROWS },
    (_, index) => cta + at(1 + index),
  );
  const end = timing ? sec(timing.end) : at(ctaBeats + CTA_ROWS + 3);

  return {
    beat,
    lossLines,
    subtotal: subtotal === null ? null : at(subtotal),
    multipliers: timing ? timing.multipliers.map(sec) : gridMultipliers.map(at),
    total,
    lossTear,
    pivot,
    fix:
      fix && stampBeats !== null && fixTearBeats !== null
        ? {
            header: at(fixHeaderBeats),
            lines: fix.lines.map((_, index) =>
              at(fixHeaderBeats + 1 + FIX_LINE_BEATS * index),
            ),
            stamp: at(stampBeats),
            tear: at(fixTearBeats),
          }
        : null,
    proof: proofAt,
    cta,
    ctaRows,
    end,
  };
}
