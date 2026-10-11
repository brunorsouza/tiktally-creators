// AUTO-GERADO por gen_impl.py — NAO editar a mao.
// Types request/response de todos os endpoints da Affiliate Creator API.

// =============== Perfil & Vitrine ===============
/** Get Creator Profile - GET /affiliate_creator/202508/profiles */
export interface GetCreatorProfileData {
  /** Data associated with the TikTok creator's profile avatar. */
  avatar?: {
    /** The avatar image width in pixels. */
    width?: number;
    /** The avatar image height in pixels. */
    height?: number;
    /** The URL for the TikTok creator's avatar image file. */
    url?: string;
  };
  /** The TikTok user name. */
  username?: string;
  /** The regions in which the creator is eligible to promote products in showcases, videos, and live streams. */
  selection_region?: string;
  /** The region in which the creator's TikTok account is registered. */
  register_region?: string;
  /**
   * If the creator is also also has a TikTok Shop seller account, the seller type of the creator. This is an enumerated type with values:
   * - CROSS_BORDER
   * - LOCAL
   */
  seller_type?: string;
  /**
   * A list of product promotion permissions for the creator. The list can include zero or more of the following permissions:
   * - LIVE_STREAM_PERMISSION
   * - SELF_SALE_PERMISSION
   * - ADD_AFFILIATE_PERMISSION
   * - PHOTO_SHOPPABLE_PERMISSION_PRODUCT
   * - PHOTO_SHOPPABLE_PERMISSION_SHOP
   */
  permissions?: string[];
  /**
   * The creator's user type. This is an enumerated type with values:
   * - TIKTOK_SHOP_OFFICIAL_ACCOUNT
   * - TIKTOK_MARKETING_ACCOUNT
   * - TIKTOK_SHOP_CREATOR
   */
  user_type?: string;
  /** Creator Open ID. [More details](https://partner.tiktokshop.com/docv2/page/3obfokj6) */
  creator_user_open_id?: string;
}

