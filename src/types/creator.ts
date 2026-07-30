/**
 * Tipos de domínio da Affiliate Creator API do TikTok Shop.
 * Baseado em docs/TIKTOK_AFFILIATE_CREATOR_API.md (36 endpoints mapeados).
 * Só o subconjunto do MVP (perfil + ganhos) está tipado; o resto é TODO.
 */

export interface Money {
  amount: string;
  currency: string;
}

/** Get Creator Profile — /affiliate_creator/202508/profiles */
export interface CreatorProfile {
  avatar?: { width: number; height: number; url: string };
  username: string;
  selection_region?: string;
  register_region?: string;
  seller_type?: string;
  permissions?: string[];
  user_type?: string;
  creator_user_open_id: string;
}

/** SKU dentro de um pedido de afiliado (Search Creator Affiliate Orders). */
export interface AffiliateOrderSku {
  id: string;
  campaign_id?: string;
  open_collaboration_id?: string;
  target_collaboration_id?: string;
  product_name: string;
  product_id: string;
  price?: Money;
  shop_name?: string;
  content_type?: "VIDEO" | "LIVE" | string;
}

/** Search Creator Affiliate Orders — /affiliate_creator/202410/orders/search */
export interface AffiliateOrder {
  id: string;
  create_time: number;
  delivery_time?: number;
  status: "UNPAID" | "SETTLED" | "PENDING" | string;
  skus: AffiliateOrderSku[];
}

export interface Paginated<T> {
  items: T[];
  next_page_token?: string;
  total_count?: number;
}

/** Get Video Performances — /analytics/202403/videos/performances (creator scope). */
export interface VideoPerformance {
  video_id: string;
  title?: string;
  gmv?: Money;
  orders?: number;
  views?: number;
  clicks?: number;
  commission?: Money;
}
