import { z } from "zod";

export const storeVideoSchema = z.object({
  lang: z.enum(["en", "es"]),
  /** apple: 886×1920 App Store preview (iOS footage); google: 1920×1080 Play promo (Android footage). */
  store: z.enum(["apple", "google"]),
});

export type StoreVideoProps = z.infer<typeof storeVideoSchema>;
export type Lang = StoreVideoProps["lang"];
export type Store = StoreVideoProps["store"];
export type Platform = "ios" | "android";
export type Orientation = "portrait" | "landscape";

export const FPS = 30;

/** The bed is a steady 100 BPM, so one beat is 0.6 s; every cue sits on this grid. */
export const BEAT = 18;

/** 29.8 s: under App Store's hard 30.0 s cap even after AAC padding. */
export const DURATION = 894;

export const beats = (count: number): number => Math.round(count * BEAT);

export const CANVAS = {
  apple: { width: 886, height: 1920 },
  google: { width: 1920, height: 1080 },
} as const satisfies Record<Store, { width: number; height: number }>;

export const PLATFORM: Record<Store, Platform> = {
  apple: "ios",
  google: "android",
};

export const ORIENTATION: Record<Store, Orientation> = {
  apple: "portrait",
  google: "landscape",
};

export const COLORS = {
  cream: "#FFF8EF",
  title: "#293629",
  accent: "#39ACAC",
  night: "#0F1B36",
} as const;

export const MUSIC = {
  src: "music/arya-store-video-bed.mp3",
  volume: 0.85,
} as const;

export const ASSETS = "videos/arya/store-videos";
