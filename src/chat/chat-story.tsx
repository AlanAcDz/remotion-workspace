import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Interactive,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SfxCues } from "../template/components/sfx-cues";
import "../template/fonts";
import { SFX, type Sfx } from "../template/schema";
import { CtaScene } from "../template/scenes/cta-scene";
import { THEMES } from "../template/theme";
import { TICKET_SFX } from "../ticket/schema";
import type { ChatMessage, ChatStoryProps } from "./schema";

const COLORS = {
  ink: "#1F1A17",
  tomato: "#E44D2E",
  wallpaper: "#EFE8DD",
  incoming: "#FFFFFF",
  outgoing: "#FBDCD1",
  muted: "#8A8078",
  header: "#1F1A17",
  headerMuted: "#CFC6BC",
  typing: "#F4A28F",
  ticks: "#3B82F6",
  bars: "#D5CDC3",
  unsaid: "#B9AFA4",
} as const;

const FONT = "Archivo";

/** Phone chrome, top to bottom. The chat scrolls inside VIEWPORT. */
const LAYOUT = {
  statusBar: 72,
  headerBottom: 236,
  viewportTop: 252,
  viewportBottom: 1460,
  inputTop: 1484,
  inputHeight: 116,
} as const;

const BUBBLE = {
  fontSize: 46,
  lineHeight: 58,
  padX: 32,
  padTop: 22,
  timeRow: 40,
  padBottom: 14,
  gap: 18,
  /** Room for the platform's right-hand icons beside the owner's bubbles. */
  meRight: 130,
  themLeft: 40,
  imageWidth: 620,
  imagePad: 10,
} as const;

/** A voice note: a player row over its transcript. Lines never wrap. */
const VOICE = {
  width: 760,
  playerRow: 112,
  playButton: 88,
  bars: 30,
  barWidth: 8,
  barGap: 6,
  barMaxHeight: 76,
  /** The takes peak near 0 dBFS; this leaves headroom over the bed. */
  level: 0.8,
  /** The bed sits this far under a note, so its words carry. */
  duck: 0.3,
  duckFrames: 6,
} as const;

const DOTS_HEIGHT = 96;
/** Characters the input bar shows before the draft starts scrolling. */
const DRAFT_FITS = 30;
const ENTER_FRAMES = 7;
const CTA_FADE = 8;

/**
 * "El Chat": a conversation between the cashier and the owner, read off the
 * owner's phone. No voiceover — the messages are the script, landing on their
 * own clock with a pop. The chat scrolls like a real one: every bubble pushes
 * the stack up by its own height, so there is nothing to measure at render
 * time. Copy breaks lines with "\n" and never wraps.
 */
