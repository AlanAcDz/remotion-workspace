import { Composition, registerRoot } from "remotion";
import { vidantaFamiliaProps } from "../videos/vidanta-familia.props";
import { vidantaFamiliaSchema } from "./schema";
import {
  VIDANTA_FAMILIA_FPS,
  VidantaFamilia,
  calculateVidantaFamiliaMetadata,
} from "./vidanta-familia";

function RenderRoot() {
  return (
    <Composition
      id="vidanta-familia"
      component={VidantaFamilia}
      schema={vidantaFamiliaSchema}
      calculateMetadata={calculateVidantaFamiliaMetadata}
      fps={VIDANTA_FAMILIA_FPS}
      width={1080}
      height={1920}
      durationInFrames={1920}
      defaultProps={vidantaFamiliaProps}
    />
  );
}

registerRoot(RenderRoot);
