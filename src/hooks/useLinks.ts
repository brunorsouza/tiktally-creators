import { useMutation } from "@tanstack/react-query";
import { callEndpoint } from "@/services/creatorClient";
import type {
  CreatorGenerateGeneralLinkData,
  CreatorGeneratePublisherLinkData,
} from "@/types/creator-api.generated";

/**
 * Hooks da área Links de afiliado: geram links de compartilhamento sob demanda
 * (Creator Generate General Link e Creator Generate Publisher Link). Diferente das
 * demais áreas, aqui não existe "lista" para consultar/invalidar — cada chamada já
 * devolve os links gerados na hora, então os dois hooks são só `useMutation`.
 *
 * Escopo `creator.affiliate.share_link.read` — ausente no app TikTally-prod hoje
 * (ver docs/RELATORIO_ESCOPOS_MVP.md). Em modo live a chamada deve falhar por
 * permissão até o escopo ser adicionado e o creator re-autorizar; em mock funciona
 * normalmente com o fixture extraído da doc.
 */

/**
 * Entrada comum aos dois endpoints. Só `material.type: "PRODUCT"` é suportado aqui —
 * a API também aceita "CAMPAIGN", mas aí `promotion_campaign_schema` vira obrigatório,
 * fora do escopo desta ferramenta.
 */
export interface GenerateLinkInput {
  /** `material.ids` — IDs de produto. Máx. 50 pela API. */
  productIds: string[];
  /** `campaign_id` — preencher se os produtos vieram de uma campanha de afiliado. */
  campaignId?: string;
  /** `link_type` — "TOKO" devolve a URL da Tokopedia (agências Toko); vazio = URL da TikTok Shop. */
  linkType?: string;
}

export interface GeneratePublisherLinkInput extends GenerateLinkInput {
  /** `publisher_id` — path param da API (ID do publisher no sistema do parceiro). */
  publisherId: string;
}

function buildLinkBody(input: GenerateLinkInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    material: { ids: input.productIds, type: "PRODUCT" },
  };
  if (input.campaignId) body.campaign_id = input.campaignId;
  if (input.linkType) body.link_type = input.linkType;
  return body;
}

/** Creator Generate General Link (202505) — links de afiliado geral para até 50 produtos. */
export function useGenerateGeneralLink() {
  return useMutation({
    mutationFn: async (input: GenerateLinkInput) => {
      const r = await callEndpoint<CreatorGenerateGeneralLinkData>("creatorGenerateGeneralLink", {
        body: buildLinkBody(input),
      });
      if (!r.ok) throw new Error(r.error || "Falha ao gerar o link geral");
      return r.data as CreatorGenerateGeneralLinkData;
    },
  });
}

/**
 * Creator Generate Publisher Link (202504) — links atrelados a um publisher específico.
 * `publisher_id` é path param da API — vai em `pathParams`, o `callEndpoint` resolve no path.
 */
export function useGeneratePublisherLink() {
  return useMutation({
    mutationFn: async (input: GeneratePublisherLinkInput) => {
      const r = await callEndpoint<CreatorGeneratePublisherLinkData>("creatorGeneratePublisherLink", {
        pathParams: { publisher_id: input.publisherId },
        body: buildLinkBody(input),
      });
      if (!r.ok) throw new Error(r.error || "Falha ao gerar o link de publisher");
      return r.data as CreatorGeneratePublisherLinkData;
    },
  });
}
