import { Interactive } from "remotion";
import { COLORS, MONO, STAGE } from "../theme";

interface PrinterProps {
  label: string;
  value: string;
  color: string;
}

const BODY_TOP = STAGE.slotY - 26;

/**
 * The register the receipts come out of. Its display is the video's running
 * score: the leak total climbs, then the leaks get checked off, then it
 * carries the offer.
 */
export function PrinterBody({ label, value, color }: PrinterProps) {
  return (
    <Interactive.Div
      name="Impresora"
      style={{
        position: "absolute",
        left: 80,
        top: BODY_TOP,
        width: 920,
        height: 1920 - BODY_TOP,
        borderRadius: "48px 48px 0 0",
        background:
          "linear-gradient(180deg, #3A322C 0%, #29231F 30%, #1A1613 100%)",
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,0.08), 0 -20px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 80,
          width: 800,
          height: 210,
          borderRadius: 26,
          backgroundColor: "#110E0C",
          boxShadow:
            "inset 0 4px 18px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06)",
          fontFamily: MONO,
          padding: "22px 36px",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: COLORS.muted,
            height: 40,
          }}
        >
          {label}
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 104,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color,
            textShadow: `0 0 28px ${color}66`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
      </div>
    </Interactive.Div>
  );
}

/** Drawn over the paper, so the receipt looks like it comes out of it. */
export function PrinterSlot() {
  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        top: STAGE.slotY - 8,
        width: 820,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#0A0807",
        boxShadow:
          "inset 0 3px 6px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.08)",
      }}
    />
  );
}