/** Get Showcase Products - GET /affiliate_creator/202405/showcases/products */
export interface GetShowcaseProductsData {
  /** A list of products. */
  products?: {
    /** The product's product ID */
    id?: string;
    /** Data and metadata associated with the Seller's TikTok Shop. */
    shop?: {
      /** The TikTok Shop name. */
      name?: string;
    };
    /** An object including data about product images. */
    addition?: {
      /** A list of product images. */
      customized_main_images?: {
        /** The image width in pixels. */
        width?: number;
        /** The image height in pixels. */
        heigth?: number;
        /** The product's TikTok Shop image URL. */
        url?: string;
      }[];
    };
    /** An object including data about the product price. */
    price?: {
      /** The original price of the product. */
      original_price?: {
        /** The lowest original price for the product. */
        minimum_amount?: string;
        /** The highest original price for the product. */
        maximum_amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object including data about the product discount price. */
      seller_discount_price?: {
        /** The lowest discount price. */
        minimum_amount?: string;
        /** The highest discount price. */
        maximum_amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object including data about the product platform discount price. */
      platform_discount_price?: {
        /** The lowest product platform discount price. */
        minimum_amount?: string;
        /** The highest product platform discount price. */
        maximum_amount?: string;
        /** The currency code. */
        currency?: string;
      };
    };
    /** The product's display title. */
    title?: string;
    /** A list of product images. */
    main_images?: {
      /** The image width in pixels. */
      width?: number;
      /** The image height in pixels. */
      heigth?: number;
      /** The product's TikTok Shop image URL. */
      url?: string;
    }[];
    /** An object including product status information. */
    status?: {
      /**
       * The product inventory status. This an enumerated type with values:
       * - IN_STOCK
       * - SOLD_OUT
       */
      inventory_status?: string;
      /**
       * The product review status. This is an enumerated type with values:
       * - APPROVED
       * - CHANGES_UNDER_REVIEW
       * - UNAVAILABLE
       * - ZERO_COMMISSION
       */
      review_status?: string;
      /** Set to `false` if the product is visible in the showcase. Set to `true` if the product is hidden from the showcase. */
      is_hidden?: boolean;
      /**
       * The product showcase status. This is an enumerated type with values:
       * - NOT_ADDED
       * - ADDED
       * - REJECTED
       */
      added_status?: string;
    };
    /**
     * The product source. This is an enumerated type with values:
     * - THIRD_PARTY
     * - AFFILIATE
     * - TIKTOK_STORE
     */
    source?: string;
    /** The product detail page URL. */
    detail_link?: string;
    /** The off-TikTok Shop product detail page URL. */
    third_party_link?: string;
    /** A list of regions in which the product is offered for sale. */
    sale_regions?: string[];
    /** An object including data about commissions associated with the product. */
    commission?: {
      /** The commission rate in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. The range of this value is [100, 8000]. */
      rate?: number;
      /** The reward commission rate in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. */
      reward_rate?: number;
    };
    /** An object including data about open or target collaboration for the product. */
    collaboration?: {
      /** The open or target collaboration identifier. */
      id?: string;
      /**
       * The collaboration type. This an enumerated type with values:
       * 1 - Open Collaboration
       * 2 - Target Collaboration
       * 5 - Partner Campaign
       * 11 - Flat Fee
       * 12 - Collaboration Plus
       * 13 - Affiliate Promotion
       */
      type?: string;
      /** The partner information. */
      partner?: {
        /** The partner identifier. */
        id?: string;
        /** The partner name. */
        name?: string;
      };
    };
  }[];
  /** An opaque token used to retrieve the next page of a paginated result set. */
  next_page_token?: string;
  /** Total count of products in the response. */
  total_count?: number;
}

/** Add Showcase Products - POST /affiliate_creator/202405/showcases/products/add */
export interface AddShowcaseProductsData {
  /** A list of product showcase addition errors. */
  errors?: {
    /** The error code. */
    code?: number;
    /** A human-readable error message. */
    message?: string;
    /** Additional detail about the product showcase addition error. */
    detail?: {
      /** The product identifier. */
      product_id?: string;
    };
  }[];
}

export interface AddShowcaseProductsBody {
  /**
   * Specifies how products are added to the showcase. This an enumerated type with values:
   * - PRODUCT_ID
   * - PRODUCT_LINK
   */
  add_type: string;
  /** A list of product identifiers included if `add_type` is set to `PRODUCT_ID`. The products associated with the identifiers are added to the showcase. Maximum length of the list is 20 product identifiers. */
  product_ids?: string[];
  /** A list of product URLs included if `add_type` is set to `PRODUCT_LINK`. The products associated with the URLs are added to the showcase. Maximum length of the list is 20 product URLs. */
  product_link?: string;
}

/** Remove Showcase Products - DELETE /affiliate_creator/202409/showcases/products */
export interface RemoveShowcaseProductsData {
  /** The success or failure status code returned in API response. */
  code?: number;
  /** The success or failure messages are returned in API response. Reasons of failure will be described in the message. */
  message?: string;
  /** Every request generates a unique request_id for logging purposes. */
  request_id?: string;
}

export interface RemoveShowcaseProductsBody {
  /** The product IDs to remove from the creator's showcase. The maximum number of products to delete at once is 200. */
  product_ids: string[];
}

/** Top Showcase Products - POST /affiliate_creator/202409/showcases/products/top */
export interface TopShowcaseProductsData {
  /** The success or failure status code returned in API response. */
  code?: number;
  /** The success or failure messages are returned in API response. Reasons of failure will be described in the message. */
  message?: string;
  /** Every request generates a unique request_id for logging purposes. */
  request_id?: string;
}

export interface TopShowcaseProductsBody {
  /** The product IDs to move to the top in a creator's showcase. If multiple products are provided, they will display according to the order passed in this parameter. */
  product_ids: string[];
}

// =============== Ganhos & Rastreio ===============
/** Search Creator Affiliate Orders - POST /affiliate_creator/202410/orders/search */
export interface SearchCreatorAffiliateOrdersData {
  /** The order resource. */
  orders?: {
    /** The order identifier. */
    id?: string;
    /** Time and date of order created, UTC+0 timing */
    create_time?: number;
    /** Time and date order delivered, UTC+0 timing */
    delivery_time?: number;
    /**
     * The current status of the order. Possible options are:
     * - UNSPECIFIED: The status of the order is undefined. It might be updated later.
     * - AWAITING PAYMENT：The order hasn't been paid yet, only estimated commission is available
     * - To-SETTLE：The order is waiting for settlement, only estimated commission is available
     * - SETTLED: The commission of the order is already settled.
     * - REFUNDED: The order has been returned/refunded/canceled by the buyer, and no commission will be settled.
     * - FROZEN: Possible fraud has been detected regarding the order. The commission will be unfrozen after the fraud is resolved.
     */
    status?: string;
    /** A list of SKUs associated with the order. */
    skus?: {
      /** The SKU identifier. */
      id?: string;
      /** The campaign identifier associated with the order. */
      campaign_id?: string;
      /** The open collaboration identifier associated with the order. */
      open_collaboration_id?: string;
      /** The target collaboration identifier associated with the order. */
      target_collaboration_id?: string;
      /** The product name in the TikTok Shop. */
      product_name?: string;
      /** The product identifier. */
      product_id?: string;
      /** An object representing the localized price of the product. */
      price?: {
        /** The value of the price associated with the product. */
        amount?: string;
        /** The currency code of the price associated with the product. */
        currency?: string;
      };
      /** The name of the TIkTok Shop in which the product is offered for sale. */
      shop_name?: string;
      /**
       * The content format of the creator content through which the order was created.
       * Possible values:
       * - SHOP
       * - VIDEO
       * - LIVE
       * - PRE_LIVE
       * - PROMOTION_PAGE
       * - LINKSHARE
       */
      content_type?: string;
      /** The content identifier for the creator content through which the order was created. */
      content_id?: string;
      /** The total number of SKUs per order, calculated by aggregating the number of ordered product SKUs associated with the order. */
      quantity?: number;
      /** The total commission rate of this SKU, equal to the sum of standard commission rate + shop ads commission rate + bonus rate + reward rate. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      commission_rate?: number;
      /** Between Seller & Creator percentagecommission. When tiering commission model applied, will return each tier's commission rate seller set. */
      commission_tier_setting?: string;
      /**
       * Determine order commission be calculated based on fixed commission model or tiering
       * model
       */
      commission_model?: string;
      /** The commission bonus rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      commission_bonus_rate?: number;
      /** An object representing the estimated base commission at the time of order creation. */
      estimated_commission_base?: {
        /** The estimated commission base amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** The standard affiliate commission rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      standard_commission_rate?: number;
      /** The commission rate received by a creator for a sale associated with a specific piece of content. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      shop_ads_commission_rate?: number;
      /** An object representing the estimated bonus commission, calculated by multiplying the estimated commission base by the commission bonus rate. */
      estimated_bonus_commission?: {
        /** The estimated bonus commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the estimated shop ads commission, calculated by multiplying the estimated commission base by the standard_commission_rate */
      estimated_standard_commission?: {
        /** The estimated standard commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the estimated shop ads commission, calculated by multiplying the estimated commission base by the shop_ads_commission_rate */
      estimated_shop_ads_commission?: {
        /** The estimated shop ads commission rate. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** The estimated creator commission, calculated by multiplying the product sales price by the total number of products at the time of order creation. */
      estimated_commission?: {
        /** The estimated commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Represents the final earnings of this sku, calculated by multiplying the actual commission base by the total commission rate, and then deducting the taxes or revenue sharing with the agency amount. */
      actual_commission?: {
        /** The actual commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual bonus commission, calculated by multiplying the actual commission base by the commission bonus rate. */
      actual_bonus_commission?: {
        /** The actual bonus commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual commission base, calculated by multiplying the product sale price by the number of products sold, subtracting returned and refunded orders. */
      actual_commission_base?: {
        /** The value of the actual commission base. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual standard affiliate commission, calculated by multiplying the commission base by the standard_commission_rate. */
      actual_standard_commission?: {
        /** The actual standard commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual shop ads commission, calculated by multiplying the commission base by the shop_ads_commission_rate. */
      actual_shop_ads_commission?: {
        /** The actual shop ads commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** The total number of returned SKUs associated with the order. */
      returned_quantity?: number;
      /** The total number of refunded SKUs associated with the order. */
      refunded_quantity?: number;
      /** A field for storing user-defined metadata for tracking purposes. */
      tag?: string;
      /** The commission reward rate affiliate partners allocate to creators */
      creator_commission_reward_rate?: number;
      /** Estimated creator commission reward fee. */
      estimated_creator_commission_reward_fee?: {
        /** The estimated fee creators receive from affiliate partners through commission rewards */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Actual creator commission reward fee. */
      actual_creator_commission_reward_fee?: {
        /** The actual fee creators receive from affiliate partners through commission rewards */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Only for Mexico creator, platform collected related revenue taxes on behalf of government based on regulation. */
      isr?: {
        /** The actual isr amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Only for Mexico creator, platform collected related revenue taxes on behalf of government based on regulation. */
      iva?: {
        /** The actual iva amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Only for VN/TH/PH/ID creators, sellers collect related withholding taxes based on regulation. */
      pit?: {
        /** The actual pit amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** The parts of after-taxes creator revenue which need to be shared with CAP based on the fee agreement */
      shared_with_partner?: {
        /** The actual shared with partner amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Extra information for tracing purposes. */
      trace_info?: {
        /** When `trace.type==GENERAL`, the value is {eid} you provided in `sharing_link`; when `trace.type==SPECIFIC`, the value is the same as `publisher_id`. */
        id?: string;
        /** For the orders coming from the sharing links for specific publishers, the value is `SPECIFIC`; for the orders coming from the general sharing links, the value is `GENERAL`. */
        type?: string;
      };
      /** The time when the record was last updated. */
      last_update_time?: number;
    }[];
  }[];
  /** An opaque token used to retrieve the next page of a paginated result set. */
  next_page_token?: string;
  /** Total count of orders in the response. */
  total_count?: number;
}

export interface SearchCreatorAffiliateOrdersBody {
  /**
   * Filter orders to show only those that are created on or after the specified date and time. Unix timestamp.
   * Note:
   * `create_time_ge` and `create_time_lt` together constitute the creation time filter condition.
   * - If `create_time_ge` is filled but `create_time_lt` is empty, `create_time_lt` will default to the current time.
   * - If `create_time_lt` is filled but `create_time_ge` is empty, `create_time_ge` will default to the earliest shop time.
   */
  create_time_ge?: number;
  /**
   * Filter orders to show only those that are created before the specified date and time. Unix timestamp.
   * Refer to notes in `create_time_ge` for more usage information.
   */
  create_time_lt?: number;
}

/** Creator Search Affiliate Trace Orders - POST /affiliate_creator/202505/orders/trace/search */
export interface CreatorSearchAffiliateTraceOrdersData {
  /** The order resource. */
  orders?: {
    /** The order identifier. */
    id?: number;
    /**
     * The current status of the order. Possible options are:
     * - UNSPECIFIED: The status of the order is undefined. It might be updated later.
     * - ORDERED: The order has been placed, but the commission has not been settled. But an estimated commission is available.
     * - SETTLED: The commission of the order is already settled.
     * - REFUNDED: The order has been returned/refunded/canceled by the buyer, and no commission will be settled.
     * - FROZEN: Possible fraud has been detected regarding the order. The commission will be unfrozen after the fraud is resolved.
     * - DEDUCTED: Additional deduction from your balance account.
     */
    status?: string;
    /** A list of SKUs associated with the order. */
    skus?: {
      /** The SKU identifier. */
      id?: string;
      /** The product identifier. */
      product_id?: string;
      /** An object representing the localized price of the product. */
      price?: {
        /** The value of the price associated with the product. */
        amount?: string;
        /** The currency code of the price associated with the product. */
        currency?: string;
      };
      /** The total number of SKUs per order, calculated by aggregating the number of ordered product SKUs associated with the order. */
      quantity?: number;
      /** The commission rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      commission_rate?: number;
      /** An object representing the estimated base commission at the time of order creation. */
      estimated_commission_base?: {
        /** The estimated commission base amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual base commission, calculated by multiplying the actual commission base by the commission rate. */
      actual_commission?: {
        /** The actual commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** The commission rate received by a creator for a sale associated with a specific piece of content. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      shop_ads_commission_rate?: number;
      /** The commission bonus rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. */
      commission_bonus_rate?: number;
      /** The product name in the TikTok Shop. */
      product_name?: string;
      /** The name of the TIkTok Shop in which the product is offered for sale. */
      shop_name?: string;
      /** The total number of returned SKUs associated with the order. */
      returned_quantity?: number;
      /** The total number of refunded SKUs associated with the order. */
      refunded_quantity?: number;
      /** The campaign identifier associated with the order. */
      campaign_id?: string;
      /** An object representing the actual commission base, calculated by multiplying the product sale price by the number of products sold, subtracting returned and refunded orders. */
      actual_commission_base?: {
        /** The value of the actual commission base. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual shop ads commission, calculated by multiplying the commission base by the shop_ads_commission_rate. */
      actual_shop_ads_commission?: {
        /** The actual shop ads commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the estimated shop ads commission, calculated by multiplying the estimated commission base by the shop_ads_commission_rate */
      estimated_shop_ads_commission?: {
        /** The estimated shop ads commission rate. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the estimated bonus commission, calculated by multiplying the estimated commission base by the commission bonus rate. */
      estimated_bonus_commission?: {
        /** The estimated bonus commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Time and date order delivered, UTC+0 timing */
      delivery_time?: number;
      /** The commission reward rate affiliate partners allocate to creators */
      creator_commission_reward_rate?: number;
      /** Estimated creator commission reward fee. */
      estimated_creator_commission_reward_fee?: {
        /** The estimated fee creators receive from affiliate partners through commission rewards */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** Actual creator commission reward fee. */
      actual_creator_commission_reward_fee?: {
        /** The actual fee creators receive from affiliate partners through commission rewards */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /**
       * The content format of the creator content through which the order was created.
       * Possible values:
       * - SHOP
       * - VIDEO
       * - LIVE
       * - PRE_LIVE
       * - PROMOTION_PAGE
       * - LINKSHARE
       */
      content_type?: string;
      /** The content identifier for the creator content through which the order was created. */
      content_id?: string;
      /** Extra information for tracing purposes. */
      trace?: {
        /** When `trace.type==GENERAL`, the value is {eid} you provided in `sharing_link`; when `trace.type==SPECIFIC`, the value is the same as `publisher_id`. */
        id?: string;
        /** For the orders coming from the sharing links for specific publishers, the value is `SPECIFIC`; for the orders coming from the general sharing links, the value is `GENERAL`. */
        type?: string;
      };
      /** The estimated creator commission, calculated by multiplying the product sales price by the total number of products at the time of order creation. */
      estimated_commission?: {
        /** The estimated commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
      /** An object representing the actual bonus commission, calculated by multiplying the actual commission base by the commission bonus rate. */
      actual_bonus_commission?: {
        /** The actual bonus commission amount. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
    }[];
    /** Time and date of order created, UTC+0 timing */
    create_time?: number;
    /** Time and date order delivered, UTC+0 timing */
    delivery_time?: number;
  }[];
  /** An opaque token used to retrieve the next page of a paginated result set. */
  next_page_token?: string;
  /** Total count of orders in the response. */
  total_count?: number;
}

export interface CreatorSearchAffiliateTraceOrdersBody {
  /**
   * Filter orders to include only those with the specified `time_type` timestamp greater than or equal to time_ge and less than time_lt. Unix timestamp.
   * Note:
   * `time_ge` and `time_lt` together constitute the creation time filter condition.
   */
  time_ge: number;
  /** Filter orders to include only those with the specified `time_type` timestamp greater than or equal to time_ge and less than time_lt.Unix timestamp. */
  time_lt: number;
  /**
   * Specifies the type of timestamp to filter the orders by. The query time range (time_ge and time_lt) will be applied to the selected time type.
   * Possible values:
   * - PAY_TIME: Filter based on the order payment time.
   * - DELIVERY_TIME: Filter based on the order delivery/shipment time.
   * - SETTLE_TIME: Filter based on the order settlement time.
   * - CREATE_TIME (default): Filter based on the order creation time.
   */
  time_type?: string;
}

// =============== Descoberta & Colaboracoes ===============
/** Creator Search Open Collaboration Product - POST /affiliate_creator/202405/open_collaborations/products/search */
export interface CreatorSearchOpenCollaborationProductData {
  /** A list of products. */
  products?: {
    /** Data and metadata associated with the Seller's TikTok Shop. */
    shop?: {
      /** The TikTok Shop name. */
      name?: string;
    };
    /** The product identifier. */
    id?: string;
    /** Set to `true` if there are more than zero units of the product in inventory. Set to `false` if there are zero units in inventory. */
    has_inventory?: boolean;
    /** Total number of units sold. Units are indexed to SKU. Note that if the creator has not given permission for precise data sharing, this property will not be present. */
    units_sold?: number;
    /** The product name. */
    title?: string;
    /** The region where the product is offered for sale. */
    sale_region?: string;
    /** The product image URL. */
    main_image_url?: string;
    /** The URL for the product's detail page. */
    detail_link?: string;
    /** The original price of the product. */
    original_price?: {
      /** The currency code. */
      currency?: string;
      /** The lowest original price of all SKUs of the product. */
      minimum_amount?: string;
      /** The highest original price of all SKUs of the product. */
      maximum_amount?: string;
    };
    /** A list of categories associated with the product. Maximum length of the list is `3` categories. */
    category_chains?: {
      /** The category identifier. */
      id?: string;
      /** The name of the product in the category. */
      local_name?: string;
      /** Set to `true` if this category is a leaf node. Set to `false` if not. */
      is_leaf?: boolean;
      /** The category identifier of the parent category. */
      parent_id?: string;
    }[];
    /** Metadata and data associated with the commission rates for the product. */
    commission?: {
      /** The commission rate in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. This value must a minimum of `1000`.  The range of this value is [100, 8000]. */
      rate?: number;
      /** The currency code. */
      currency?: string;
      /** The commission amount. */
      amount?: string;
    };
    /** Metadata and data associated with the sale price of the product */
    sales_price?: {
      /** The currency code. */
      currency?: string;
      /** The lowest promotion price of all SKUs of this product. */
      minimum_amount?: string;
      /** The highest promotion price of all SKUs of this product. */
      maximum_amount?: string;
    };
  }[];
  /** An opaque token used to retrieve the next page of a paginated result set. */
  next_page_token?: string;
  /** Total count of products meeting the search criteria expressed in the request body. */
  total_count?: number;
}

export interface CreatorSearchOpenCollaborationProductBody {
  /** A list of product keywords for searching. Product titles, or names, are loosely matched. Keywords in the list form a query and the resulting set of matching product names is based on the conjunctive operator `AND` between each keyword. For example, the keyword list `["Men", "Fashion"]` creates a query `"Men" AND "Fashion"` and the resulting set of matching product names contains the loosely matched conjuction of "Men" and "Fashion" such as "Male Fashionable". Maximum length of the list is 20 keywords. Maximum keyword string length is 255 characters. */
  title_keywords?: string[];
  /** Restricts the products in the search results to those with prices greater than or equal to the expressed minimum price and less than the expressed maximum price. */
  sales_price_range?: {
    /** The product price must be greater than this value in order to be included in the search results. The value must be greater than `0`. */
    amount_ge?: string;
    /** The product price must be greater than this value in order to be included in the search results. The value must be greater than `0`. No upper bound is set if this property is not included. */
    amount_lt?: string;
  };
  /** Restricts the products in the search results to those that are associated with the expressed product category. */
  category?: {
    /** The category identifier. Note that only first-level categories are supported. */
    id?: string;
  };
  /** The commission rate of the searched product needs to be limited within this range. */
  commission_rate_range?: {
    /** The commission rate must be greater than this value in order to be included in the search results. The commission rate is expressed in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. This value must a minimum of `1000`. */
    rate_ge?: number;
    /** The commission rate must be less than this value in order to be included in the search results. The commission rate is expressed in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. This value must a minimum of `1000`. */
    rate_lt?: number;
  };
}

/** Get Open Collaboration Product List By Product Ids - POST /affiliate_creator/202509/open_collaborations/products */
export interface GetOpenCollaborationProductListByProductIdsData {
  /** These are the searched products. */
  products?: {
    /** The product's shop information. */
    shop?: {
      /** The name of the shop to which the product belongs. */
      name?: string;
    };
    /** Product's unique id. */
    id?: string;
    /** Whether this product has inventory. */
    has_inventory?: boolean;
    /** The total sales of this product. */
    units_sold?: number;
    /** Product's name. */
    title?: string;
    /** The region represents the areas where the product can be sold. */
    sale_region?: string;
    /** The product image url. */
    main_image_url?: string;
    /** Product's detail link which is used to get product details on mobile clients. */
    detail_link?: string;
    /** The product's original price */
    original_price?: {
      /** The currency in the sale region. */
      currency?: string;
      /** The minimum original price of all skus of this product. */
      minimum_amount?: string;
      /** The maximum original price of all skus of this product. */
      maximum_amount?: string;
    };
    /**
     * The categories of this product.
     * Return to the top three categories at most
     */
    category_chains?: {
      /** The current category id of this product. */
      id?: string;
      /** The current level category name of this product. */
      local_name?: string;
      /** Indicate whether current node is leaf node */
      is_leaf?: boolean;
      /** The category id of its parent category */
      parent_id?: string;
    }[];
    /** The commission of this product. */
    commission?: {
      /**
       * - The commission rate for this product is set by merchants for creators public promotion.
       * - The range of this value is [100, 8000].
       * - This value equals actual commission rate multi 10000. For example: 3000 means the actual commission rate is 30.00%, and 3555 means 35.55%
       */
      rate?: number;
      /** Currency symbol */
      currency?: string;
      /**
       * The commission for this product is calculated by multiplying the promotional price with the commission rate for each promotional order.
       * The currency symbol is same as the currency symbol in price
       */
      amount?: string;
    };
    /** Sales price information of the product */
    sales_price?: {
      /** Currency symbol for sales area */
      currency?: string;
      /** The  minimum promotion price of all skus of this product. */
      minimum_amount?: string;
      /** The maximum promotion price of all skus of this product. */
      maximum_amount?: string;
    };
    /**
     * The ads commission rate applies only to orders generated from ads. If a creator’s video is used as an ad without this rate being set, the resulting orders will instead earn either:
     * - The Shop Ads commission you configured in open collaboration, or
     * - The standard commission defined in this invitation.
     */
    shop_ads_commission?: {
      /**
       * - The commission rate for this product is set by merchants for creators public promotion.
       * - The range of this value is [100, 8000].
       * - This value equals actual commission rate multi 10000. For example: 3000 means the actual commission rate is 30.00%, and 3555 means 35.55%
       */
      rate?: number;
    };
  }[];
}

/** Search Creator Target Collaborations - POST /affiliate_creator/202405/target_collaborations/search */
export interface SearchCreatorTargetCollaborationsData {
  /** The total number of target collaboration groups in the response. */
  total_count?: number;
  /** An opaque token used to retrieve the next page of a paginated result set. */
  next_page_token?: string;
  /** A list of target collaboration objects. */
  target_collaborations?: {
    /** The target collaboration identifier. */
    id?: string;
    /** The target collaboration name. */
    name?: string;
    /**
     * The target collaboration state. This is an enumerated type with values:
     * - LIVE
     * - EXPIRED
     * - DELETED
     * - ENDED
     */
    status?: string;
    /** A list of products associated with the target collaboration. */
    products?: {
      /** The product identifier. */
      id?: string;
      /** The product name. */
      title?: string;
      /** The product image URL in the TikTok Shop. */
      main_image_url?: string;
      /** Metadata and data associated with the target collaboration. */
      commission?: {
        /** The commission rate for the target collaboration in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. */
        rate?: number;
        /** The total amount paid in commission paid for this this product. */
        amount?: string;
        /** The currency code. */
        currency?: string;
      };
    }[];
  }[];
}

export interface SearchCreatorTargetCollaborationsBody {
  /** The TikTok Shop identifier. */
  shop_id: string;
  /**
   * Target collaborations in the response are restricted to the the expressed type. This is an enumerated wtype with values:
   * - TARGET_COLLABORATIONS_ID
   * - TARGET_COLLABORATIONS_NAME
   * 
   * `TARGET_COLLABORATIONS_ID` returns target collaborations with state set to `LIVE`, `EXPIRED`, `DELETED`, and `ENDED`.
   * 
   * `TARGET_COLLABORATIONS_NAME` returns target collaborations with state set to `LIVE` only.
   */
  keyword_type?: string;
  /** Target collaborations in the response are restricted to the expressed name. */
  keyword?: string;
}

// =============== Amostras ===============
/** Get Creator Applicable Sample Label - GET /affiliate_creator/202412/samples/labels */
export interface GetCreatorApplicableSampleLabelData {
  /** Creator applicable sample label information. */
  label?: {
    /** Creator can apply this application or not. */
    can_apply?: boolean;
    /**
     * Status to describe if the creator has already applied this product as a free sample.
     * - TO_APPLY: creator has not applied this product as a free sample.
     * - ONGOING: creator applied this product as a free sample while he/she has not finished sample fulfillment.
     * - COMPLETE: creator applied this product as a free sample and finished sample fulfillment.
     */
    status?: string;
    /** Sample Application ID. only appear when the creator has already applied this product. */
    application_id?: string;
    /** If the creator has reached the sample application upper limit. */
    reach_limit?: boolean;
    /** The sample product information. */
    sample_product?: {
      /** The sample product SKU information. */
      sample_sku_list?: {
        /** The SKU identifier. */
        id?: string;
        /** The combination of SKU properties for this SKU. */
        sale_property_value_ids?: string;
        /** SKU price information. */
        price?: {
          /** The price amount. */
          amount?: string;
          /** The price currency code. */
          currency?: string;
        };
        /** The SKU property information. */
        sale_properties?: {
          /** A SKU property identifier, short for "Stock Keeping Unit Property ID", is a specific identification code assigned to a particular property or characteristic of a SKU.(i.e: "100000" means "color") */
          id?: string;
          /** The SKU property name. */
          name?: string;
          /**
           * The SKU property value identifier is an identification code related to the specific values of the properties of a Stock Keeping Unit (SKU).
           * When a SKU has certain properties like color, size, etc., each possible value for those properties has its own unique SKU property value identifier. For instance, if the property is "color" and the possible values are "red", "blue", "green", then "red" would have its own SKU property vvalue identifier, "blue" would have another one, and so on.
           */
          value_id?: string;
          /** The SKU property value name. */
          value_name?: string;
        }[];
        /** If this SKU is available. */
        is_available?: boolean;
        /**
         * The reason why the SKU is unavailable:
         * - IS_PREORDER : this product is a preorder product which does not support free sample
         * - IS_GIFT: this product is a gift product which does not support free sample
         * - OUT_OF_STOCK: product sold out
         * - EXCEED_CB_PRICE_THRESHOLD:
         * - ALREADY_APPLYED: creator has already applied this SKU.
         */
        unavailable_reason?: string;
      }[];
    };
  };
}

/** Search Creator Sample Applications - POST /affiliate_creator/202412/sample_applications/search */
export interface SearchCreatorSampleApplicationsData {
  /** Page token to query next page orders, last page is empty string. */
  next_page_token?: string;
  /** The sample application information. */
  sample_applications?: {
    /** The unique id of sample application. */
    id?: string;
    /** The sample product information. */
    sample_product?: {
      /** The product identifier. */
      id?: string;
      /** The SKU identifier. */
      sku_id?: string;
      /** The SKU property value name. */
      sku_sale_property_value_names?: string[];
    };
    /** The sample order is generated after the sample application is approved by seller. */
    main_order_id?: string;
    /** The sample activity identifier id(only for sample activity). */
    activity_id?: string;
    /**
     * The status of sample applications.
     * The possible enumerated values are:
     * - PENDING: The sample application is waiting for the seller's review.
     * - AWAITING_SHIPMENT: The application is approved, and the seller needs to ship the sample.
     * - SHIPPED: The sample has been shipped by the seller and is waiting for the creator to receive the package.
     * - REJECT_CANCELLED: The sample application has been rejected by the seller.
     * - OVERDUE_CANCELLED: The sample application has expired due to being overdue.
     * - UNFULFILL_CANCELLED: The creator did not fulfill the commitment to create content within the agreed timeframe.
     * - FULFILLMENT_SUSPEND: the application fulfillment was paused due to the product status being unpromotable.
     * - DEL_OPEN_COLLAB: Open collaboration has been deleted.
     * - SELLER_NOT_SHIP_CANCELLED: The seller did not ship the sample within the required timeframe.
     * - WITHDRAW_CANCELLED: The creator withdrew the sample application before the seller approved it.
     * - UNFULFILLABLE_CANCELLED: The application was cancelled due to reasons beyond the creator's control, making it impossible to create content.
     * - OPS_CANCELLED: The application was manually cancelled by operations staff.
     * - OPS_FAILED: The application was marked as failed by operations staff.
     * - OPS_ COMPLETED: The application was manually marked as completed by operations staff.
     * - COMPLETED: The application is complete, and the creator has posted the content.
     * - TO_BE_POST: the creator has not posted videos/lives for this sample
     * - POST_IN_REVIEW: the creator has posted videos/lives which have not satisfied fulfillment rules.
     * - POST_FAILED: the creator has posted videos/lives and deleted them before completing sample fulfillment.
     * - CANCELED: this application(order) has been canceled.
     * This field allows tracking the status of a sample application throughout its lifecycle, providing visibility into each stage of the process for sellers and creators.
     */
    status?: string;
    /** Fulfillment info for this sample application. */
    creator_fulfillment?: {
      /** Fulfillment ID. */
      id?: string;
      /** Fulfillment deadline timestamp, in seconds. */
      expiration_time?: number;
      /** Total suspension duration for fulfillment, in seconds. */
      total_suspend_duration?: number;
      /**
       * Fulfillment status, It indicates the current status of the fulfillment process. The possible values are:
       * - PENDING: The creator is yet to fulfill the content creation obligation.
       * - ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.
       * - SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.
       * - FAILED: Fulfillment failed; the content did not meet the required standards.
       * - OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.
       * - SUSPEND: Fulfillment has been suspended.
       * - CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.
       * - EXEMPTED: The creator has been exempted from the fulfillment obligation.
       */
      status?: string;
      /**
       * Represents the marketing status of a product associated with a fulfillment order. It indicates whether the product is available for marketing and fulfillment. The possible values are:
       * - UNKNOWN: The marketing status of the product is unknown.
       * - LIVE: The product is available and can be used for fulfillment.
       * - OUT_OF_STOCK: The product is out of stock and cannot be fulfilled.
       * - SELLER_DEACTIVATE: The product has been deactivated by the seller.
       * - PLATFORM_DEACTIVATE: The product has been deactivated by the platform.
       * - NO_PLAN: There is no valid plan available for the creator to market the product.
       * - PERMANENT_DELETED: The product has been permanently deleted and is no longer available.
       * This field helps sellers and creators understand the current status of products associated with fulfillment orders, ensuring that all parties are aware of the availability and marketing status of the products involved in sample applications and collaborations.
       */
      bound_product_status?: string;
    };
  }[];
}

export interface SearchCreatorSampleApplicationsBody {
  /**
   * The status of sample applications.
   * The possible enumerated values are:
   * - PENDING: The sample application is waiting for the seller's review.
   * - AWAITING_SHIPMENT: The application is approved, and the seller needs to ship the sample.
   * - SHIPPED: The sample has been shipped by the seller and is waiting for the creator to receive the package.
   * - CONTENT_PENDING: The creator has received the sample package and is expected to create content.
   * - REJECT_CANCELLED: The sample application has been rejected by the seller.
   * - OVERDUE_CANCELLED: The sample application has expired due to being overdue.
   * - UNFULFILL_CANCELLED: The creator did not fulfill the commitment to create content within the agreed timeframe.
   * - DEL_OPEN_COLLAB: Open collaboration has been deleted.
   * - SELLER_NOT_SHIP_CANCELLED: The seller did not ship the sample within the required timeframe.
   * - WITHDRAW_CANCELLED: The creator withdrew the sample application before the seller approved it.
   * - UNFULFILLABLE_CANCELLED: The application was cancelled due to reasons beyond the creator's control, making it impossible to create content.
   * - OPS_CANCELLED: The application was manually cancelled by operations staff.
   * - OPS_FAILED: The application was marked as failed by operations staff.
   * - OPS_ COMPLETED: The application was manually marked as completed by operations staff.
   * - COMPLETED: The application is complete, and the creator has posted the content.
   * This field allows for tracking the status of a sample application throughout its lifecycle, providing visibility into each stage of the process for sellers and creators.
   */
  application_statuses?: string[];
}

/** Get Creator Sample Application Detail - POST /affiliate_creator/202412/sample_applications/single_query */
export interface GetCreatorSampleApplicationDetailData {
  /** The sample application information. */
  sample_application?: {
    /** Sample application identifier. */
    id?: string;
    /** Sample application create time in seconds. */
    create_time?: number;
    /** The sample product information. */
    sample_product?: {
      /** The product identifier. */
      id?: string;
      /** The SKU identifier. */
      sku_id?: string;
      /** Sku property name list for this sku id. */
      sku_sale_property_value_names?: string[];
    };
    /** The sample order is generated after the sample application is approved by seller. */
    main_order_id?: string;
    /** The sample activity identifier id( only for sample campaign). */
    activity_id?: string;
    /**
     * The type of creator sample application.
     * - FREE_SAMPLE : free sample supplied by seller which creator can apply by themselves from pdp page.
     * - SAMPLE_COUPON: creator claimed sample coupon (a type of coupon) and used it to purchase orders at a discount price.
     * - SAMPLE_CAMPAIGN: activity organized by the platform. Creators can participate in this activity to obtain sample products provided by the platform for free.
     */
    type?: string;
    /**
     * The status of sample applications.
     * The possible enumerated values are:
     * - PENDING: The sample application is waiting for the seller's review.
     * - AWAITING_SHIPMENT: The application is approved, and the seller needs to ship the sample.
     * - SHIPPED: The sample has been shipped by the seller and is waiting for the creator to receive the package.
     * - CONTENT_PENDING: The creator has received the sample package and is expected to create content.
     * - REJECT_CANCELLED: The sample application has been rejected by the seller.
     * - OVERDUE_CANCELLED: The sample application has expired due to being overdue.
     * - UNFULFILL_CANCELLED: The creator did not fulfill the commitment to create content within the agreed timeframe.
     * - SELLER_NOT_SHIP_CANCELLED: The seller did not ship the sample within the required timeframe.
     * - WITHDRAW_CANCELLED: The creator withdrew the sample application before the seller approved it.
     * - UNFULFILLABLE_CANCELLED: The application was cancelled due to reasons beyond the creator's control, making it impossible to create content.
     * - OPS_CANCELLED: The application was manually cancelled by operations staff.
     * - OPS_FAILED: The application was marked as failed by operations staff.
     * - OPS_ COMPLETED: The application was manually marked as completed by operations staff.
     * - COMPLETED: The application is complete, and the creator has posted the content.
     * This field allows for tracking the status of a sample application throughout its lifecycle, providing visibility into each stage of the process for sellers and creators.
     */
    status?: string;
    /** Fulfillment info for this sample application. */
    creator_fulfillment?: {
      /** Fulfillment identifier. */
      id?: string;
      /** Fulfillment deadline timestamp, in seconds. */
      expiration_time?: number;
      /** Total suspension duration for fulfillment, in seconds. */
      total_suspend_duration?: number;
      /**
       * Fulfillment status, It indicates the current status of the fulfillment process. The possible values are:
       * - PENDING: The creator is yet to fulfill the content creation obligation.
       * - ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.
       * - SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.
       * - FAILED: Fulfillment failed; the content did not meet the required standards.
       * - OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.
       * - SUSPEND: Fulfillment has been suspended.
       * - CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.
       * - EXEMPTED: The creator has been exempted from the fulfillment obligation.
       */
      status?: string;
    };
  };
}

export interface GetCreatorSampleApplicationDetailBody {
  /** The product identifier. */
  product_id: string;
  /** Free sample application ID, required when application type is "FREE_SAMPLE". */
  application_id?: string;
  /**
   * The type of creator sample application.
   * - FREE_SAMPLE : free sample supplied by seller which creator can apply for by themselves from product detail page.
   * - SAMPLE_COUPON: creator claimed sample coupon (a type of coupon) and used it to place orders at a discount price.
   * - SAMPLE_CAMPAIGN: activity organized by the platform. Creators can participate in this activity to obtain sample products provided by the platform for free.
   */
  application_type: string;
  /** The real main order identifier, required when application  is "SAMPLE_COUPON"  or "SAMPLE_CAMPAIGN" or "REFUNDABLE_SAMPLE". */
  main_order_id?: string;
}

/** Creator Search Sample Application Fulfillments - POST /affiliate_creator/202409/sample_applications/fulfillments/search */
export interface CreatorSearchSampleApplicationFulfillmentsData {
  /** Creator fulfillment contents. */
  fulfillments?: {
    /** The fulfillment identifier. */
    id?: string;
    /** The TikTok Shop identifier. */
    shop_id?: string;
    /** The sample application identifier. */
    application_id?: string;
    /**
     * The type of the sample application. This is an enumerated type with values:
     * - FREE_SAMPLE
     * - SAMPLE_COUPON
     * - SAMPLE_CAMPAIGN
     * - PLATFORM_FREE_SAMPLE
     */
    sample_application_type?: string;
    /** The product identifier. */
    product_id?: string;
    /**
     * Fulfillment deadline timestamp.
     * Usually the value is  `{you_receiving_sample_time} + 14Days`. But if you apply for fulfillment suspension, the value is `{you_receiving_sample_time} + 14Days + total_suspend_duration`.
     */
    expiration_time?: number;
    /** The duration you applied for fulfillment suspension in seconds. */
    total_suspend_duration?: number;
    /**
     * The fulfillment status.This is an enumerated type with values:
     * - PENDING: The creator has not yet fulfilled the content creation obligation.
     * - ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.
     * - SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.
     * - FAILED: Fulfillment failed; the content did not meet the required standards.
     * - OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.SUSPEND: Fulfillment has been suspended.
     * - CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.
     * - EXEMPTED: The creator is exempt from the fulfillment obligation.
     */
    status?: string;
    /**
     * The marketing status of the product associated with the fulfillment order. This is an enumerated type with values:
     * - UNKNOWN: The marketing status of the product is unknown.
     * - LIVE: The product is available for fulfillment.
     * - OUT_OF_STOCK: The product is out of stock and cannot be fulfilled.
     * - SELLER_DEACTIVATE: The product has been deactivated by the seller.
     * - PLATFORM_DEACTIVATE: The product has been deactivated by the platform.
     * - NO_PLAN: There is no valid plan available for the creator to market the product.
     * - PERMANENT_DELETED: The product has been permanently deleted and is no longer available.
     */
    bound_product_status?: string;
  }[];
}

export interface CreatorSearchSampleApplicationFulfillmentsBody {
  /**
   * A list of fulfillment statuses. The response is filtered to include sample fulfillments with the fulfillment_status field set to one of the specified values.  The possible values are:
   * - PENDING: The creator has not yet fulfilled the content creation obligation.
   * - ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.
   * - SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.
   * - FAILED: Fulfillment failed; the content did not meet the required standards.
   * - OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.
   * - SUSPEND: Fulfillment has been suspended.
   * - CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.
   * - EXEMPTED: The creator is exempt from the fulfillment obligation.
   */
  fulfillment_statuses: string[];
}

// =============== Links de afiliado ===============
/** Creator Generate General Link - POST /affiliate_creator/202505/affiliate_sharing_links/general_publishers/generate_batch */
export interface CreatorGenerateGeneralLinkData {
  /** The successfully generated sharing links. */
  sharing_links?: {
    /** Material ID. */
    material_id?: string;
    /**
     * This is the product promotion link that agencies can share with collaborated creators. Creators can copy/paste this link into the web browser.
     * After you have the links, add the following request parameters and their corresponding values to the end of the link URL. When a user places an order using this link, the resulting e-commerce order will carry these parameters as part of its information:
     * - event_id: Unique event id for each click
     * - publisher_id: The unique publish_id assigned by CJ
     * Nice to have
     * - publisher_name: From CJ publisher profile.
     * - device_type: 1-mobile, 2-desktop.
     * - device_id: The clicks from the same device id can be aggregated as UV.
     * - referrer_src: The URL of the webpage that a user came from before landing on the current share link.
     */
    sharing_link?: string;
    /**
     * A product promotion deep link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).
     * To enable attribution, append the following query parameteReplace the `o_event_id` value in the `deeplink` URL with a developer-generated unique ID (one per click). Do not perform any URL encoding or decoding on the link. If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking.
     */
    deep_link?: string;
    /**
     * A product promotion one-link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).
     * To enable attribution, append the following query parameteReplace the `o_event_id` value in the `deeplink` URL with a developer-generated unique ID (one per click). Do not perform any URL encoding or decoding on the link. If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking.
     * If the user does not have TikTok installed on their phone, they will be redirected to the app store to install TikTok.
     */
    one_link?: string;
  }[];
  /** The list of materials which failed to generate sharing links for. */
  failed_materials?: {
    /** Material ID. */
    material_id?: string;
    /** Fail reason. */
    fail_reason?: string;
  }[];
}

export interface CreatorGenerateGeneralLinkBody {
  /** The entities for which the sharing links are generated. */
  material: {
    /** The list of material IDs. The max length is 50. */
    ids: string[];
    /**
     * Right now, the only possible value is `PRODUCT`.
     * When `material_ids==PRODUCT`, use pids for material IDs.
     */
    type: string;
    /** When type is set to CAMPAIGN, this field is required. This schema is associated with the Campaign page. */
    promotion_campaign_schema?: string;
  };
  /** If a creator adds products from a campaign, please include the campaign ID. The campaign ID can be found in the Affiliate Center or retrieved using the Get Affiliate Partner Campaign List API. */
  campaign_id?: string;
  /**
   * Default value is empty.
   * - For Tokopedia agencies, you may pass `TOKO` to return the Tokopedia product URL.
   * Otherwise, the TikTok Shop product URL will be returned.
   */
  link_type?: string;
}

/** Creator Generate Publisher Link - POST /affiliate_creator/202504/affiliate_sharing_links/publisher/{publisher_id}/generate_batch */
export interface CreatorGeneratePublisherLinkData {
  /** Generated affiliate links for each publisher */
  sharing_links?: {
    /** Material ID. */
    material_id?: number;
    /** This is the product promotion link that agencies can share with collaborated publishers. The publishers can post this link at their will. */
    sharing_link?: string;
    /**
     * A product promotion deep link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).
     * If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking.
     */
    deep_link?: string;
    /**
     * A product promotion one-link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).
     * If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking.
     * If the user does not have TikTok installed on their phone, they will be redirected to the app store to install TikTok.
     */
    one_link?: string;
  }[];
  /** The list of materials which failed to generate sharing links for. */
  failed_materials?: {
    /** Material ID. */
    material_id?: string;
    /** Fail reason. */
    fail_reason?: string;
  }[];
}

export interface CreatorGeneratePublisherLinkBody {
  /** The entities for which the sharing links are generated. */
  material: {
    /** The list of material IDs. The max length is 50. */
    ids: string[];
    /**
     * Right now, the only possible value is `PRODUCT` or `CAMPAIGN`.
     * When `material_ids==PRODUCT`, use pids for material IDs.
     */
    type: string;
    /** When `type` is set to `CAMPAIGN`, this field is required. This schema is associated with the Campaign page. */
    promotion_campaign_schema?: string;
  };
  /** If a creator adds products from a campaign, please include the campaign ID. The campaign ID can be found in the Affiliate Center or retrieved using the Get Affiliate Partner Campaign List API. */
  campaign_id?: string;
  /**
   * Default value is empty.
   * - For Tokopedia agencies, you may pass `TOKO` to return the Tokopedia product URL.
   * Otherwise, the TikTok Shop product URL will be returned.
   */
  link_type?: string;
}

// =============== Estudio de conteudo ===============
/** Get Shop Products - GET /affiliate_creator/202509/shop_products */
export interface GetShopProductsData {
  /** The searched product list. It will be empty when there are no search results. */
  products?: {
    /** TikTok product ID. */
    id?: string;
    /** Product name. */
    title?: string;
    /** Product price shown with two decimal places and currency. */
    price?: {
      /** Product price with two decimal places. */
      amount?: string;
      /** Product price currency, based on region where creators can sell. */
      currency?: string;
    };
    /**
     * Showcase add status with possible values:
     * - ADDABLE
     * - ADDED
     * - REJECTED
     */
    added_status?: string;
    /** The brand name a seller has set for a product. */
    brand_name?: string;
    /** Images of a product. */
    images?: {
      /** The URL of the product image. */
      url?: string;
      /** The width of the product image. */
      width?: number;
      /** The height of the product image. */
      height?: number;
    }[];
    /** The number of products that have been sold. */
    sales_count?: number;
  }[];
  /** The total number of products that meet the query conditions. */
  total_count?: number;
  /** The pagination token is a cursor used for pagination. The token is returned in the previous pagination query to determine the current position. It will be empty when there aren't any products to search for. */
  next_page_token?: string;
}

/** Search Music - GET /affiliate_creator/202602/music/search */
export interface SearchMusicData {
  /** Music list */
  music?: {
    /** Music id */
    id?: string;
    /** Music title */
    title?: string;
    /** Artist name */
    author?: string;
    /** Cover image */
    cover_thumb?: {
      /** Cover image URL list */
      url_list?: string[];
    };
    /** Duration in seconds */
    duration?: string;
    /** Play URL */
    play_url?: {
      /** URL list */
      url_list?: string[];
    };
  }[];
  /** use this as the next request’s page_token, only meaningful when has_more=true. */
  next_page_token?: string;
  /** Whether there is another page. */
  has_more?: boolean;
  /** Use the same search_id for all subsequent pages of the same search. */
  search_id?: string;
}

/** Upload File Init - POST /open/202512/file/init */
export interface UploadFileInitData {
  /** The URL provided by platform where the file can be uploaded. */
  upload_url?: string;
  /** The upload token used when uploading the file to the returned upload URL. */
  upload_token?: string;
}

export interface UploadFileInitBody {
  /** The name of the file to upload for this upload session. */
  file_name: string;
  /** The type of file to upload. Currently, only video is supported. */
  file_type: string;
  /** file size, bytes */
  file_size: number;
  /** The total number of chunks. */
  total_chunk_count: number;
  /** After the video is uploaded, use this interface to bind the video resource to the specific material */
  target_path: string;
}

/** Upload Shoppable Video File - POST /affiliate_creator/202505/videos/video_files */
export interface UploadShoppableVideoFileData {
  /** Video file information. */
  video_file?: {
    /** The id from of the uploaded video file. */
    id?: string;
    /** Upload file md5 checksum */
    md5?: string;
  };
}

export interface UploadShoppableVideoFileBody {
  /**
   * The local file to be uploaded.
   * Note：
   * - Supported formats: MP4, MOV, MKV, WMV, WEBM, AVI, 3GP, FLV, MPEG
   * - Max video size: 100 MB
   * - Video aspect ratio: 9:16 to 16:9
   * Recommendations for product videos:
   * - Resolution: 720p or higher
   * - Duration: > 30 seconds
   */
  data: any;
}

/** Upload Shoppable Photo File - POST /affiliate_creator/202511/photos/photo_files */
export interface UploadShoppablePhotoFileData {
  /** Photo Info */
  photo_file?: {
    /** In [Post Shoppable Photos], use this photo URI to fill photo_file_uris field */
    photo_uri?: string;
  };
}

export interface UploadShoppablePhotoFileBody {
  /**
   * The local file to be uploaded.
   * The local image file to be uploaded.
   * 
   * Note:
   * - Supported formats: JPG, JPEG, PNG, WEBP, HEIC, BMP
   * - Max size: 10MB
   * 
   * - aspect ratio: 9:16 to 16:9
   */
  data: any;
}

/** Precheck Video Content - POST /affiliate_creator/202511/videos/precheck_task */
export interface PrecheckVideoContentData {
  /** Video content pre-check task result */
  precheck?: {
    /** pre-check task id */
    task_id?: string;
  };
}

export interface PrecheckVideoContentBody {
  /** Video information */
  video_info: {
    /** Video file_id from [Upload Shoppable Video File](https://api/affiliate_creator/202505/videos/video_files) */
    file_id: string;
  };
  /** Product link information */
  product_link_info: {
    /**
     * Use product_id to bind the product with the video.
     * The product_id from [Get Shop Products](https://api/affiliate_creator/202509/shop_products) or [Get Showcase Products](https://api/affiliate_creator/202405/showcases/products)
     */
    product_id: string;
    /** The title to be shown on the product anchor. Anchor title should be shorter than 30 characters. */
    title: string;
  };
}

/** Get Shoppable Video Precheck Result - GET /affiliate_creator/202601/videos/precheck_tasks/{task_id} */
export interface GetShoppableVideoPrecheckResultData {
  /** Video pre-check task */
  precheck_task?: {
    /** The id of the video pre-check task. */
    id?: string;
    /** violation check details */
    violation_check_result?: {
      /**
       * SUCCESS: The precheck task passed violation checks
       * FAIL: The precheck task has failed due to violations. Check the 'issues' field for details.
       * PROCESSING: The precheck violation task is still in progress
       */
      status?: string;
      /** A list of policy violation details returned when violation check fails */
      issues?: {
        /** Policy violation */
        risk?: string;
        /** Detailed guidance to resolve the detected violation. */
        suggestions?: string;
      }[];
    };
    /** good qualtiy check details */
    good_quality_check_result?: {
      /**
       * SUCCESS: The precheck task passed all good quality checks
       * FAIL: The precheck task failed good quality checks. Check the 'issues' field for details.
       * PROCESSING: The good qualtify check is still in progress
       */
      status?: string;
      /** A list of quality issues and improvement suggestions when the good quality check fails. */
      issues?: {
        /** Quality finding */
        code?: string;
        /** Recommended improvements based on the quality finding. */
        suggestions?: string;
      }[];
    };
  };
}

/** Post Shoppable Video - POST /affiliate_creator/202607/videos */
export interface PostShoppableVideoData {
  /** Published video information */
  video?: {
    /** The video id, use this id to query video publish status. */
    id?: string;
  };
  /** Content posting quota for the creator. Returned on successful publish; included in the error message on failure; omitted if no quota restriction applies. */
  quota?: string;
}

export interface PostShoppableVideoBody {
  /** Video information */
  video_info: {
    /** Video file_id from [Upload Shoppable Video File] */
    file_id: string;
    /**
     * The video caption.
     * The maximum length is 4000 in UTF-16 runes.
     * If not specified, the ticket post will not have any captions.
     */
    title: string;
    /** Video cover image URI, which is returned after uploading the image via the Upload Shoppable Photo File API. */
    cover_uri?: string;
    /** The input parameter is a timestamp, which specifies a particular moment in the video. The frame at that timestamp will be used as the video cover. If cover_uri and cover_timestamp_ms are both not provided, the cover will default to the first frame of the uploaded video. Only one of cover_uri or cover_timestamp_ms can be provided. If both parameters are passed, cover_uri will take precedence. */
    cover_timestamp_ms?: number;
    /** The music ID for the video BGM. If not provided, no music will be associated with the video. The music ID must be obtained via Search Music Library. */
    music_id?: string;
    /** Field to indicate whether the content was AI generated. Marking this field as true will display a tag indicating this post as an AI generated post. */
    is_ai_generated?: boolean;
  };
  /** Product link information */
  product_link_info: {
    /**
     * Use product_id to bind the product with the video.
     * The product_id from [Get Shop Products] or [Get Showcase Products]
     */
    product_id: string;
    /** The title to be shown on the product anchor. Anchor title should be shorter than 30 characters. */
    title: string;
  };
}

/** Post Shoppable Photos - POST /affiliate_creator/202607/photos */
export interface PostShoppablePhotosData {
  /** Post shoppable photos response */
  photo?: {
    /** Photo post ID */
    photo_post_id?: string;
  };
  /** Content posting quota for the creator. Returned on successful publish; included in the error message on failure; omitted if no quota restriction applies. */
  quota?: string;
}

export interface PostShoppablePhotosBody {
  /** Photo Info Metadata */
  photos_info: {
    /** Photo file uris, not a file upload. Use [Upload Shoppable Photo File] to upload the image and obtain the photo_file_uri, then pass that URI in this field */
    photo_file_uris: string;
  }[];
  /** Music ID */
  music_id?: string;
  /** Post title:The maximum length is 5000 in UTF-16 runes. If not specified, the ticket post will not have any captions.   - You can add relevant hashtags to increase discoverability. The format is simply # followed by the topic name. Multiple hashtags are supported,e.g.,#humor#BFCM */
  title?: string;
  /** Photo anchor and linking metadata */
  link_info?: {
    /** 1-LINK_TO_PRODUCT, 2-LINK_TO_SHOP, 3-LINK_TO_ONE_PIC_ONE_PRODUCT */
    post_type: string;
    /** Shop Info */
    shop_info?: {
      /** Shop ID */
      shop_id?: string;
      /** 1 for shop_home_page, 2 for category, 3 for collection */
      group_type?: string;
      /** Category ID/Collection ID. Use [Get Shop Category And Collection] to retrieve a valid category_id or collection_id, then set it in this field */
      group_id?: string;
    };
    /** Photo Anchor List */
    links?: {
      /** Product ID */
      product_id?: string;
      /** Photo Anchor Title:The title to be shown on the product anchor. Anchor title should be shorter than 30 characters */
      link_title?: string;
    }[];
  };
}

/** Get Shoppable Video Status - GET /affiliate_creator/202509/videos/{video_id}/status */
export interface GetShoppableVideoStatusData {
  /** returned video info */
  video?: {
    /** Video id */
    id?: string;
    /**
     * Video posting status, possible values:
     * - SUCCESS
     * - FAIL
     * - PROCESSING
     */
    post_status?: string;
    /**
     * Returned if the video has been successfully posted, i.e. `posting_status = SUCCESS`.
     * Represented in seconds.
     */
    post_time?: number;
  };
}

// =============== Analytics de creator ===============
/** Get Video Performances - GET /analytics/202403/videos/performances */
export interface GetVideoPerformancesData {
  /** Contains a list of video objects. The inner list of objects will be organized in ascending order based on the video_id field. */
  videos?: {
    /** Each video ID in the request parameter corresponds to array of daily metrics. */
    id?: string;
    /** The list of objects within will be arranged in ascending order based on the start_time field. */
    performances?: {
      /** Time range object */
      time_range?: {
        /** Date of the metrics. */
        start_time?: number;
        /** Date of the metrics. */
        end_time?: number;
      };
      /** Metrics object. */
      metrics?: {
        /** Display rate for anchors, specified with two decimal numbers. */
        anchor_display_rate?: string;
        /** Click through rate, specified with two decimal numbers. */
        click_through_rate?: string;
        /** Number of orders in this date. */
        order_count?: number;
        /** Number of sold items in this date. */
        item_sold_count?: number;
        /** GMV object */
        gmv?: {
          /** GMV value for this date, specified with two decimal numbers. */
          amount?: string;
          /** Currency of GMV value, three-letter code, ISO 4217 */
          currency?: string;
        };
      };
    }[];
  }[];
}

/** Get Live Room Core Stats - GET /analytics/202502/live_rooms/{live_room_id}/core_stats */
export interface GetLiveRoomCoreStatsData {
  /** The stats of the live room */
  stats?: {
    /** The number of product units sold from the livestream */
    sales?: number;
    /** Revenue */
    local_gmv?: {
      /** The amount of GMV */
      amount?: string;
      /** Currency Code */
      currency?: string;
    };
    /** The number of SKU orders created by users from the livestream */
    created_order_count?: number;
    /** Viewers */
    current_visitor_count?: number;
    /** The number of SKU orders created and paid by users from the livestream */
    paid_order_count?: number;
    /** The average price of the units sold */
    local_unit_price?: {
      /** The amount of unit price */
      amount?: string;
      /** Currency Code */
      currency?: string;
    };
    /** The number of product clicks from the livestream, including product list and product card clicks */
    product_reach_count?: number;
    /** The number of views of the livestream */
    watch_pv?: number;
    /** Click through rate，product clicks / views */
    click_through_rate?: string;
    /** The number of times users clicked to follow the creator */
    accumulated_new_follower_count?: number;
    /** The number of unique users who paid for orders made from livestream, including returned/refunded orders */
    buyer_count?: number;
    /** The cumulative number of times users left comments on the livestream */
    accumulated_comment_count?: number;
    /** The number of impressions of all livestream products, including product list and product card impressions */
    product_view_count?: number;
    /** Click to order，paid sku orders/ product clicks */
    click_order_rate?: string;
    /** The average length of time each unique viewer watches the livestream. */
    avg_watching_duration?: number;
    /** The cumulative number of times users shared the livestream */
    accumulated_sharing_count?: number;
    /** The peak number of concurrent viewers of the livestream */
    peak_concurrent_user_count?: number;
  };
}

/** Get Live Room GMV Trend - GET /analytics/202502/live_rooms/{live_room_id}/gmv_trend_performances */
export interface GetLiveRoomGmvTrendData {
  /** The trend of GMV chart */
  gmv_trend_performances?: {
    /** The stats_type describes the type of trend value. Possible values: TREND_GMV (GMV of the live streaming room), TREND_CREATED_ORDER (created orders in the live streaming room). */
    stats_type?: string;
    /** The data point of GMV trend */
    data_points?: {
      /** If stats_type is TREND_CREATED_ORDER, it will return the  order count in current timestamp */
      order_count?: number;
      /** timestamp */
      timestamp?: number;
      /** If stats_type is TREND_GMV, it will return the value of GMV in the current timestamp */
      gmv?: {
        /** Currency Code */
        currency?: string;
        /** The amount of GMV */
        amount?: string;
      };
    }[];
  }[];
}

/** Get Live Room View Trends - GET /analytics/202502/live_rooms/{live_room_id}/view_trend_performances */
export interface GetLiveRoomViewTrendsData {
  /** Viewer count trends of the live streaming room */
  view_trend_performances?: {
    /**
     * The viewer trend category.
     * TREND_ONLINE_VIEWER: Viewers who are watching the live streaming room.
     * TREND_ENTER_VIEWER: Viewers who enter the live streaming room.
     * TREND_LEFT_VIEWER: Viewers who left the live streaming room.
     */
    stats_type?: string;
    /** The data point of view trend */
    data_points?: {
      /** The viewer count for the corresponding trend category at this data point. */
      value?: string;
      /** Unix timestamp GMT (UTC+00:00). This timestamp is used across all API requests. Developers can use this convert to local time. */
      timestamp?: number;
    }[];
  }[];
}

/** Get Live Room Traffic Performance - GET /analytics/202502/live_rooms/{live_room_id}/traffic_performances */
export interface GetLiveRoomTrafficPerformanceData {
  /** The traffic performances within the livestream room */
  traffic_performances?: {
    /** The source of traffic performances within the live room */
    source?: {
      /** The name of the live source */
      name?: string;
      /** Watch page value, e.g. Watch count */
      watch_pv?: number;
    };
    /** The sub source of the source */
    sub_sources?: {
      /** The name of the live sub source */
      name?: string;
      /** Watch page value, e.g. Watch count */
      watch_pv?: number;
    }[];
  }[];
}

/** Get Live Room Interactive Trends - GET /analytics/202502/live_rooms/{live_room_id}/interactive_trend_performances */
export interface GetLiveRoomInteractiveTrendsData {
  /** The trend data of living room */
  interactive_trend_performances?: {
    /** The stats_type describes the type of interactive trend value. Possible values: WATCH_PV (watch count of the live streaming room), COMMENT_PV (comment count of the live streaming room), SHARE_PV (share count of the live streaming room). */
    stats_type?: string;
    /** The data point of interactive trend */
    data_points?: {
      /** The value of the interaction information within the livestream room */
      value?: string;
      /** The time of the data points */
      timestamp?: number;
    }[];
  }[];
}

/** Get Live Room Product Stats - GET /analytics/202502/live_rooms/{live_room_id}/product_stats */
export interface GetLiveRoomProductStatsData {
  /** The stats of the live streaming room, e.g. GMV */
  product_stats?: {
    /** The main image of product URL */
    main_image_url?: string;
    /** Unique ID for each product */
    product_id?: string;
    /** If the item is currently on sale in the livestream room */
    is_live?: boolean;
    /** The ratio of product clicks to product impressions */
    click_through_rate?: string;
    /** The region where products sells */
    sellable_region?: string;
    /** The number of orders created for this product by users from the livestream */
    created_order_count?: number;
    /** The number of impressions of this product, including in the product list and product cards */
    exposure_count?: number;
    /** The total number of times the product was clicked from this livestream, including from the product list and product card */
    total_click_count?: number;
    /** The revenue of products using local currency */
    local_gmv?: {
      /** The amount of GMV */
      amount?: string;
      /** Currency Code */
      currency?: string;
    };
    /** The display name of the product in the live room product stats list. */
    product_name?: string;
    /** The average price of the units sold using local currency */
    local_unit_price?: {
      /** The amount of unit price */
      amount?: string;
      /** Currency Code */
      currency?: string;
    };
    /** The number of SKU orders created and paid by users for this product from the livestream room */
    paid_order_count?: number;
    /** The remaining inventory of the product */
    inventory_left_count?: number;
    /** The number of product units sold */
    inventory_consumption_count?: number;
    /** Number of unique users who created orders for this product */
    created_order_user_count?: number;
    /** Number of unique users who paid orders for this product */
    paid_user_count?: number;
    /** Product paid SKU orders/Product clicks */
    click_order_rate?: string;
  }[];
}

/** Get Live Room User Portraits - GET /analytics/202502/live_rooms/{live_room_id}/user_portraits */
export interface GetLiveRoomUserPortraitsData {
  /** Gender indicators for advertisement */
  all_ads_gender_indicators?: {
    /**
     * The stats_type describes the type of value below.
     * 
     * USER_PORTRAIT_GENDER_UNKNOWN: The user portrait of the unknown gender
     * 
     * USER_PORTRAIT_GENDER_M: The user portrait of the man
     * 
     * USER_PORTRAIT_GENDER_F: The user portrait of the female
     */
    type?: string;
    /** The number of type */
    value?: string;
  }[];
  /** Fans indicators */
  all_fan_indicators?: {
    /**
     * The stats_type describes the type of value below.
     * 
     * USER_PORTRAIT_FOLLOWER: The user portrait of the follower
     * 
     * USER_PORTRAIT_NON_FOLLOWER: The user portrait of the non follower
     */
    type?: string;
    /** The number of type */
    value?: string;
  }[];
  /** Age indicators for advertisement */
  all_ads_age_indicators?: {
    /**
     * The type of age indicator.
     * USER_PORTRAIT_AGE_LESS_THAN_15: Users whose age is less than 15.
     * USER_PORTRAIT_AGE_MORE_THAN_34: Users whose age is more than 34.
     * USER_PORTRAIT_AGE_MORE_THAN_55: Users whose age is more than 55.
     * USER_PORTRAIT_AGE_13_TO_17: Users whose age is between 13 and 17.
     * USER_PORTRAIT_AGE_15_TO_17: Users whose age is between 15 and 17.
     * USER_PORTRAIT_AGE_18_TO_24: Users whose age is between 18 and 24.
     * USER_PORTRAIT_AGE_25_TO_34: Users whose age is between 25 and 34.
     * USER_PORTRAIT_AGE_35_TO_44: Users whose age is between 35 and 44.
     * USER_PORTRAIT_AGE_45_TO_54: Users whose age is between 45 and 54.
     */
    type?: string;
    /** The value for the corresponding age indicator. */
    value?: string;
  }[];
  /** Country-level user portrait indicators for the live room. */
  region_indicators?: {
    /** The share rate of region, times 10,000 */
    value?: string;
    /** The country of indicators */
    type?: string;
  }[];
  /** Paid advertisement age indicators for advertisement */
  paid_ads_age_indicators?: {
    /**
     * The type of paid advertisement age indicator.
     * USER_PORTRAIT_AGE_LESS_THAN_15: Users whose age is less than 15.
     * USER_PORTRAIT_AGE_MORE_THAN_34: Users whose age is more than 34.
     * USER_PORTRAIT_AGE_MORE_THAN_55: Users whose age is more than 55.
     * USER_PORTRAIT_AGE_13_TO_17: Users whose age is between 13 and 17.
     * USER_PORTRAIT_AGE_15_TO_17: Users whose age is between 15 and 17.
     * USER_PORTRAIT_AGE_18_TO_24: Users whose age is between 18 and 24.
     * USER_PORTRAIT_AGE_25_TO_34: Users whose age is between 25 and 34.
     * USER_PORTRAIT_AGE_35_TO_44: Users whose age is between 35 and 44.
     * USER_PORTRAIT_AGE_45_TO_54: Users whose age is between 45 and 54.
     */
    type?: string;
    /** The number of type */
    value?: string;
  }[];
  /** Paid advertisement gender indicators for advertisement */
  paid_ads_gender_indicators?: {
    /**
     * The stats_type describes the type of value below.
     * 
     * USER_PORTRAIT_GENDER_UNKNOWN: The user portrait of the unknown gender
     * 
     * USER_PORTRAIT_GENDER_M: The user portrait of the man
     * 
     * USER_PORTRAIT_GENDER_F: The user portrait of the female
     */
    type?: string;
    /** The number of type */
    value?: string;
  }[];
  /** Paid fans indicators */
  paid_fan_indicators?: {
    /**
     * The stats_type describes the type of value below.
     * 
     * USER_PORTRAIT_FOLLOWER: The user portrait of the follower
     * 
     * USER_PORTRAIT_NON_FOLLOWER: The user portrait of the non follower
     */
    type?: string;
    /** The number of type */
    value?: string;
  }[];
}

// =============== Toko Mapper ===============
/** Get Toko Product Mappers - GET /affiliate_creator/202606/toko_product_mappers */
export interface GetTokoProductMappersData {
  /** error information */
  error?: {
    /** error code message */
    code?: number;
    /** error detail information */
    message?: string;
  };
  /** list of product data */
  product?: {
    /** product id in tokopedia format */
    toko_pid?: number;
    /** product id in tts format */
    tts_pid?: number;
  }[];
}

export interface GetTokoProductMappersBody {
  /** list product id in toko format */
  toko_pids?: number[];
}

/** Toko Product Mapper V2 - POST /affiliate_creator/202607/map_toko_product */
export interface TokoProductMapperV2Data {
  /** error information */
  error?: {
    /** error code message */
    code?: number;
    /** error detail information */
    message?: string;
  };
  /** list of product data */
  product?: {
    /** product id in tokopedia format */
    toko_pid?: number;
    /** product id in tts format */
    tts_pid?: number;
  }[];
}

export interface TokoProductMapperV2Body {
  /** list product id in toko format */
  toko_pids?: number[];
}


/** Creator Select Affiliate Product - POST /affiliate_creator/202501/selection/products/search */
export interface CreatorSelectAffiliateProductData {
  /** Cursor da próxima página; vazio quando acabou. */
  next_page_token?: string;
  /** Total de produtos que casam com o filtro. */
  total_count?: number;
  products?: {
    id?: string;
    title?: string;
    brand_name?: string;
    main_image_url?: string;
    /** `rate` em centésimos de % (1250 = 12,5%); `amount` já é o valor da comissão. */
    commission?: { amount?: string; rate?: number };
    /** Faixa de preço do produto na moeda local. */
    price?: { floor_price?: string; ceiling_price?: string; currency?: string };
    review?: { count?: number; overall_score?: string };
    shop?: { name?: string; logo_url?: string; rating?: string };
    stock?: { quantity?: number };
    market_performance?: { historical_sold_quantity?: number };
  }[];
}

/**
 * Creator Get Sample Request Deeplink - GET /affiliate_creator/202512/samples/deeplink
 * Devolve um deeplink `snssdk1180://` que abre a solicitação de amostra no app da
 * TikTok. Exige que o produto já esteja na vitrine do creator; caso contrário a API
 * responde 16032001 "please ensure creator has added product".
 */
export interface CreatorGetSampleRequestDeeplinkData {
  deeplink?: string;
}

/**
 * Check Anchor Prerequisites - POST /affiliate/202402/anchors/prerequisite_check
 * Pré-verificação de permissão do creator e status do produto para virar âncora de
 * vídeo. Sucesso é `code: 0` com data vazio; a reprovação vem como erro da API.
 */
export type CheckAnchorPrerequisitesData = Record<string, never>;

/**
 * Check Anchor Content - POST /affiliate/202403/anchors/content_check
 * Valida o título da âncora. Reprova título com 30 caracteres ou mais (16012007),
 * além de palavrão, pontuação e emoji.
 */
export type CheckAnchorContentData = Record<string, never>;

/** Get Live Room Info - GET /affiliate/202309/live_rooms (fonte do live_room_id p/ a analytics de live) */
export interface GetLiveRoomInfoData {
  /** The live room's ID */
  id?: string;
  /** The start time of broadcasting (Unix) */
  start_time?: number;
  /** The live room's status */
  status?: string;
  /** The live room's title */
  title?: string;
}

/** Generate Affiliate Sharing Link - POST /affiliate_creator/202501/affiliate_sharing_links/generate_batch */
export interface GenerateAffiliateSharingLinkData {
  /** Generated affiliate links for each tag */
  affiliate_sharing_links?: {
    /** Affiliate short link (www.tiktok.com domain) */
    affiliate_sharing_link?: string;
    /** One of the tags in the request */
    tag?: string;
  }[];
  /** Per-tag errors on partial failure */
  errors?: {
    code?: number;
    message?: string;
    detail?: { fail_reason?: string; tag?: string };
  }[];
}

export interface GenerateAffiliateSharingLinkBody {
  /** Customized promotion channel */
  channel?: string;
  /** Material to generate links for */
  material?: {
    campaign_url?: string;
    /** ID of product/campaign/showcase to promote */
    id?: string;
    /** PRODUCT | CAMPAIGN | SHOWCASE */
    type?: string;
  };
  /** Creator's own tracking tags */
  tags?: string[];
}
