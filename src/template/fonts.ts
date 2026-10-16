import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

// Loaded once and referenced by family name in inline styles, so Remotion
// Studio keeps the styles editable. Archivo is Punto Listo, Poppins is Arya.
loadArchivo("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

loadPoppins("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
