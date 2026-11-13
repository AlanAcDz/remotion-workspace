import "./index.css";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import {
  CalculateMetadataFunction,
  Composition,
  Folder,
  staticFile,
  Still,
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
import { RetoTicket } from "./reto/reto-ticket";
import { retoTicketSchema, type RetoTicketProps } from "./reto/ticket-schema";
import { retoErrorCambioProps } from "./videos/reto-error-cambio.props";
import { retoErrorCorteProps } from "./videos/reto-error-corte.props";
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
import { ticketPrecioProps } from "./videos/ticket-precio.props";
import { ChatStory } from "./chat/chat-story";
import { chatStorySchema, type ChatStoryProps } from "./chat/schema";
import { chatFaltanteProps } from "./videos/chat-faltante.props";
import { chatYoguresProps } from "./videos/chat-yogures.props";
import { CarouselSlideView } from "./carousel/carousel-slide";
import { CAROUSEL, carouselSlideSchema } from "./carousel/schema";
import { diaDeMuertosSlides } from "./videos/dia-de-muertos.carousel";
import { PhotoStory } from "./photo/photo-story";
import { photoStorySchema, type PhotoStoryProps } from "./photo/schema";
import { cocaLoopProps } from "./videos/coca-loop.props";
import { libretaKiloProps } from "./videos/libreta-kilo.props";
import { libretaConteoProps } from "./videos/libreta-conteo.props";
import { descuentoLoopProps } from "./videos/descuento-loop.props";
import { clientesQuincenaProps } from "./videos/clientes-quincena.props";
import { calaveritaMermaProps } from "./videos/calaverita-merma.props";
import { libretaNotasProps } from "./videos/libreta-notas.props";
import { retoFolioFaltaProps } from "./videos/reto-folio-falta.props";
import { chatDevolucionProps } from "./videos/chat-devolucion.props";
import { CarreraStory } from "./carrera/carrera-story";
import { carreraStorySchema, type CarreraStoryProps } from "./carrera/schema";
import { cambioLoopProps } from "./videos/cambio-loop.props";
import { carreraKiloProps } from "./videos/carrera-kilo.props";
import { chatBuenFinProps } from "./videos/chat-buen-fin.props";
import { libretaCorteProps } from "./videos/libreta-corte.props";
import { retoPromoProps } from "./videos/reto-promo.props";
import { ticketCocasProps } from "./videos/ticket-cocas.props";
import { libretaLoopProps } from "./videos/libreta-loop.props";
import { cartelCajeroProps } from "./videos/cartel-cajero.props";
import { ticketNoVendisteProps } from "./videos/ticket-no-vendiste.props";
import { aryaWhyIBuiltAryaProps } from "./videos/av-20261019-why-i-built-arya.props";
import { aryaDidIGiveItProps } from "./videos/av-20261021-did-i-give-it.props";
import { aryaForgotDogMedicationProps } from "./videos/av-20261023-forgot-dog-medication.props";
import { aryaThreeMedsOneListProps } from "./videos/av-20261026-three-meds-one-list.props";
import { aryaEvery12HoursProps } from "./videos/av-20261028-every-12-hours.props";
import { aryaWhatIWishIHadProps } from "./videos/av-20261030-what-i-wish-i-had.props";
import { aryaVetAsksEveryDoseProps } from "./videos/av-20261102-vet-asks-every-dose.props";
import { aryaVomitedAfterPillProps } from "./videos/av-20261104-vomited-after-pill.props";
import { aryaRefillBeforeItRunsOutProps } from "./videos/av-20261106-refill-before-it-runs-out.props";
import { Diary } from "./arya-shorts/diary";
import { DoseBeat } from "./arya-shorts/dose-beat";
import { FiveSecond } from "./arya-shorts/five-second";
import { Flipbook } from "./arya-shorts/flipbook";
import { TierList } from "./arya-shorts/tier-list";
import { Trailer } from "./arya-shorts/trailer";
import { Trile } from "./arya-shorts/trile";
import { TrileVacio } from "./arya-shorts/trile-vacio";
import { NoSabe } from "./arya-shorts/no-sabe";
import { aryaNoSabeProps } from "./videos/av-20261117-arya-no-sabe.props";
import { aryaDiaryProps } from "./videos/av-20261107-diary-of-a-dog-on-meds.props";
import { aryaFindThePillProps } from "./videos/av-20261108-find-the-pill.props";
import { aryaFiveSecondProps } from "./videos/av-20261109-five-second-test.props";
import { aryaDoseBeatProps } from "./videos/av-20261110-dose-beat.props";
import { aryaTierListProps } from "./videos/av-20261111-pill-dodge-tier-list.props";
import { aryaSesentaDiasProps } from "./videos/av-20261112-sesenta-dias.props";
import { aryaThePillProps } from "./videos/av-20261113-the-pill-trailer.props";
import { AryaChat } from "./arya-shorts/chat";
import { aryaElGrupoDeLaFamiliaProps } from "./videos/av-20261118-el-grupo-de-la-familia.props";
import { aryaDondeQuedoLaPastillitaProps } from "./videos/av-20261115-donde-quedo-la-pastillita.props";
import { aryaDiarioProps } from "./videos/av-20261114-diario-de-una-perrita.props";
import { aryaSixtyDaysProps } from "./videos/av-20261119-sixty-days.props";
import { Loteria } from "./arya-shorts/loteria";
import { aryaLoteriaProps } from "./videos/av-20261116-loteria-de-la-pastilla.props";
import { SeBusca } from "./arya-shorts/se-busca";
import { aryaSeBuscaProps } from "./videos/av-20261120-se-busca.props";
import { StoreVideo } from "./store-video/store-video";
import {
  BON_FPS,
  BonUnaTarde,
  calculateBonMetadata,
} from "./bon/bon-una-tarde";
import { bonSchema } from "./bon/schema";
import { bonUnaTardeProps } from "./videos/bon-una-tarde.props";
import {
  VIDANTA_FAMILIA_FPS,
  VidantaFamilia,
  calculateVidantaFamiliaMetadata,
} from "./vidanta-familia/vidanta-familia";
import { vidantaFamiliaSchema } from "./vidanta-familia/schema";
import { vidantaFamiliaProps } from "./videos/vidanta-familia.props";
import {
  CANVAS,
  DURATION as STORE_VIDEO_DURATION,
  storeVideoSchema,
  type Lang as StoreVideoLang,
  type Store as StoreVideoStore,
} from "./store-video/schema";

const FPS = 30;

// Arya's store videos: App Store previews (portrait) and Google Play promos (landscape).
const STORE_VIDEOS: { id: string; store: StoreVideoStore; lang: StoreVideoLang }[] = [
  { id: "arya-appstore-preview-en", store: "apple", lang: "en" },
  { id: "arya-appstore-preview-es", store: "apple", lang: "es" },
  { id: "arya-play-promo-en", store: "google", lang: "en" },
  { id: "arya-play-promo-es", store: "google", lang: "es" },
];

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

// The no-voice Arya shorts have nothing to measure: each carries its `end`.
const aryaShort = { fps: FPS, width: 1080, height: 1920 } as const;

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

// "El Chat" has no voiceover either: it ends where its props say.
const chatStoryMetadata: CalculateMetadataFunction<ChatStoryProps> = ({
  props,
}) => ({ durationInFrames: Math.round(props.end * FPS) });

const chat = {
  component: ChatStory,
  schema: chatStorySchema,
  calculateMetadata: chatStoryMetadata,
  fps: FPS,
  width: 1080,
  height: 1920,
  durationInFrames: 510,
} as const;

// "La Libreta" and the loops end where their props say, past the voice.
const photoStoryMetadata: CalculateMetadataFunction<PhotoStoryProps> = ({
  props,
}) => ({ durationInFrames: Math.round(props.end * FPS) });

const photo = {
  component: PhotoStory,
  schema: photoStorySchema,
  calculateMetadata: photoStoryMetadata,
  fps: FPS,
  width: 1080,
  height: 1920,
  durationInFrames: 621,
} as const;

// "La Carrera" ends where its props say, past the commentator.
const carreraStoryMetadata: CalculateMetadataFunction<CarreraStoryProps> = ({
  props,
}) => ({ durationInFrames: Math.round(props.end * FPS) });

// The receipt reto ends where its timing says, past the voice.
const retoTicketMetadata: CalculateMetadataFunction<RetoTicketProps> = ({
  props,
}) => ({ durationInFrames: Math.round(props.timing.end * FPS) });

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
    <>
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
          <Composition
            {...reto}
            id="RetoCambio"
            defaultProps={retoCambioProps}
          />
          <Composition {...reto} id="RetoKilo" defaultProps={retoKiloProps} />
          <Composition
            {...reto}
            id="RetoCompra"
            defaultProps={retoCompraProps}
          />
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
          <Composition
            id="RetoErrorCambio"
            component={RetoTicket}
            schema={retoTicketSchema}
            calculateMetadata={retoTicketMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={642}
            defaultProps={retoErrorCambioProps}
          />
          <Composition
            id="RetoErrorCorte"
            component={RetoTicket}
            schema={retoTicketSchema}
            calculateMetadata={retoTicketMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={750}
            defaultProps={retoErrorCorteProps}
          />
          <Composition
            id="RetoFolioFalta"
            component={RetoTicket}
            schema={retoTicketSchema}
            calculateMetadata={retoTicketMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={732}
            defaultProps={retoFolioFaltaProps}
          />
          <Composition
            {...reto}
            id="RetoPromo"
            defaultProps={retoPromoProps}
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
          <Composition
            id="TicketPrecio"
            component={TicketStory}
            schema={ticketStorySchema}
            calculateMetadata={ticketStoryMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={882}
            defaultProps={ticketPrecioProps}
          />
          <Composition
            id="TicketNoVendiste"
            component={TicketStory}
            schema={ticketStorySchema}
            calculateMetadata={ticketStoryMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={750}
            defaultProps={ticketNoVendisteProps}
          />
          <Composition
            id="TicketCocas"
            component={TicketStory}
            schema={ticketStorySchema}
            calculateMetadata={ticketStoryMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={720}
            defaultProps={ticketCocasProps}
          />
        </Folder>
        <Folder name="chat">
          <Composition
            {...chat}
            id="ChatFaltante"
            defaultProps={chatFaltanteProps}
          />
          <Composition
            {...chat}
            id="ChatYogures"
            defaultProps={chatYoguresProps}
          />
          <Composition
            {...chat}
            id="ChatDevolucion"
            defaultProps={chatDevolucionProps}
          />
          <Composition
            {...chat}
            id="ChatBuenFin"
            defaultProps={chatBuenFinProps}
          />
        </Folder>
        <Folder name="carrera">
          <Composition
            id="CarreraKilo"
            component={CarreraStory}
            schema={carreraStorySchema}
            calculateMetadata={carreraStoryMetadata}
            fps={FPS}
            width={1080}
            height={1920}
            durationInFrames={345}
            defaultProps={carreraKiloProps}
          />
        </Folder>
        <Folder name="photo">
          <Composition
            {...photo}
            id="LibretaKilo"
            defaultProps={libretaKiloProps}
          />
          <Composition {...photo} id="CocaLoop" defaultProps={cocaLoopProps} />
          <Composition
            {...photo}
            id="LibretaConteo"
            defaultProps={libretaConteoProps}
          />
          <Composition
            {...photo}
            id="DescuentoLoop"
            defaultProps={descuentoLoopProps}
          />
          <Composition
            {...photo}
            id="ClientesQuincena"
            defaultProps={clientesQuincenaProps}
          />
          <Composition
            {...photo}
            id="CalaveritaMerma"
            defaultProps={calaveritaMermaProps}
          />
          <Composition
            {...photo}
            id="LibretaNotas"
            defaultProps={libretaNotasProps}
          />
          <Composition
            {...photo}
            id="LibretaLoop"
            defaultProps={libretaLoopProps}
          />
          <Composition
            {...photo}
            id="CartelCajero"
            defaultProps={cartelCajeroProps}
          />
          <Composition
            {...photo}
            id="CambioLoop"
            defaultProps={cambioLoopProps}
          />
          <Composition
            {...photo}
            id="LibretaCorte"
            defaultProps={libretaCorteProps}
          />
        </Folder>
        <Folder name="carrusel">
          {diaDeMuertosSlides.map((slide, index) => (
            <Still
              key={index}
              id={`DiaDeMuertos-${String(index + 1).padStart(2, "0")}`}
              component={CarouselSlideView}
              schema={carouselSlideSchema}
              width={CAROUSEL.width}
              height={CAROUSEL.height}
              defaultProps={{
                slide,
                page: index + 1,
                pages: diaDeMuertosSlides.length,
                logo: "videos/punto-listo/logo.png",
              }}
            />
          ))}
        </Folder>
      </Folder>
      <Folder name="arya">
        <Composition
          {...shared}
          id="AryaWhyIBuiltArya"
          defaultProps={aryaWhyIBuiltAryaProps}
        />
        <Composition
          {...shared}
          id="AryaDidIGiveIt"
          defaultProps={aryaDidIGiveItProps}
        />
        <Composition
          {...shared}
          id="AryaForgotDogMedication"
          defaultProps={aryaForgotDogMedicationProps}
        />
        <Composition
          {...shared}
          id="AryaThreeMedsOneList"
          defaultProps={aryaThreeMedsOneListProps}
        />
        <Composition
          {...shared}
          id="AryaEvery12Hours"
          defaultProps={aryaEvery12HoursProps}
        />
        <Composition
          {...shared}
          id="AryaWhatIWishIHad"
          defaultProps={aryaWhatIWishIHadProps}
        />
        <Composition
          {...shared}
          id="AryaVetAsksEveryDose"
          defaultProps={aryaVetAsksEveryDoseProps}
        />
        <Composition
          {...shared}
          id="AryaVomitedAfterPill"
          defaultProps={aryaVomitedAfterPillProps}
        />
        <Composition
          {...shared}
          id="AryaRefillBeforeItRunsOut"
          defaultProps={aryaRefillBeforeItRunsOutProps}
        />
        <Folder name="arya-shorts">
          <Composition
            {...aryaShort}
            id="AryaDiaryOfADogOnMeds"
            component={Diary}
            durationInFrames={Math.round(aryaDiaryProps.end * FPS)}
            defaultProps={aryaDiaryProps}
          />
          <Composition
            {...aryaShort}
            id="AryaDiarioDeUnaPerrita"
            component={Diary}
            durationInFrames={Math.round(aryaDiarioProps.end * FPS)}
            defaultProps={aryaDiarioProps}
          />
          <Composition
            {...aryaShort}
            id="AryaFindThePill"
            component={Trile}
            durationInFrames={Math.round(aryaFindThePillProps.end * FPS)}
            defaultProps={aryaFindThePillProps}
          />
          <Composition
            {...aryaShort}
            id="AryaFiveSecondTest"
            component={FiveSecond}
            durationInFrames={Math.round(aryaFiveSecondProps.end * FPS)}
            defaultProps={aryaFiveSecondProps}
          />
          <Composition
            {...aryaShort}
            id="AryaDoseBeat"
            component={DoseBeat}
            durationInFrames={Math.round(aryaDoseBeatProps.end * FPS)}
            defaultProps={aryaDoseBeatProps}
          />
          <Composition
            {...aryaShort}
            id="AryaPillDodgeTierList"
            component={TierList}
            durationInFrames={Math.round(aryaTierListProps.end * FPS)}
            defaultProps={aryaTierListProps}
          />
          <Composition
            {...aryaShort}
            id="AryaSesentaDias"
            component={Flipbook}
            durationInFrames={Math.round(aryaSesentaDiasProps.end * FPS)}
            defaultProps={aryaSesentaDiasProps}
          />
          <Composition
            {...aryaShort}
            id="AryaSixtyDays"
            component={Flipbook}
            durationInFrames={Math.round(aryaSixtyDaysProps.end * FPS)}
            defaultProps={aryaSixtyDaysProps}
          />
          <Composition
            {...aryaShort}
            id="AryaThePillTrailer"
            component={Trailer}
            durationInFrames={Math.round(aryaThePillProps.end * FPS)}
            defaultProps={aryaThePillProps}
          />
          <Composition
            {...aryaShort}
            id="AryaElGrupoDeLaFamilia"
            component={AryaChat}
            durationInFrames={Math.round(aryaElGrupoDeLaFamiliaProps.end * FPS)}
            defaultProps={aryaElGrupoDeLaFamiliaProps}
          />
          <Composition
            {...aryaShort}
            id="AryaNoSabe"
            component={NoSabe}
            durationInFrames={Math.round(aryaNoSabeProps.end * FPS)}
            defaultProps={aryaNoSabeProps}
          />
          <Composition
            {...aryaShort}
            id="AryaDondeQuedoLaPastillita"
            component={TrileVacio}
            durationInFrames={Math.round(aryaDondeQuedoLaPastillitaProps.end * FPS)}
            defaultProps={aryaDondeQuedoLaPastillitaProps}
          />
          <Composition
            {...aryaShort}
            id="AryaLoteriaDeLaPastilla"
            component={Loteria}
            durationInFrames={Math.round(aryaLoteriaProps.end * FPS)}
            defaultProps={aryaLoteriaProps}
          />
          <Composition
            {...aryaShort}
            id="AryaSeBusca"
            component={SeBusca}
            durationInFrames={Math.round(aryaSeBuscaProps.end * FPS)}
            defaultProps={aryaSeBuscaProps}
          />
        </Folder>
        <Folder name="arya-store">
          {STORE_VIDEOS.map(({ id, store, lang }) => (
            <Composition
              key={id}
              id={id}
              component={StoreVideo}
              schema={storeVideoSchema}
              fps={FPS}
              width={CANVAS[store].width}
              height={CANVAS[store].height}
              durationInFrames={STORE_VIDEO_DURATION}
              defaultProps={{ lang, store }}
            />
          ))}
        </Folder>
      </Folder>
      <Folder name="bon">
        <Composition
          id="bon-una-tarde"
          component={BonUnaTarde}
          schema={bonSchema}
          calculateMetadata={calculateBonMetadata}
          fps={BON_FPS}
          width={1080}
          height={1920}
          durationInFrames={2097}
          defaultProps={bonUnaTardeProps}
        />
      </Folder>
      <Folder name="vidanta-familia">
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
      </Folder>
    </>
  );
};
