import { Video } from "@remotion/media";
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
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, CORAL, EndCard, PawPrint, POPPINS, ramp, ShortFrame, TEAL } from "./shared";

/**
 * Headless Chrome's default stack can drop emoji, so the colour emoji faces
 * are named after Poppins.
 */
const FONT = `${POPPINS}, "Apple Color Emoji", "Noto Color Emoji", sans-serif`;

const COLORS = {
  wallpaper: ARYA.colors.background,
  incoming: "#FFFFFF",
  outgoing: "#FBDCCB",
  ink: ARYA.colors.ink,
  muted: ARYA.colors.muted,
  header: TEAL,
  divider: "#DDEFEE",
  /** The Arya app's own background, sampled from the takes. */
  appBackground: "#F4F6F6",
} as const;

/** Screen chrome, top to bottom. Copy stays out of TikTok's top 220 and bottom 420 px. */
const LAYOUT = {
  headerTop: 236,
  headerHeight: 136,
  viewportTop: 392,
  viewportBottom: 1490,
} as const;

const BUBBLE = {
  fontSize: 54,
  lineHeight: 68,
  padX: 34,
  padTop: 18,
  nameRow: 46,
  timeRow: 38,
  padBottom: 14,
  gap: 22,
  side: 40,
  avatar: 76,
  avatarGap: 18,
  capturePad: 12,
} as const;

const DOTS_HEIGHT = 92;
const DIVIDER_HEIGHT = 84;
const ENTER_FRAMES = 8;

export interface ChatMember {
  name: string;
  initial: string;
  /** The sender name and avatar colour. */
  color: string;
}

/** A crop of the source take, in its own pixels; its height follows the capture's aspect. */
export interface CaptureWindow {
  /** Seconds into the shot this window is reached. */
  at: number;
  left: number;
  top: number;
  width: number;
}

export interface CaptureShot {
  src: string;
  /** Seconds after the message lands that this shot takes over. */
  from: number;
  /** Seconds of the file skipped before the shot starts. */
  trimBefore: number;
  /** The crop eases from one window to the next. */
  windows: CaptureWindow[];
  /** Touches, in source pixels and seconds into the shot: the takes hide them. */
  taps?: { at: number; x: number; y: number }[];
  /**
   * Source rows left visible; the crop above and below is covered with the
   * app's background, for a strip of UI too wide for the capture's aspect.
   */
  band?: { top: number; bottom: number };
}

export interface ChatCapture {
  /** Canvas size of the screen recording inside the bubble. */
  width: number;
  height: number;
  shots: CaptureShot[];
}

export type ChatItem =
  | {
      kind: "message";
      /** A key of `members`. */
      from: string;
      /** Seconds the bubble lands; 0 puts it on screen from frame 0. */
      at: number;
      /** Seconds of typing dots before `at`; only shown for incoming members. */
      typing?: number;
      time: string;
      /** Breaks with "\n" and never wraps. */
      text: string;
      capture?: ChatCapture;
    }
  | { kind: "divider"; at: number; text: string };

