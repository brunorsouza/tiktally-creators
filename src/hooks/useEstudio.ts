import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { callEndpoint } from "@/services/creatorClient";
import type {
  GetShopProductsData,
  SearchMusicData,
  UploadFileInitData,
  UploadShoppableVideoFileData,
  UploadShoppablePhotoFileData,
  PrecheckVideoContentData,
  GetShoppableVideoPrecheckResultData,
  PostShoppableVideoData,
  PostShoppablePhotosData,
  GetShoppableVideoStatusData,
  CheckAnchorPrerequisitesData,
  CheckAnchorContentData,
} from "@/types/creator-api.generated";

/**
 * Hooks da área Estúdio de conteúdo shoppable: descobrir produto/música pra taggear,
 * subir arquivo, prechecar o vídeo, publicar (vídeo ou fotos) e acompanhar o status.
 * Pipeline completo: Get Shop Products + Search Music (descoberta) → Upload File Init
 * (genérico) → Upload Shoppable Video/Photo File → Precheck Video Content → Get
 * Shoppable Video Precheck Result → Post Shoppable Video/Photos → Get Shoppable Video Status.
 *
 * IMPORTANTE: todos os 10 endpoints exigem o escopo `creator.video.write` (pacote Content
 * Posting), que está **INATIVO** no app TikTally-prod hoje (escopo sensível — precisa
 * ativação + re-autorização do creator; ver docs/RELATORIO_ESCOPOS_MVP.md). Em mock
 * funciona normalmente; em live a chamada tende a falhar por permissão até o pacote ser
 * ativado.
 *
 * Como em useDescoberta.ts/useAmostras.ts, os `body` das mutations são montados como
 * `Record<string, unknown>` — os tipos `*Body` gerados não têm index signature, então não
 * dá pra usá-los como tipo de uma variável local que vai direto pro `CallParams.body`. Os
 * nomes de campo abaixo seguem esses tipos à risca (conferir em creator-api.generated.ts).
 *
 * Upload real de binário: os dois endpoints de upload (`uploadShoppableVideoFile` /
 * `uploadShoppablePhotoFile`) esperam um arquivo local (`data: file`, multipart) — o
 * `creatorClient` só manda JSON, então aqui o "arquivo" é representado por um nome/texto
 * digitado pelo usuário (ver EstudioPage). Em mock isso não importa (o fixture é fixo); em
 * live a chamada não teria como funcionar sem um client que faça upload binário de verdade.
 */

// =============== Produtos & música (query) ===============

export type ShopProductSortField = "PRODUCT_ID" | "PRICE" | "SALE";
export type ShopProductSortOrder = "ASC" | "DESC";

export interface ShopProductsFilters {
  titleKeyword?: string;
  sortField?: ShopProductSortField;
  sortOrder?: ShopProductSortOrder;
  pageToken?: string;
  /** Faixa válida da API: 1–100; recomendado 20. */
  pageSize?: number;
}

export interface MusicSearchFilters {
  /** Obrigatório pela API. */
  keyword: string;
  /** Vazio na 1ª página; da 2ª em diante, repetir o mesmo search_id da resposta anterior. */
  searchId?: string;
  pageToken?: string;
  pageSize?: number;
  /** Região ISO 3166-1 alpha-2 (ex.: "BR"). */
  region?: string;
  /** Idioma BCP-47 (ex.: "pt-BR"). */
  language?: string;
}

export const estudioKeys = {
  all: ["estudio"] as const,
  shopProducts: (userId?: string, filters?: ShopProductsFilters) =>
    [...estudioKeys.all, "shop-products", userId, filters] as const,
  music: (userId?: string, filters?: MusicSearchFilters) => [...estudioKeys.all, "music", userId, filters] as const,
  precheckResult: (userId?: string, taskId?: string) =>
    [...estudioKeys.all, "precheck-result", userId, taskId] as const,
  videoStatus: (userId?: string, videoId?: string) => [...estudioKeys.all, "video-status", userId, videoId] as const,
};

