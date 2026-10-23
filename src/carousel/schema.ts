import { z } from "zod";

/**
 * "Starred" words in any text are painted tomato; "\n" breaks the line.
 * Photos are cover-fitted into their box, so any aspect works.
 */
const coverSchema = z.object({
  type: z.literal("cover"),
  photo: z.string(),
  title: z.string(),
  subtitle: z.string(),
  /** The tomato ask under the subtitle: "Guárdalo para tu pedido". */
  pill: z.string(),
});

const tipSchema = z.object({
  type: z.literal("tip"),
  number: z.number().int().positive(),
  photo: z.string(),
  title: z.string(),
  body: z.string(),
});

const ctaSchema = z.object({
  type: z.literal("cta"),
  logo: z.string(),
  title: z.string(),
  body: z.string(),
  pill: z.string(),
});

export const slideSchema = z.discriminatedUnion("type", [
  coverSchema,
  tipSchema,
  ctaSchema,
]);

export const carouselSlideSchema = z.object({
  slide: slideSchema,
  /** 1-based, for the "2/8" page marker. */
  page: z.number().int().positive(),
  pages: z.number().int().positive(),
  /** Footer mark on every slide but the CTA. */
  logo: z.string(),
});

export type CarouselSlide = z.infer<typeof slideSchema>;
export type CarouselSlideProps = z.infer<typeof carouselSlideSchema>;

export const CAROUSEL = { width: 1080, height: 1350 } as const;