/** A type, not an interface: Remotion's props must be assignable to Record<string, unknown>. */
export type AryaChatProps = {
  group: { name: string; members: string };
  members: Record<string, ChatMember>;
  /** Whose phone this is: their bubbles sit on the right, without a name. */
  me: string;
  items: ChatItem[];
  closer: { text: string; from: number };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

type MessageItem = Extract<ChatItem, { kind: "message" }>;

interface StackEntry {
  key: string;
  kind: "message" | "dots" | "divider";
  item: ChatItem;
  height: number;
  /** Frame the entry starts entering. */
  from: number;
  /** Frame a dots bubble leaves; Infinity otherwise. */
  until: number;
}

/**
 * "El grupo": a family group chat in Arya's palette, read off one member's
 * phone. No voice: the messages are the script and land on their own clock.
 * The feed scrolls like a real one, each entry pushing the stack by its own
 * height, so nothing is measured at render time. A message can carry a screen
 * recording, cropped to the part of the screen that matters.
 */
export function AryaChat(props: AryaChatProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const closerFrom = Math.round(props.closer.from * fps);

  const entries = buildStack(props.items, props.me, fps);
  const viewport = LAYOUT.viewportBottom - LAYOUT.viewportTop;
  const shares = entries.map((entry) => entry.height * presence(frame, entry));
  const stackHeight = shares.reduce((sum, share) => sum + share, 0);
  // Top-anchored while the chat is short, so the hook sits high on frame 0;
  // once it overflows, the newest entry rests on the viewport's bottom.
  const scroll = Math.max(0, stackHeight - viewport);

  let offset = 0;

  return (
    <ShortFrame background={COLORS.wallpaper} music={props.music} sfx={props.sfx}>
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
        {entries.map((entry, index) => {
          const top = offset - scroll;
          offset += shares[index];
          const visible = presence(frame, entry);
          if (visible <= 0) {
            return null;
          }

          return (
            <StackItem
              key={entry.key}
              entry={entry}
              top={top}
              visible={visible}
              props={props}
            />
          );
        })}
      </Interactive.Div>
      <Header group={props.group} />

      <Sequence name="Cierre" from={closerFrom}>
        <Closer text={props.closer.text} />
      </Sequence>
      {/* The shared card sets its note on one line; this one breaks it. */}
      <EndCard cta={{ ...props.cta, note: "" }} />
      <Sequence name="CTA nota" from={Math.round(props.cta.from * fps)}>
        <EndNote text={props.cta.note} at={props.cta.revealAt.note - props.cta.from} />
      </Sequence>
    </ShortFrame>
  );
}

/** Items in order, each incoming message preceded by its typing dots. */
function buildStack(items: ChatItem[], me: string, fps: number): StackEntry[] {
  return items.flatMap((item, index) => {
    const at = Math.round(item.at * fps);
    // Frame-0 entries are already there: no entrance on the thumbnail.
    const from = at === 0 ? -ENTER_FRAMES : at;

    if (item.kind === "divider") {
      return [
        { key: `divider-${index}`, kind: "divider", item, height: DIVIDER_HEIGHT + BUBBLE.gap, from, until: Infinity },
      ];
    }

    const entry: StackEntry = {
      key: `message-${index}`,
      kind: "message",
      item,
      height: messageHeight(item, item.from !== me) + BUBBLE.gap,
      from,
      until: Infinity,
    };
    if (item.from === me || !item.typing) {
      return [entry];
    }

    return [
      {
        key: `dots-${index}`,
        kind: "dots",
        item,
        height: DOTS_HEIGHT + BUBBLE.gap,
        // Dots typing from frame 0 are already bouncing on the thumbnail.
        from: Math.max(0, at - Math.round(item.typing * fps)) || -ENTER_FRAMES,
        until: at,
      },
      entry,
    ];
  });
}

/** 0 → 1 as an entry enters; typing dots collapse as their message lands. */
function presence(frame: number, entry: StackEntry): number {
  const enter = ramp(frame, entry.from, entry.from + ENTER_FRAMES);
  if (entry.until === Infinity) {
    return enter;
  }
  return enter * (1 - ramp(frame, entry.until, entry.until + 4, Easing.linear));
}

function lines(item: MessageItem): string[] {
  return item.text.split("\n");
}

function messageHeight(item: MessageItem, hasName: boolean): number {
  const capture = item.capture ? item.capture.height + BUBBLE.capturePad : 0;
  const name = hasName ? BUBBLE.nameRow : 0;
  return (
    capture +
    BUBBLE.padTop +
    name +
    lines(item).length * BUBBLE.lineHeight +
    BUBBLE.timeRow +
    BUBBLE.padBottom
  );
}

interface StackItemProps {
  entry: StackEntry;
  top: number;
  visible: number;
  props: AryaChatProps;
}

function StackItem({ entry, top, visible, props }: StackItemProps) {
  const scale = interpolate(visible, [0, 1], [0.86, 1]);

  if (entry.item.kind === "divider") {
    return (
      <div
        style={{
          position: "absolute",
          top,
          left: 0,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          opacity: visible,
          scale: String(scale),
        }}
      >
        <Divider text={entry.item.text} />
      </div>
    );
  }

  const item = entry.item;
  const isMe = item.from === props.me;
  const member = props.members[item.from];
  const bubbleLeft = BUBBLE.side + BUBBLE.avatar + BUBBLE.avatarGap;

  return (
    <div
      style={{
        position: "absolute",
        top,
        ...(isMe
          ? { right: BUBBLE.side, transformOrigin: "100% 100%" }
          : { left: bubbleLeft, transformOrigin: "0% 100%" }),
        opacity: visible,
        scale: String(scale),
      }}
    >
      {isMe ? null : (
        <Avatar member={member} style={{ position: "absolute", left: -(BUBBLE.avatar + BUBBLE.avatarGap), bottom: 0 }} />
      )}
      {entry.kind === "dots" ? (
        <TypingDots />
      ) : (
        <Bubble item={item} member={isMe ? null : member} />
      )}
    </div>
  );
}

function Avatar({ member, style }: { member: ChatMember; style: React.CSSProperties }) {
  return (
    <div
      style={{
        ...style,
        width: BUBBLE.avatar,
        height: BUBBLE.avatar,
        borderRadius: BUBBLE.avatar / 2,
        backgroundColor: member.color,
        color: "#FFFFFF",
        fontFamily: FONT,
        fontSize: 36,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {member.initial}
    </div>
  );
}

function Bubble({ item, member }: { item: MessageItem; member: ChatMember | null }) {
  return (
    <div
      style={{
        position: "relative",
        backgroundColor: member ? COLORS.incoming : COLORS.outgoing,
        borderRadius: 40,
        boxShadow: "0 4px 14px rgba(25, 38, 38, 0.08)",
        height: messageHeight(item, Boolean(member)),
        width: item.capture ? item.capture.width + BUBBLE.capturePad * 2 : undefined,
        minWidth: 250,
        fontFamily: FONT,
        color: COLORS.ink,
      }}
    >
      {item.capture ? <Capture capture={item.capture} at={item.at} /> : null}
      <div
        style={{
          paddingTop: BUBBLE.padTop,
          paddingLeft: BUBBLE.padX,
          paddingRight: BUBBLE.padX + 20,
        }}
      >
        {member ? (
          <div
            style={{
              height: BUBBLE.nameRow,
              fontSize: 32,
              fontWeight: 700,
              color: member.color,
            }}
          >
            {member.name}
          </div>
        ) : null}
        <div
          style={{
            fontSize: BUBBLE.fontSize,
            lineHeight: `${BUBBLE.lineHeight}px`,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            whiteSpace: "pre",
          }}
        >
          {item.text}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 28,
          bottom: BUBBLE.padBottom,
          fontSize: 26,
          fontWeight: 500,
          color: COLORS.muted,
        }}
      >
        {item.time}
      </div>
    </div>
  );
}

/** The screen recording a message carries, panning between crop windows. */
function Capture({ capture, at }: { capture: ChatCapture; at: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const landed = Math.round(at * fps);

  return (
    <div
      style={{
        position: "relative",
        margin: BUBBLE.capturePad,
        marginBottom: 0,
        width: capture.width,
        height: capture.height,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: COLORS.appBackground,
      }}
    >
      {capture.shots.map((shot, index) => {
        const from = landed + Math.round(shot.from * fps);
        const next = capture.shots[index + 1];
        const until = next ? landed + Math.round(next.from * fps) : Infinity;
        if (frame < from - 1 || frame >= until + 6) {
          return null;
        }
        // The next shot fades in over this one.
        const fadeIn = index === 0 ? 1 : ramp(frame, from, from + 6, Easing.linear);

        return (
          <div key={shot.src + shot.from} style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
            <Sequence from={from} layout="none">
              <Shot shot={shot} capture={capture} />
            </Sequence>
          </div>
        );
      })}
    </div>
  );
}

function windowAt(shot: CaptureShot, seconds: number): Omit<CaptureWindow, "at"> {
  const times = shot.windows.map((window) => window.at);
  if (times.length === 1) {
    return shot.windows[0];
  }
  const pick = (key: "left" | "top" | "width") =>
    interpolate(
      seconds,
      times,
      shot.windows.map((window) => window[key]),
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      },
    );
  return { left: pick("left"), top: pick("top"), width: pick("width") };
}

function Shot({ shot, capture }: { shot: CaptureShot; capture: ChatCapture }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const window = windowAt(shot, frame / fps);
  const scale = capture.width / window.width;
  const isStill = /\.(jpe?g|png)$/i.test(shot.src);
  const media = {
    position: "absolute",
    left: -window.left * scale,
    top: -window.top * scale,
    width: 1206 * scale,
    maxWidth: "none",
  } as const;

  return (
    <>
      {isStill ? (
        <Img src={staticFile(shot.src)} style={media} />
      ) : (
        <Video
          src={staticFile(shot.src)}
          trimBefore={Math.round(shot.trimBefore * fps)}
          muted
          style={media}
        />
      )}
      {(shot.taps ?? []).map((tap) => (
        <TapRipple
          key={tap.at}
          frame={frame - Math.round(tap.at * fps)}
          x={(tap.x - window.left) * scale}
          y={(tap.y - window.top) * scale}
        />
      ))}
      {shot.band ? <BandMask band={shot.band} top={window.top} scale={scale} /> : null}
    </>
  );
}

function BandMask({ band, top, scale }: { band: NonNullable<CaptureShot["band"]>; top: number; scale: number }) {
  const fill = { position: "absolute", left: 0, right: 0, backgroundColor: COLORS.appBackground } as const;

  return (
    <>
      <div style={{ ...fill, top: 0, height: Math.max(0, (band.top - top) * scale) }} />
      <div style={{ ...fill, top: (band.bottom - top) * scale, bottom: 0 }} />
    </>
  );
}

function TapRipple({ frame, x, y }: { frame: number; x: number; y: number }) {
  if (frame < -3 || frame > 14) {
    return null;
  }
  const press = ramp(frame, -3, 2);
  const release = ramp(frame, 4, 14, Easing.out(Easing.quad));
  const size = 96;

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(25, 38, 38, 0.28)",
        border: "4px solid rgba(255, 255, 255, 0.9)",
        opacity: press * (1 - release),
        scale: String(interpolate(release, [0, 1], [1, 1.5])),
      }}
    />
  );
}

