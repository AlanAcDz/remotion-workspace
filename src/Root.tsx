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
import { ticketStorySchema, type TicketStoryProps } from "./ticket/schema";
import { TicketStory } from "./ticket/ticket-story";
import { buildTimeline } from "./ticket/timeline";
import { RetoMostrador } from "./reto/reto-mostrador";
import { retoSchema, type RetoProps } from "./reto/schema";
import { retoCambioProps } from "./videos/reto-cambio.props";
import { retoCompraProps } from "./videos/reto-compra.props";
import { retoKiloProps } from "./videos/reto-kilo.props";
import { retoCambioOpcionesProps } from "./videos/reto-cambio-opciones.props";
import { retoMasVendidosProps } from "./videos/reto-mas-vendidos.props";
import { catalogoBaseProps } from "./videos/catalogo-base.props";
import { catalogoBaseRehookProps } from "./videos/catalogo-base-rehook.props";
import { cobroRapidoProps } from "./videos/cobro-rapido.props";
import { cobroRapidoRehookProps } from "./videos/cobro-rapido-rehook.props";
import { comprasProveedorProps } from "./videos/compras-proveedor.props";
import { corteProps } from "./videos/corte.props";
import { corteRehookProps } from "./videos/corte-rehook.props";
import { descuentosPorCajeroProps } from "./videos/descuentos-por-cajero.props";
import { devolucionesAutorizadasProps } from "./videos/devoluciones-autorizadas.props";
import { diferenciasInventarioProps } from "./videos/diferencias-inventario.props";
import { diferenciasInventarioRehookProps } from "./videos/diferencias-inventario-rehook.props";
import { existenciasBajasProps } from "./videos/existencias-bajas.props";
import { existenciasBajasRehookProps } from "./videos/existencias-bajas-rehook.props";
import { comprasProveedorRehookProps } from "./videos/compras-proveedor-rehook.props";
import { permisosCajeroProps } from "./videos/permisos-cajero.props";
import { permisosCajeroRehookProps } from "./videos/permisos-cajero-rehook.props";
import { ventaPorKiloProps } from "./videos/venta-por-kilo.props";
import { ventaPorKiloRehookProps } from "./videos/venta-por-kilo-rehook.props";
import { ticketTiendaProps } from "./videos/ticket-tienda.props";
import { ticketKiloProps } from "./videos/ticket-kilo.props";
import { ticketMermaProps } from "./videos/ticket-merma.props";
import { ticketDescuentosProps } from "./videos/ticket-descuentos.props";

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

// "El Ticket" has no voiceover to measure: its length is the beat grid's.
const ticketStoryMetadata: CalculateMetadataFunction<TicketStoryProps> = ({
  props,
}) => ({ durationInFrames: buildTimeline(props, FPS).end });

// The reto's voice stops for the countdown, so it runs that much longer.
const retoMetadata: CalculateMetadataFunction<RetoProps> = async ({
  props,
}) => {
  const seconds = await getAudioDurationInSeconds(staticFile(props.audioFile));

  return {
    durationInFrames: Math.ceil((seconds + props.pause.for) * FPS) + 30,
  };
};

const reto = {
  component: RetoMostrador,
  schema: retoSchema,
  calculateMetadata: retoMetadata,
  fps: FPS,
  width: 1080,
  height: 1920,
  durationInFrames: 660,
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
      <Composition
        {...shared}
        id="CorteRehook"
        defaultProps={corteRehookProps}
      />
      <Composition
        {...shared}
        id="CobroRapidoRehook"
        defaultProps={cobroRapidoRehookProps}
      />
      <Composition
        {...shared}
        id="VentaPorKiloRehook"
        defaultProps={ventaPorKiloRehookProps}
      />
      <Composition
        {...shared}
        id="CatalogoBaseRehook"
        defaultProps={catalogoBaseRehookProps}
      />
      <Composition
        {...shared}
        id="DiferenciasInventarioRehook"
        defaultProps={diferenciasInventarioRehookProps}
      />
      <Composition
        {...shared}
        id="PermisosCajeroRehook"
        defaultProps={permisosCajeroRehookProps}
      />
      <Composition
        {...shared}
        id="ExistenciasBajasRehook"
        defaultProps={existenciasBajasRehookProps}
      />
      <Composition
        {...shared}
        id="ComprasProveedorRehook"
        defaultProps={comprasProveedorRehookProps}
      />
      <Folder name="reto">
        <Composition {...reto} id="RetoCambio" defaultProps={retoCambioProps} />
        <Composition {...reto} id="RetoKilo" defaultProps={retoKiloProps} />
        <Composition {...reto} id="RetoCompra" defaultProps={retoCompraProps} />
        <Composition
          {...reto}
          id="RetoCambioOpciones"
          defaultProps={retoCambioOpcionesProps}
        />
        <Composition
          {...reto}
          id="RetoMasVendidos"
          defaultProps={retoMasVendidosProps}
        />
      </Folder>
      <Folder name="ticket">
        <Composition
          id="TicketTienda"
          component={TicketStory}
          schema={ticketStorySchema}
          calculateMetadata={ticketStoryMetadata}
          fps={FPS}
          width={1080}
          height={1920}
          durationInFrames={660}
          defaultProps={ticketTiendaProps}
        />
        <Composition
          id="TicketKilo"
          component={TicketStory}
          schema={ticketStorySchema}
          calculateMetadata={ticketStoryMetadata}
          fps={FPS}
          width={1080}
          height={1920}
          durationInFrames={714}
          defaultProps={ticketKiloProps}
        />
        <Composition
          id="TicketMerma"
          component={TicketStory}
          schema={ticketStorySchema}
          calculateMetadata={ticketStoryMetadata}
          fps={FPS}
          width={1080}
          height={1920}
          durationInFrames={858}
          defaultProps={ticketMermaProps}
        />
        <Composition
          id="TicketDescuentos"
          component={TicketStory}
          schema={ticketStorySchema}
          calculateMetadata={ticketStoryMetadata}
          fps={FPS}
          width={1080}
          height={1920}
          durationInFrames={726}
          defaultProps={ticketDescuentosProps}
        />
      </Folder>
    </Folder>
  );
};
