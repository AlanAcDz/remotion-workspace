import { loadFont } from "@remotion/google-fonts/IBMPlexMono";
import "../template/fonts";

/**
 * The receipt face. Exported from the `loadFont` call itself: package.json
 * marks only CSS as side-effectful, so a bare `import "./fonts"` can be
 * tree-shaken away and the receipt silently falls back to a serif.
 */
export const { fontFamily: plexMono } = loadFont("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