function TypingDots() {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        height: DOTS_HEIGHT,
        width: 170,
        borderRadius: 40,
        backgroundColor: COLORS.incoming,
        boxShadow: "0 4px 14px rgba(25, 38, 38, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {[0, 1, 2].map((index) => {
        const phase = ((frame - index * 4 + 180) % 18) / 18;
        const lift = Math.max(0, Math.sin(phase * Math.PI * 2));
        return (
          <div
            key={index}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: TEAL,
              opacity: 0.4 + lift * 0.55,
              translate: `0px ${-lift * 8}px`,
            }}
          />
        );
      })}
    </div>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div
      style={{
        height: DIVIDER_HEIGHT,
        padding: "0 40px",
        borderRadius: DIVIDER_HEIGHT / 2,
        backgroundColor: COLORS.divider,
        color: ARYA.colors.accent,
        fontFamily: FONT,
        fontSize: 38,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
      }}
    >
      {text}
    </div>
  );
}

/** A rounded group card: no back arrow, call buttons or status bar. */
function Header({ group }: { group: AryaChatProps["group"] }) {
  return (
    <Interactive.Div
      name="Grupo"
      style={{
        position: "absolute",
        top: LAYOUT.headerTop,
        ...centered(1000),
        height: LAYOUT.headerHeight,
        borderRadius: 44,
        backgroundColor: COLORS.header,
        display: "flex",
        alignItems: "center",
        gap: 26,
        paddingLeft: 24,
        fontFamily: FONT,
        color: "#FFFFFF",
        boxShadow: "0 10px 30px rgba(35, 122, 122, 0.25)",
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: ARYA.colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PawPrint size={58} color={TEAL} />
      </div>
      <div>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15 }}>{group.name}</div>
        <div style={{ fontSize: 30, fontWeight: 500, opacity: 0.9 }}>{group.members}</div>
      </div>
    </Interactive.Div>
  );
}

/** The end card's note, broken on "\n" and set where the shared card puts it. */
function EndNote({ text, at }: { text: string; at: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const from = Math.round(at * fps);

  return (
    <div
      style={{
        position: "absolute",
        top: 972,
        ...centered(936),
        textAlign: "center",
        fontFamily: FONT,
        fontSize: 50,
        fontWeight: ARYA.weights.emphasis,
        lineHeight: 1.18,
        letterSpacing: "-0.01em",
        color: ARYA.colors.muted,
        whiteSpace: "pre-line",
        opacity: ramp(frame, from, from + 14),
      }}
    >
      {text}
    </div>
  );
}

function Closer({ text }: { text: string }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: CORAL, opacity: ramp(frame, 0, 6) }}>
      <div
        style={{
          position: "absolute",
          top: 760,
          ...centered(900),
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 100,
          fontWeight: 700,
          lineHeight: 1.14,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
          whiteSpace: "pre-line",
          translate: `0px ${(1 - ramp(frame, 0, 10)) * 40}px`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}