/**
 * Get Shop Products (202509) — produtos da loja vinculada ao creator, pra buscar o
 * `product_id` usado na âncora do vídeo/foto shoppable. `page_size` é obrigatório pela API
 * (default 20 aqui).
 */
export function useShopProducts(filters: ShopProductsFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: estudioKeys.shopProducts(user?.id, filters),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetShopProductsData>(
        "getShopProducts",
        {
          query: {
            title_keyword: filters.titleKeyword || undefined,
            sort_field: filters.sortField,
            sort_order: filters.sortOrder,
            page_size: filters.pageSize ?? 20,
            page_token: filters.pageToken,
          },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao carregar os produtos da loja");
      return r.data as GetShopProductsData;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Search Music (202602) — biblioteca de música pra usar como BGM do vídeo/foto shoppable.
 * `keyword` é obrigatório pela API — só dispara com um termo de busca preenchido.
 */
export function useMusicSearch(filters: MusicSearchFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: estudioKeys.music(user?.id, filters),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<SearchMusicData>(
        "searchMusic",
        {
          query: {
            keyword: filters.keyword,
            search_id: filters.searchId,
            page_token: filters.pageToken,
            // page_size sem default era omitido da query; a API trata como
            // obrigatório nos demais endpoints paginados, então fixamos o padrão.
            page_size: filters.pageSize ?? 20,
            region: filters.region,
            language: filters.language,
          },
        },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao buscar músicas");
      return r.data as SearchMusicData;
    },
    enabled: !!user && !!filters.keyword.trim(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// =============== Pipeline de publicação (mutations) ===============

export interface UploadFileInitInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  totalChunkCount: number;
  targetPath: string;
  /** Só relevante pra lojas cross-border — a maioria dos creators pode deixar em branco. */
  shopCipher?: string;
  categoryAssetCipher?: string;
}

/**
 * Upload File Init (202512) — inicializa a sessão de upload de um arquivo grande (ex.:
 * vídeo) e devolve `upload_url`/`upload_token` pra fazer o upload binário em seguida. É o
 * passo "genérico" de upload de arquivo do TikTok Shop (não exclusivo do Estúdio).
 */
export function useUploadFileInit() {
  return useMutation({
    mutationFn: async (input: UploadFileInitInput) => {
      const body: Record<string, unknown> = {
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: input.fileSize,
        total_chunk_count: input.totalChunkCount,
        target_path: input.targetPath,
      };
      const r = await callEndpoint<UploadFileInitData>("uploadFileInit", {
        query: { shop_cipher: input.shopCipher || undefined, category_asset_cipher: input.categoryAssetCipher || undefined },
        body,
      });
      if (!r.ok) throw new Error(r.error || "Falha ao iniciar o upload");
      return r.data as UploadFileInitData;
    },
  });
}

/**
 * Upload Shoppable Video File (202505) — sobe o arquivo de vídeo antes de postar. Upload
 * real de binário não é viável nesta ferramenta web (o client só manda JSON) — o parâmetro
 * é o nome do arquivo local, só pra simular a chamada e exercitar o retorno.
 */
export function useUploadShoppableVideoFile() {
  return useMutation({
    mutationFn: async (fileName: string) => {
      const r = await callEndpoint<UploadShoppableVideoFileData>("uploadShoppableVideoFile", {
        body: { data: fileName },
      });
      if (!r.ok) throw new Error(r.error || "Falha ao subir o arquivo de vídeo");
      return r.data as UploadShoppableVideoFileData;
    },
  });
}

/**
 * Upload Shoppable Photo File (202511) — mesma ressalva do vídeo: representado por um nome
 * de arquivo digitado, sem envio real de binário.
 */
export function useUploadShoppablePhotoFile() {
  return useMutation({
    mutationFn: async (fileName: string) => {
      const r = await callEndpoint<UploadShoppablePhotoFileData>("uploadShoppablePhotoFile", {
        body: { data: fileName },
      });
      if (!r.ok) throw new Error(r.error || "Falha ao subir o arquivo de foto");
      return r.data as UploadShoppablePhotoFileData;
    },
  });
}

export interface PrecheckVideoInput {
  /** file_id devolvido pelo Upload Shoppable Video File. */
  fileId: string;
  productId: string;
  /** Título da âncora de produto — precisa ter menos de 30 caracteres. */
  anchorTitle: string;
}

/**
 * Precheck Video Content (202511) — checa violação de política e qualidade antes de postar.
 * Devolve um `task_id` assíncrono, consultado depois via Get Shoppable Video Precheck Result
 * (aba Status).
 */
export function usePrecheckVideoContent() {
  return useMutation({
    mutationFn: async (input: PrecheckVideoInput) => {
      const body: Record<string, unknown> = {
        video_info: { file_id: input.fileId },
        product_link_info: { product_id: input.productId, title: input.anchorTitle },
      };
      const r = await callEndpoint<PrecheckVideoContentData>("precheckVideoContent", { body });
      if (!r.ok) throw new Error(r.error || "Falha ao pré-checar o vídeo");
      return r.data as PrecheckVideoContentData;
    },
  });
}

/**
 * Get Shoppable Video Precheck Result (202601) — resultado do precheck (`task_id` no path).
 * `enabled` só dispara com um task_id preenchido.
 */
export function useShoppableVideoPrecheckResult(taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: estudioKeys.precheckResult(user?.id, taskId),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetShoppableVideoPrecheckResultData>(
        "getShoppableVideoPrecheckResult",
        { pathParams: { task_id: taskId } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao consultar o resultado do precheck");
      return r.data as GetShoppableVideoPrecheckResultData;
    },
    enabled: !!user && !!taskId.trim(),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export interface PostShoppableVideoInput {
  fileId: string;
  /** Legenda do vídeo — até 4000 caracteres UTF-16. */
  title: string;
  /** URI da capa (Upload Shoppable Photo File). Se informado, tem prioridade sobre cover_timestamp_ms. */
  coverUri?: string;
  coverTimestampMs?: number;
  musicId?: string;
  isAiGenerated?: boolean;
  productId: string;
  anchorTitle: string;
}

/** Post Shoppable Video (202607) — publica o vídeo shoppable já enviado (e, idealmente, prechecado). */
export function usePostShoppableVideo() {
  return useMutation({
    mutationFn: async (input: PostShoppableVideoInput) => {
      const videoInfo: Record<string, unknown> = { file_id: input.fileId, title: input.title };
      if (input.coverUri) videoInfo.cover_uri = input.coverUri;
      if (input.coverTimestampMs != null) videoInfo.cover_timestamp_ms = input.coverTimestampMs;
      if (input.musicId) videoInfo.music_id = input.musicId;
      if (input.isAiGenerated != null) videoInfo.is_ai_generated = input.isAiGenerated;
      const body: Record<string, unknown> = {
        video_info: videoInfo,
        product_link_info: { product_id: input.productId, title: input.anchorTitle },
      };
      const r = await callEndpoint<PostShoppableVideoData>("postShoppableVideo", { body });
      if (!r.ok) throw new Error(r.error || "Falha ao publicar o vídeo");
      return r.data as PostShoppableVideoData;
    },
  });
}

/** `post_type` de Post Shoppable Photos: 1-LINK_TO_PRODUCT, 2-LINK_TO_SHOP, 3-LINK_TO_ONE_PIC_ONE_PRODUCT. */
export type PhotoPostType = "1" | "2" | "3";

export interface PostShoppablePhotosInput {
  /** Um `photo_uri` (Upload Shoppable Photo File) por foto do carrossel. */
  photoFileUris: string[];
  musicId?: string;
  /** Título do post — até 5000 caracteres UTF-16, aceita hashtags (#exemplo). */
  title?: string;
  postType?: PhotoPostType;
  shopId?: string;
  groupType?: string;
  groupId?: string;
  productId?: string;
  linkTitle?: string;
}

/** Post Shoppable Photos (202607) — publica um carrossel de fotos com âncora de produto/loja. */
export function usePostShoppablePhotos() {
  return useMutation({
    mutationFn: async (input: PostShoppablePhotosInput) => {
      const body: Record<string, unknown> = {
        photos_info: input.photoFileUris.map((uri) => ({ photo_file_uris: uri })),
      };
      if (input.musicId) body.music_id = input.musicId;
      if (input.title) body.title = input.title;
      if (input.postType) {
        const linkInfo: Record<string, unknown> = { post_type: input.postType };
        if (input.shopId || input.groupType || input.groupId) {
          const shopInfo: Record<string, unknown> = {};
          if (input.shopId) shopInfo.shop_id = input.shopId;
          if (input.groupType) shopInfo.group_type = input.groupType;
          if (input.groupId) shopInfo.group_id = input.groupId;
          linkInfo.shop_info = shopInfo;
        }
        if (input.productId) {
          linkInfo.links = [{ product_id: input.productId, link_title: input.linkTitle || undefined }];
        }
        body.link_info = linkInfo;
      }
      const r = await callEndpoint<PostShoppablePhotosData>("postShoppablePhotos", { body });
      if (!r.ok) throw new Error(r.error || "Falha ao publicar as fotos");
      return r.data as PostShoppablePhotosData;
    },
  });
}

/**
 * Get Shoppable Video Status (202509) — status de publicação (`video_id` no path). `enabled`
 * só dispara com um video_id preenchido.
 */
export function useShoppableVideoStatus(videoId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: estudioKeys.videoStatus(user?.id, videoId),
    queryFn: async ({ signal }) => {
      const r = await callEndpoint<GetShoppableVideoStatusData>(
        "getShoppableVideoStatus",
        { pathParams: { video_id: videoId } },
        signal
      );
      if (!r.ok) throw new Error(r.error || "Falha ao consultar o status do vídeo");
      return r.data as GetShoppableVideoStatusData;
    },
    enabled: !!user && !!videoId.trim(),
    staleTime: 10 * 1000,
    retry: 1,
  });
}

/**
 * Check Anchor Prerequisites (202402) — o creator pode transformar este produto em
 * âncora de vídeo?
 *
 * Verificado em produção: funciona com os escopos atuais, sem depender de
 * `creator.video.write`. Sucesso é `code: 0` com data vazio; reprovação chega como
 * erro da API, então quem chama trata pelo `throw`.
 */
export function useCheckAnchorPrerequisites() {
  return useMutation({
    mutationFn: async (productId: string) => {
      const r = await callEndpoint<CheckAnchorPrerequisitesData>("checkAnchorPrerequisites", {
        body: { product_id: productId },
      });
      if (!r.ok) throw new Error(r.error || "Este produto não pode ser usado como âncora");
      return true;
    },
  });
}

/**
 * Check Anchor Content (202403) — valida o título da âncora.
 *
 * Regra confirmada na API: título com 30 caracteres ou mais é recusado com 16012007
 * ("The title should be shorter than 30 characters"). Também reprova palavrão,
 * pontuação e emoji.
 */
export function useCheckAnchorContent() {
  return useMutation({
    mutationFn: async (title: string) => {
      const r = await callEndpoint<CheckAnchorContentData>("checkAnchorContent", {
        body: { title },
      });
      if (!r.ok) {
        if (/shorter than 30/i.test(r.error || "")) {
          throw new Error("O título da âncora precisa ter menos de 30 caracteres.");
        }
        throw new Error(r.error || "Título de âncora recusado");
      }
      return true;
    },
  });
}