export function ChatStory(props: ChatStoryProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ctaFrom = Math.round(props.cta.from * fps);

  const items = buildStack(props.messages, fps);
  const viewport = LAYOUT.viewportBottom - LAYOUT.viewportTop;

  // Each item's share of the stack eases in (and the dots bubble back out),
  // so the scroll glides instead of jumping a whole bubble at a time.
  const shares = items.map((item) => item.height * presence(frame, item));
  const stackHeight = shares.reduce((sum, share) => sum + share, 0);
  // Bottom-anchored like a real chat: the newest bubble sits on the input
  // bar and history fills upward (negative scroll leaves room above).
  const scroll = stackHeight - viewport;

  const typingThem = items.some(
    (item) => item.kind === "dots" && frame >= item.from && frame < item.until,
  );
  const draft = draftAt(frame, props.messages, fps);

  const chatOpacity = interpolate(frame, [ctaFrom - CTA_FADE, ctaFrom], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let offset = 0;

  return (
    <AbsoluteFill name="ChatStory" style={{ backgroundColor: COLORS.wallpaper }}>
      <Audio
        name="Música"
        src={staticFile(props.music.src)}
        trimBefore={Math.round(props.music.trimBefore * fps)}
        loop
        volume={(f) =>
          interpolate(
            f,
            [0, 1, durationInFrames - 20, durationInFrames],
            [0, props.music.volume, props.music.volume, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ) * voiceDuck(f, props.messages, fps)
        }
      />
      {props.messages.map((message, index) =>
        message.voice ? (
          <Sequence
            key={`voice-${index}`}
            name="Nota de voz"
            from={Math.round(message.at * fps)}
          >
            <Audio src={staticFile(message.voice.src)} volume={() => VOICE.level} />
          </Sequence>
        ) : null,
      )}
      <SfxCues cues={soundCues(props, fps)} />

      <AbsoluteFill style={{ opacity: chatOpacity }}>
        <Interactive.Div
          name="Conversación"
          style={{
            position: "absolute",
            left: 0,
            top: LAYOUT.viewportTop,
            width: 1080,
            height: viewport,
            overflow: "hidden",
          }}
        >
          {items.map((item, index) => {
            const top = offset - scroll;
            offset += shares[index];
            const visible = presence(frame, item);
            if (visible <= 0) {
              return null;
            }

            return (
              <StackItem
                key={item.key}
                item={item}
                top={top}
                visible={visible}
                frame={frame}
                fps={fps}
              />
            );
          })}
        </Interactive.Div>

        <Header
          clock={props.clock}
          contact={props.contact}
          status={typingThem ? "escribiendo…" : props.contact.status}
          isTyping={typingThem}
        />
        <InputBar draft={draft} />
      </AbsoluteFill>

      <Sequence name="CTA" from={ctaFrom}>
        <AbsoluteFill
          style={{
            backgroundColor: THEMES["punto-listo"].colors.background,
            opacity: interpolate(frame - ctaFrom, [0, CTA_FADE], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Takeaway text={props.cta.takeaway} />
          <CtaScene cta={props.cta} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}

interface StackEntry {
  key: string;
  kind: "message" | "dots";
  message: ChatMessage | null;
  height: number;
  /** Frame the item starts entering. */
  from: number;
  /** Frame a dots bubble leaves; Infinity for messages. */
  until: number;
}

/** Messages in order, each preceded by its dots bubble when "them" types. */
function buildStack(messages: ChatMessage[], fps: number): StackEntry[] {
  return messages.flatMap((message, index) => {
    const at = Math.round(message.at * fps);
    const entry: StackEntry = {
      key: `message-${index}`,
      kind: "message",
      message,
      height: messageHeight(message) + BUBBLE.gap,
      // Frame-0 messages are already there: no entrance on the thumbnail.
      from: at === 0 ? -ENTER_FRAMES : at,
      until: Number.POSITIVE_INFINITY,
    };

    if (message.from !== "them" || message.typing === 0) {
      return [entry];
    }

    return [
      {
        key: `dots-${index}`,
        kind: "dots",
        message: null,
        height: DOTS_HEIGHT + BUBBLE.gap,
        from: at - Math.round(message.typing * fps),
        until: at,
      },
      entry,
    ];
  });
}

/** 0 → 1 as an item enters; a dots bubble collapses as its message lands. */
function presence(frame: number, item: StackEntry): number {
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const enter = interpolate(frame, [item.from, item.from + ENTER_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  if (item.until === Number.POSITIVE_INFINITY) {
    return enter;
  }

  const leave = interpolate(frame, [item.until, item.until + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return enter * (1 - leave);
}

function textLines(message: ChatMessage): string[] {
  return message.text ? message.text.split("\n") : [];
}

function imageHeight(message: ChatMessage): number {
  if (!message.image) {
    return 0;
  }
  const inner = BUBBLE.imageWidth - BUBBLE.imagePad * 2;
  return Math.round((inner * message.image.height) / message.image.width);
}

function voiceLines(message: ChatMessage): string[] {
  return message.voice ? message.voice.transcript.split("\n") : [];
}

function messageHeight(message: ChatMessage): number {
  if (message.voice) {
    return (
      BUBBLE.padTop +
      VOICE.playerRow +
      voiceLines(message).length * BUBBLE.lineHeight +
      BUBBLE.timeRow +
      BUBBLE.padBottom
    );
  }

  const lines = textLines(message).length;
  const image = message.image ? imageHeight(message) + BUBBLE.imagePad : 0;
  const text = lines > 0 ? BUBBLE.padTop + lines * BUBBLE.lineHeight : 0;
  return image + text + BUBBLE.timeRow + BUBBLE.padBottom;
}

interface StackItemProps {
  item: StackEntry;
  top: number;
  visible: number;
  frame: number;
  fps: number;
}

function StackItem({ item, top, visible, frame, fps }: StackItemProps) {
  const isMe = item.message?.from === "me";
  const style: React.CSSProperties = {
    position: "absolute",
    top,
    ...(isMe
      ? { right: BUBBLE.meRight, transformOrigin: "100% 100%" }
      : { left: BUBBLE.themLeft, transformOrigin: "0% 100%" }),
    opacity: visible,
    scale: String(interpolate(visible, [0, 1], [0.86, 1])),
  };

  if (item.kind === "dots" || !item.message) {
    return (
      <div style={style}>
        <TypingDots frame={frame} />
      </div>
    );
  }

  return (
    <div style={style}>
      <Bubble message={item.message} frame={frame} fps={fps} />
    </div>
  );
}

interface BubbleProps {
  message: ChatMessage;
  frame: number;
  fps: number;
}

function Bubble({ message, frame, fps }: BubbleProps) {
  const isMe = message.from === "me";
  const lines = textLines(message);
  const ring = message.image?.ring;
  const ringAt = Math.round((message.at + (ring?.at ?? 0)) * fps);
  const ringIn = interpolate(frame, [ringAt, ringAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });

  const inner = BUBBLE.imageWidth - BUBBLE.imagePad * 2;
  const scale = message.image ? inner / message.image.width : 1;

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: isMe ? COLORS.outgoing : COLORS.incoming,
        borderRadius: 30,
        borderTopLeftRadius: isMe ? 30 : 8,
        borderTopRightRadius: isMe ? 8 : 30,
        boxShadow: "0 2px 3px rgba(31, 26, 23, 0.12)",
        height: messageHeight(message),
        width: message.voice
          ? VOICE.width
          : message.image
            ? BUBBLE.imageWidth
            : undefined,
        minWidth: 260,
        fontFamily: FONT,
        color: COLORS.ink,
      }}
    >
      {message.image ? (
        <div
          style={{
            position: "relative",
            margin: BUBBLE.imagePad,
            marginBottom: 0,
            width: inner,
            height: imageHeight(message),
            borderRadius: 22,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(message.image.src)}
            style={{ width: inner, height: imageHeight(message), maxWidth: "none" }}
          />
          {ring ? (
            <div
              style={{
                position: "absolute",
                left: ring.left * scale,
                top: ring.top * scale,
                width: ring.width * scale,
                height: ring.height * scale,
                borderRadius: 18,
                border: `7px solid ${COLORS.tomato}`,
                boxShadow: `0 0 0 9999px rgba(31, 26, 23, ${ringIn * 0.22})`,
                opacity: ringIn,
                scale: String(interpolate(ringIn, [0, 1], [1.12, 1])),
              }}
            />
          ) : null}
        </div>
      ) : null}

      {message.voice ? (
        <VoiceNote message={message} frame={frame} fps={fps} />
      ) : null}

      {lines.length > 0 ? (
        <div
          style={{
            paddingTop: BUBBLE.padTop,
            paddingLeft: BUBBLE.padX,
            paddingRight: BUBBLE.padX + (isMe ? 64 : 24),
            fontSize: BUBBLE.fontSize,
            lineHeight: `${BUBBLE.lineHeight}px`,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            whiteSpace: "pre",
          }}
        >
          {lines.join("\n")}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: BUBBLE.padBottom,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 26,
          fontWeight: 500,
          color: message.image && lines.length === 0 ? "#FFFFFF" : COLORS.muted,
          textShadow:
            message.image && lines.length === 0
              ? "0 1px 3px rgba(0,0,0,0.6)"
              : undefined,
        }}
      >
        <span>{message.time}</span>
        {isMe ? <ReadTicks /> : null}
      </div>
    </div>
  );
}

/** Seconds played: the sweep and counter start with the audio, on `at`. */
function voiceElapsed(frame: number, message: ChatMessage, fps: number): number {
  const duration = message.voice?.duration ?? 0;
  return Math.min(duration, Math.max(0, frame / fps - message.at));
}

function VoiceNote({ message, frame, fps }: BubbleProps) {
  if (!message.voice) {
    return null;
  }

  const { duration, wordTimes } = message.voice;
  const elapsed = voiceElapsed(frame, message, fps);
  const played = duration > 0 ? elapsed / duration : 0;
  const isPlaying = elapsed > 0 && elapsed < duration;

  let wordIndex = 0;

  return (
    <div
      style={{
        paddingTop: BUBBLE.padTop,
        paddingLeft: BUBBLE.padX,
        paddingRight: BUBBLE.padX,
      }}
    >
      <div
        style={{
          height: VOICE.playerRow,
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div
          style={{
            width: VOICE.playButton,
            height: VOICE.playButton,
            borderRadius: VOICE.playButton / 2,
            flexShrink: 0,
            backgroundColor: COLORS.tomato,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24" aria-hidden>
            <path
              d={isPlaying ? "M6 4h4v16H6zM14 4h4v16h-4z" : "M7 4l13 8-13 8z"}
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: VOICE.barGap,
            height: VOICE.barMaxHeight,
          }}
        >
          {Array.from({ length: VOICE.bars }, (_, index) => {
            const position = index / VOICE.bars;
            const isPlayed = position < played;
            // Bars at the playhead bounce, so the note reads as live audio.
            const nearHead = isPlaying && Math.abs(position - played) < 0.07;
            const bounce = nearHead ? 0.25 * Math.sin(frame * 0.9 + index) : 0;
            const level = barLevel(index) + bounce;
            return (
              <div
                key={index}
                style={{
                  width: VOICE.barWidth,
                  height: Math.max(10, level * VOICE.barMaxHeight),
                  borderRadius: VOICE.barWidth / 2,
                  backgroundColor: isPlayed ? COLORS.tomato : COLORS.bars,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.muted,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {`0:${String(Math.ceil(duration - elapsed)).padStart(2, "0")}`}
        </div>
      </div>

      <div
        style={{
          fontSize: BUBBLE.fontSize,
          lineHeight: `${BUBBLE.lineHeight}px`,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          whiteSpace: "pre",
        }}
      >
        {voiceLines(message).map((line, lineIndex) => (
          <div key={lineIndex}>
            {line.split(" ").map((word, index) => {
              const at = wordTimes[wordIndex] ?? 0;
              wordIndex += 1;
              return (
                <span
                  key={index}
                  style={{ color: elapsed >= at ? COLORS.ink : COLORS.unsaid }}
                >
                  {index > 0 ? " " : ""}
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A fixed, speech-like silhouette: 0.25–1, the same on every render. */
function barLevel(index: number): number {
  const wave = Math.sin(index * 1.7) * 0.5 + Math.sin(index * 0.6 + 1) * 0.5;
  return 0.25 + 0.75 * Math.abs(wave);
}

/** The bed's multiplier: 1, easing down under any voice note that plays. */
function voiceDuck(frame: number, messages: ChatMessage[], fps: number): number {
  return messages.reduce((level, message) => {
    if (!message.voice) {
      return level;
    }
    const start = Math.round(message.at * fps);
    const end = start + Math.round(message.voice.duration * fps);
    const fade = VOICE.duckFrames;
    const duck = interpolate(
      frame,
      [start - fade, start, end, end + fade],
      [1, VOICE.duck, VOICE.duck, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return Math.min(level, duck);
  }, 1);
}

function ReadTicks() {
  return (
    <svg width={38} height={24} viewBox="0 0 38 24" aria-hidden>
      <path
        d="M2 13l6 6L20 5M14 17l2 2L32 5"
        fill="none"
        stroke={COLORS.ticks}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypingDots({ frame }: { frame: number }) {
  return (
    <div
      style={{
        height: DOTS_HEIGHT,
        width: 170,
        borderRadius: 30,
        borderTopLeftRadius: 8,
        backgroundColor: COLORS.incoming,
        boxShadow: "0 2px 3px rgba(31, 26, 23, 0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {[0, 1, 2].map((index) => {
        const phase = ((frame - index * 4) % 18) / 18;
        const lift = Math.max(0, Math.sin(phase * Math.PI * 2));
        return (
          <div
            key={index}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: COLORS.muted,
              opacity: 0.45 + lift * 0.5,
              translate: `0px ${-lift * 8}px`,
            }}
          />
        );
      })}
    </div>
  );
}

interface HeaderProps {
  clock: string;
  contact: ChatStoryProps["contact"];
  status: string;
  isTyping: boolean;
}

function Header({ clock, contact, status, isTyping }: HeaderProps) {
  return (
    <Interactive.Div
      name="Encabezado"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: LAYOUT.headerBottom,
        backgroundColor: COLORS.header,
        fontFamily: FONT,
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 16,
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        {clock}
      </div>
      <StatusIcons />

      <svg
        width={34}
        height={56}
        viewBox="0 0 34 56"
        style={{ position: "absolute", left: 28, top: 126 }}
        aria-hidden
      >
        <path
          d="M26 6L6 28l20 22"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 104,
          width: 104,
          height: 104,
          borderRadius: 52,
          backgroundColor: COLORS.tomato,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 46,
          fontWeight: 700,
        }}
      >
        {contact.initials}
      </div>
      <div style={{ position: "absolute", left: 212, top: 108 }}>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {contact.name}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            marginTop: 2,
            color: isTyping ? COLORS.typing : COLORS.headerMuted,
          }}
        >
          {status}
        </div>
      </div>
    </Interactive.Div>
  );
}

function StatusIcons() {
  return (
    <svg
      width={170}
      height={40}
      viewBox="0 0 170 40"
      style={{ position: "absolute", right: 48, top: 18 }}
      aria-hidden
    >
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          x={index * 13}
          y={26 - index * 7}
          width={9}
          height={8 + index * 7}
          rx={2}
          fill="#FFFFFF"
        />
      ))}
      <path
        d="M70 16a26 26 0 0 1 34 0M76 23a17 17 0 0 1 22 0M82 30a8 8 0 0 1 10 0"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <rect
        x={118}
        y={8}
        width={44}
        height={24}
        rx={6}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3}
      />
      <rect x={122} y={12} width={30} height={16} rx={3} fill="#FFFFFF" />
    </svg>
  );
}

function InputBar({ draft }: { draft: string }) {
  return (
    <Interactive.Div
      name="Barra de mensaje"
      style={{
        position: "absolute",
        left: 28,
        top: LAYOUT.inputTop,
        width: 1080 - 28 * 2,
        height: LAYOUT.inputHeight,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          // A long draft shows its tail, like a real input that has scrolled.
          justifyContent:
            draft.length > DRAFT_FITS ? "flex-end" : "flex-start",
          paddingLeft: 40,
          paddingRight: 32,
          fontSize: 42,
          fontWeight: 500,
          color: draft ? COLORS.ink : COLORS.muted,
          whiteSpace: "pre",
          overflow: "hidden",
          boxShadow: "0 2px 3px rgba(31, 26, 23, 0.12)",
        }}
      >
        {draft ? `${draft}|` : "Mensaje"}
      </div>
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: COLORS.tomato,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={46} height={46} viewBox="0 0 24 24" aria-hidden>
          <path d="M3 20l18-8L3 4v6l12 2-12 2z" fill="#FFFFFF" />
        </svg>
      </div>
    </Interactive.Div>
  );
}

/** The owner's next message, typed into the input bar before it is sent. */
function draftAt(frame: number, messages: ChatMessage[], fps: number): string {
  const typing = messages.find((message) => {
    if (message.from !== "me" || message.typing === 0 || !message.text) {
      return false;
    }
    const start = Math.round((message.at - message.typing) * fps);
    return frame >= start && frame < Math.round(message.at * fps);
  });
  if (!typing?.text) {
    return "";
  }

  const start = Math.round((typing.at - typing.typing) * fps);
  const end = Math.round(typing.at * fps) - 3; // a beat before "send"
  const text = typing.text.replace(/\n/g, " ");
  const count = Math.round(
    interpolate(frame, [start, end], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  // Never cut an emoji (a surrogate pair) in half.
  return Array.from(text).slice(0, count).join("");
}

function Takeaway({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 250,
        width: 920,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: 60,
        fontWeight: 700,
        lineHeight: 1.08,
        letterSpacing: "-0.03em",
        color: COLORS.ink,
        whiteSpace: "pre-line",
      }}
    >
      {text}
    </div>
  );
}

/** Pops for what arrives, ticks for what the owner sends and types. */
function soundCues(props: ChatStoryProps, fps: number): Sfx[] {
  const cues: Sfx[] = [];

  props.messages.forEach((message) => {
    if (message.image?.ring) {
      cues.push({
        sound: SFX.pop,
        at: message.at + message.image.ring.at,
        volume: 0.4,
      });
    }
    if (message.at === 0) {
      return;
    }
    if (message.from === "them") {
      cues.push({ sound: SFX.pop, at: message.at, volume: 0.55 });
      return;
    }

    cues.push({ sound: SFX.whoosh, at: message.at - 0.05, volume: 0.18 });
    if (message.typing > 0 && message.text) {
      const keys = Math.min(10, Math.ceil(message.text.length / 3));
      for (let index = 0; index < keys; index += 1) {
        cues.push({
          sound: TICKET_SFX.tick,
          at:
            message.at -
            message.typing +
            (index / keys) * (message.typing - 0.15),
          volume: 0.12,
        });
      }
    }
  });

  cues.push({ sound: SFX.softHit, at: props.cta.from, volume: 0.3 });
  // Every cue lands on a whole frame, as the rest of the pack does.
  return cues.map((cue) => ({ ...cue, at: Math.round(cue.at * fps) / fps }));
}
