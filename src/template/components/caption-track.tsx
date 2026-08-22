import {
  Caption,
  createTikTokStyleCaptions,
  TikTokPage,
} from "@remotion/captions";
import { fitText } from "@remotion/layout-utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
  watchStaticFile,
} from "remotion";
import type { PosDemoProps } from "../schema";
import { CAPTION_BAND } from "./demo-layout";

// ~1–4 words per page: the TikTok look, driven entirely by timestamps.
const COMBINE_TOKENS_WITHIN_MS = 1200;

type CaptionStyle = PosDemoProps["captionStyle"];

interface CaptionTrackProps {
  captionsFile: string;
  visibleFrom: number;
  visibleUntil: number;
  style: CaptionStyle;
}

function CaptionPage({
  page,
  offsetMs,
  style,
}: {
  page: TikTokPage;
  offsetMs: number;
  style: CaptionStyle;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000 + offsetMs;

  const fitted = fitText({
    fontFamily: "Archivo",
    fontWeight: "800",
    text: page.text,
    withinWidth: CAPTION_BAND.width,
  });

  const onVideo = style === "video";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        top: CAPTION_BAND.top,
        height: CAPTION_BAND.height,
      }}
    >
      <div
        style={{
          width: CAPTION_BAND.width,
          textAlign: "center",
          fontFamily: "Archivo",
          fontWeight: 800,
          fontSize: Math.min(104, fitted.fontSize),
          lineHeight: 1.06,
          letterSpacing: "-0.03em",
          color: onVideo ? "#FFFFFF" : "#221E18",
          WebkitTextStroke: onVideo ? "14px #221E18" : undefined,
          paintOrder: "stroke",
          textShadow: onVideo ? undefined : "0 2px 0 rgba(247, 243, 235, 0.9)",
          scale: interpolate(frame, [0, 5], [0.86, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
          translate: interpolate(frame, [0, 6], ["0px 14px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs - page.startMs <= timeInMs &&
            token.toMs - page.startMs > timeInMs;

          return (
            <span
              key={token.fromMs}
              style={{
                display: "inline",
                whiteSpace: "pre",
                color: isActive ? "#DE5134" : onVideo ? "#FFFFFF" : "#221E18",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/**
 * Word-by-word captions straight from the Whisper JSON, in the caption band.
 * Pages are anchored to the audio's own timestamps, so they cannot drift.
 */
export function CaptionTrack({
  captionsFile,
  visibleFrom,
  visibleUntil,
  style,
}: CaptionTrackProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(staticFile(captionsFile));
      setCaptions((await res.json()) as Caption[]);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [captionsFile, continueRender, handle]);

  useEffect(() => {
    fetchCaptions();
    const watcher = watchStaticFile(captionsFile, fetchCaptions);
    return () => watcher.cancel();
  }, [captionsFile, fetchCaptions]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: COMBINE_TOKENS_WITHIN_MS,
      captions,
    });
  }, [captions]);

  return (
    <Interactive.Div name="Captions">
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const lastToken = page.tokens[page.tokens.length - 1];
        const endMs = nextPage ? nextPage.startMs : (lastToken?.toMs ?? 0);

        const from = Math.round((page.startMs / 1000) * fps);
        const until = Math.round((endMs / 1000) * fps);

        const clampedFrom = Math.max(from, visibleFrom);
        const clampedUntil = Math.min(until, visibleUntil);

        if (clampedUntil <= clampedFrom) {
          return null;
        }

        return (
          <Sequence
            key={page.startMs}
            name={page.text}
            from={clampedFrom}
            durationInFrames={clampedUntil - clampedFrom}
            layout="none"
          >
            <CaptionPage
              page={page}
              offsetMs={((clampedFrom - from) / fps) * 1000}
              style={style}
            />
          </Sequence>
        );
      })}
    </Interactive.Div>
  );
}
