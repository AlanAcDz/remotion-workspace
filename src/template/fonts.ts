import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

// Loaded once and referenced by family name in inline styles, so Remotion
// Studio keeps the styles editable. Archivo is Punto Listo, Poppins is Arya.
//
// Archivo stops at 700 on purpose. Every Punto Listo render through Oct 9
// was made without this web font (the bundle dropped it) and fell back to a
// locally installed Archivo Regular, faux-bolded by the browser. Real Bold
// (700) matches that approved look; ExtraBold (800) sets ~8% wider and
// re-wraps headlines laid out against it.
loadArchivo("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

loadPoppins("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
