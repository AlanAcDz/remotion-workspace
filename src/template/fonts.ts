import { loadFont } from "@remotion/google-fonts/Archivo";

// Loaded once and referenced as the literal "Archivo" in inline styles,
// so Remotion Studio keeps the styles editable.
loadFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});
