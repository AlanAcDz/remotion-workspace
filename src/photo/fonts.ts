import { loadFont } from "@remotion/google-fonts/Caveat";

/**
 * The ballpoint hand written on the photos. Exported from the `loadFont` call
 * itself so the import cannot be tree-shaken away (see ticket/fonts.ts).
 */
export const { fontFamily: caveat } = loadFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
