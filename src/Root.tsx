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
import { catalogoBaseProps } from "./videos/catalogo-base.props";
import { cobroRapidoProps } from "./videos/cobro-rapido.props";
import { comprasProveedorProps } from "./videos/compras-proveedor.props";
import { corteProps } from "./videos/corte.props";
import { descuentosPorCajeroProps } from "./videos/descuentos-por-cajero.props";
import { devolucionesAutorizadasProps } from "./videos/devoluciones-autorizadas.props";
import { diferenciasInventarioProps } from "./videos/diferencias-inventario.props";
import { existenciasBajasProps } from "./videos/existencias-bajas.props";
import { permisosCajeroProps } from "./videos/permisos-cajero.props";
import { ventaPorKiloProps } from "./videos/venta-por-kilo.props";

const FPS = 30;

// Every video is as long as its own voiceover, plus 1.5s of air for the CTA.
const posDemoMetadata: CalculateMetadataFunction<PosDemoProps> = async ({
  props,
}) => {
  const seconds = await getAudioDurationInSeconds(staticFile(props.audioFile));

  return { durationInFrames: Math.ceil(seconds * FPS) + 45 };
};

// Every Punto Listo video is the same vertical format on the same template;
// only the id and the props change. `durationInFrames` is a placeholder the
// voiceover length overrides in `posDemoMetadata`.
const shared = {
  component: PosDemo,
  schema: posDemoSchema,
  calculateMetadata: posDemoMetadata,
  fps: FPS,
  width: 1080,
  height: 1920,
  durationInFrames: 840,
} as const;

// One template, many compositions: add a video by writing
// src/videos/<name>.props.ts and registering it here.
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="punto-listo">
      <Composition {...shared} id="Corte" defaultProps={corteProps} />
      <Composition
        {...shared}
        id="CobroRapido"
        defaultProps={cobroRapidoProps}
      />
      <Composition
        {...shared}
        id="VentaPorKilo"
        defaultProps={ventaPorKiloProps}
      />
      <Composition
        {...shared}
        id="DiferenciasInventario"
        defaultProps={diferenciasInventarioProps}
      />
      <Composition
        {...shared}
        id="PermisosCajero"
        defaultProps={permisosCajeroProps}
      />
      <Composition
        {...shared}
        id="CatalogoBase"
        defaultProps={catalogoBaseProps}
      />
      <Composition
        {...shared}
        id="ComprasProveedor"
        defaultProps={comprasProveedorProps}
      />
      <Composition
        {...shared}
        id="DevolucionesAutorizadas"
        defaultProps={devolucionesAutorizadasProps}
      />
      <Composition
        {...shared}
        id="ExistenciasBajas"
        defaultProps={existenciasBajasProps}
      />
      <Composition
        {...shared}
        id="DescuentosPorCajero"
        defaultProps={descuentosPorCajeroProps}
      />
    </Folder>
  );
};
