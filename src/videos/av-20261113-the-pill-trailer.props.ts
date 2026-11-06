import type { TrailerProps } from "../arya-shorts/trailer";

/**
 * 16 · THE PILL (AV-20261113-the-pill-trailer). Friday the 13th only.
 * Night ink and Arya's coral, no new red, one three-frame flash. The eye is a
 * crop of the Aug 16, 2026 photo, sharper than arya-5.jpg at this zoom. Kitchen
 * is Codex; the banner is the real notification. "The Pill." as a spoken line
 * needs a deep ElevenLabs preset that does not exist, so this cut has no voice,
 * which the record allows.
 */
const DIR = "videos/arya/av-20261113-the-pill-trailer";
const BOOM = "sfx/arya/boom.mp3";

export const aryaThePillProps: TrailerProps = {
  eye: { src: `${DIR}/01-eye.jpg`, from: 0, to: 2, text: "This Friday\nthe 13th" },
  rug: { src: `${DIR}/04-rug-toys-night.mp4`, from: 2, to: 4, text: "She thought she was safe." },
  kitchen: { src: `${DIR}/02-kitchen.jpg`, from: 4, to: 6, text: "Then she heard the cheese." },
  cheese: { src: `${DIR}/02-kitchen.jpg`, from: 6, to: 8, text: "It was never about the cheese." },
  hit: { at: 8.5, banner: `${DIR}/03-reminder-banner.jpg`, to: 9.5 },
  title: { from: 9.5, to: 11, text: "THE PILL" },
  tagline: { from: 11, to: 13.4, text: "Every 12 hours.\nNo one escapes." },
  ending: {
    from: 13.4,
    line: "Now showing at\n8 AM and 8 PM",
    name: "Arya: Pill Reminder",
    pill: "Link in bio",
    logo: "videos/arya/logo.png",
  },
  drone: { src: "sfx/arya/drone.mp3", until: 8, resume: 9.5 },
  sfx: [
    { sound: BOOM, at: 0, volume: 0.5 },
    { sound: "sfx/arya/fridge.mp3", at: 4, volume: 0.6 },
    { sound: BOOM, at: 6, volume: 0.3 },
    { sound: BOOM, at: 8.5, volume: 0.7 },
    { sound: "sfx/ding.mp3", at: 8.55, volume: 0.5 },
    { sound: BOOM, at: 9.5, volume: 0.6 },
  ],
  end: 15.9,
};
