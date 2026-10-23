import { AbsoluteFill, Img, staticFile } from "remotion";
import "../template/fonts";
import type { CarouselSlide, CarouselSlideProps } from "./schema";

const COLORS = {
  tomato: "#E44D2E",
  ink: "#1F1A17",
  shopFloor: "#F7F4EF",
  muted: "#6B615A",
} as const;

const SANS = "Archivo";
const PAD = 72;

/**
 * One 1080x1350 carousel slide in Punto Listo's palette: a photo cover, a
 * numbered tip with its photo above the copy, or the closing ask.
 */
export function CarouselSlideView({ slide, page, pages, logo }: CarouselSlideProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.shopFloor, fontFamily: SANS }}>
      {renderSlide(slide)}
      {slide.type === "cta" ? null : (
        <Footer logo={logo} page={page} pages={pages} isOnPhoto={slide.type === "cover"} />
      )}
    </AbsoluteFill>
  );
}

function renderSlide(slide: CarouselSlide) {
  switch (slide.type) {
    case "cover":
      return <Cover slide={slide} />;
    case "tip":
      return <Tip slide={slide} />;
    case "cta":
      return <Cta slide={slide} />;
    default:
      return null;
  }
}

/** "a *b* c" → runs, the starred ones in tomato; "\n" survives via pre-line. */
function Accented({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/)
        .filter(Boolean)
        .map((part, index) => {
          const isAccent = part.startsWith("*") && part.endsWith("*");
          return (
            <span key={index} style={{ color: isAccent ? COLORS.tomato : undefined }}>
              {isAccent ? part.slice(1, -1) : part}
            </span>
          );
        })}
    </>
  );
}

function Photo({ src, style }: { src: string; style: React.CSSProperties }) {
  return (
    <Img
      src={staticFile(src)}
      style={{ objectFit: "cover", maxWidth: "none", display: "block", ...style }}
    />
  );
}

function Cover({ slide }: { slide: Extract<CarouselSlide, { type: "cover" }> }) {
  return (
    <AbsoluteFill>
      <Photo src={slide.photo} style={{ width: 1080, height: 1350 }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,14,0.15) 0%, rgba(20,16,14,0.35) 35%, rgba(20,16,14,0.92) 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          bottom: 190,
          color: COLORS.shopFloor,
        }}
      >
        <div
          style={{
            fontSize: 104,
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            whiteSpace: "pre-line",
          }}
        >
          <Accented text={slide.title} />
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 44,
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            opacity: 0.9,
            whiteSpace: "pre-line",
          }}
        >
          {slide.subtitle}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 36,
            padding: "18px 34px",
            borderRadius: 999,
            backgroundColor: COLORS.tomato,
            fontSize: 38,
            fontWeight: 700,
          }}
        >
          {slide.pill}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Tip({ slide }: { slide: Extract<CarouselSlide, { type: "tip" }> }) {
  const photoHeight = 760;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: PAD - 24,
          top: PAD - 24,
          width: 1080 - (PAD - 24) * 2,
          height: photoHeight,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(31, 26, 23, 0.18)",
        }}
      >
        <Photo src={slide.photo} style={{ width: "100%", height: "100%" }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: PAD - 24 + photoHeight - 64,
          width: 128,
          height: 128,
          borderRadius: 999,
          backgroundColor: COLORS.tomato,
          border: `8px solid ${COLORS.shopFloor}`,
          color: "#FFFFFF",
          fontSize: 68,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: "-0.04em",
        }}
      >
        {slide.number}
      </div>
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          top: PAD - 24 + photoHeight + 96,
          color: COLORS.ink,
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            whiteSpace: "pre-line",
          }}
        >
          <Accented text={slide.title} />
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 44,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: COLORS.muted,
            whiteSpace: "pre-line",
          }}
        >
          <Accented text={slide.body} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Cta({ slide }: { slide: Extract<CarouselSlide, { type: "cta" }> }) {
  return (
    <AbsoluteFill
      style={{
        padding: PAD,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: COLORS.ink,
      }}
    >
      <Img src={staticFile(slide.logo)} style={{ width: 700, maxWidth: "none" }} />
      <div
        style={{
          marginTop: 110,
          fontSize: 88,
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          whiteSpace: "pre-line",
        }}
      >
        <Accented text={slide.title} />
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 50,
          fontWeight: 500,
          lineHeight: 1.3,
          color: COLORS.muted,
          whiteSpace: "pre-line",
        }}
      >
        <Accented text={slide.body} />
      </div>
      <div
        style={{
          marginTop: 90,
          padding: "28px 56px",
          borderRadius: 999,
          backgroundColor: COLORS.tomato,
          color: "#FFFFFF",
          fontSize: 50,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "0 18px 40px rgba(228, 77, 46, 0.35)",
        }}
      >
        {slide.pill}
      </div>
    </AbsoluteFill>
  );
}

function Footer({
  logo,
  page,
  pages,
  isOnPhoto,
}: {
  logo: string;
  page: number;
  pages: number;
  isOnPhoto: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        right: PAD,
        bottom: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          padding: isOnPhoto ? "14px 22px" : 0,
          borderRadius: 999,
          backgroundColor: isOnPhoto ? COLORS.shopFloor : "transparent",
          display: "flex",
        }}
      >
        <Img src={staticFile(logo)} style={{ width: 230, maxWidth: "none" }} />
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: isOnPhoto ? COLORS.shopFloor : COLORS.muted,
        }}
      >
        {page}/{pages}
      </div>
    </div>
  );
}
