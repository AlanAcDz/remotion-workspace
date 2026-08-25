import "./index.css";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import {
  CalculateMetadataFunction,
  Composition,
  Folder,
  staticFile,
} from "remotion";
import { PosDemo } from "./template/pos-demo";
import { posDemoSchema, type PosDemoProps } from "./template/schema";
import { corteProps } from "./videos/corte.props";
import { corteMobileProps } from "./videos/corte-mobile.props";

const FPS = 30;

// Every video is as long as its own voiceover, plus 1.5s of air for the CTA.
const posDemoMetadata: CalculateMetadataFunction<PosDemoProps> = async ({
  props,
}) => {
  const seconds = await getAudioDurationInSeconds(staticFile(props.audioFile));

  return { durationInFrames: Math.ceil(seconds * FPS) + 45 };
};

// One template, many compositions: add a video by writing
// src/videos/<name>.props.ts and registering it here.
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="punto-listo">
      <Composition
        id="Corte"
        component={PosDemo}
        schema={posDemoSchema}
        defaultProps={corteProps}
        calculateMetadata={posDemoMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={840}
      />
      <Composition
        id="CorteMobile"
        component={PosDemo}
        schema={posDemoSchema}
        defaultProps={corteMobileProps}
        calculateMetadata={posDemoMetadata}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={840}
      />
    </Folder>
  );
};
