import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

/** Display serif. Exported from the call so it cannot be tree-shaken away. */
export const { fontFamily: lora } = loadLora("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

loadLora("italic", { weights: ["500"], subsets: ["latin"] });

/** Supporting sans for captions and tags. */
export const { fontFamily: poppins } = loadPoppins("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});
