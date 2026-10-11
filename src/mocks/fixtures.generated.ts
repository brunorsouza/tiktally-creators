// AUTO-GERADO — mock (data) de cada endpoint.
import type * as T from "@/types/creator-api.generated";
import { PRODUCT_IMAGES } from "@/mocks/productImages.generated";

/**
 * Avatar do creator: rosto SINTÉTICO, embutido como data URI.
 *
 * Gerado por StyleGAN (thispersondoesnotexist.com) — a pessoa não existe.
 * Essa é a razão da escolha: retrato de pessoa real em material de feira usa a
 * imagem de alguém que não consentiu, o mesmo problema que me fez evitar marcas
 * e fotos de produto de terceiros no catálogo. Rosto que não é de ninguém não
 * tem esse custo.
 *
 * Embutido, como as fotos de produto, porque a demo tem que abrir offline.
 */
const AVATAR_DATA_URI =
  "data:image/jpeg;base64,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";

export const getCreatorProfileFixture = {
  "avatar": {
    "width": 240,
    "height": 240,
    "url": AVATAR_DATA_URI
  },
  "username": "anabeatriz.reviews",
  "selection_region": "BR",
  "register_region": "BR",
  "seller_type": "LOCAL",
  "permissions": [
    "LIVE_STREAM_PERMISSION",
    "SELF_SALE_PERMISSION",
    "ADD_AFFILIATE_PERMISSION"
  ],
  "user_type": "TIKTOK_SHOP_CREATOR",
  "creator_user_open_id": "uACafQAAAABmUU2qon4R0vUYvUVS3QC6CICP2m5A2-wd77j8R9G0yg"
} as unknown as T.GetCreatorProfileData;
export const getShowcaseProductsFixture = {
  "products": [
    {
      "id": "532190923140",
      "shop": {
        "name": "Nuance Beauty"
      },
      "title": "Batom matte vermelho longa duração",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["4"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "49.90",
          "maximum_amount": "49.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "39.90",
          "maximum_amount": "39.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "39.90",
          "maximum_amount": "39.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923140?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 2500,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923141",
      "shop": {
        "name": "Nuance Beauty"
      },
      "title": "Paleta de sombras nude 12 cores",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["2"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "99.90",
          "maximum_amount": "99.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "84.90",
          "maximum_amount": "84.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "84.90",
          "maximum_amount": "84.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923141?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 2200,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923142",
      "shop": {
        "name": "Bella Derm Oficial"
      },
      "title": "Pó compacto translúcido efeito matte",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["3"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "64.90",
          "maximum_amount": "64.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "54.90",
          "maximum_amount": "54.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "54.90",
          "maximum_amount": "54.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923142?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 1800,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923143",
      "shop": {
        "name": "CreatorKit Store"
      },
      "title": "Ring light de mesa com tripé 26 cm",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["110"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "159.90",
          "maximum_amount": "159.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "129.90",
          "maximum_amount": "129.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "129.90",
          "maximum_amount": "129.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923143?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 1500,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923144",
      "shop": {
        "name": "CreatorKit Store"
      },
      "title": "Bastão de selfie retrátil",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["111"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "89.90",
          "maximum_amount": "89.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "69.90",
          "maximum_amount": "69.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "69.90",
          "maximum_amount": "69.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923144?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 1600,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923145",
      "shop": {
        "name": "Stride Esportes"
      },
      "title": "Tênis esportivo branco e vermelho",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["91"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "319.90",
          "maximum_amount": "319.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "259.90",
          "maximum_amount": "259.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "259.90",
          "maximum_amount": "259.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923145?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 1100,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923146",
      "shop": {
        "name": "TempoTech Oficial"
      },
      "title": "Relógio pulseira de couro marrom",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["93"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "249.00",
          "maximum_amount": "249.00",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "199.00",
          "maximum_amount": "199.00",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "199.00",
          "maximum_amount": "199.00",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923146?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 1200,
        "reward_rate": 0
      }
    },
    {
      "id": "532190923147",
      "shop": {
        "name": "CasaViva Utilidades"
      },
      "title": "Marmita térmica inox 3 andares",
      "main_images": [
        {
          "width": 360,
          "heigth": 360,
          "url": PRODUCT_IMAGES["65"]
        }
      ],
      "price": {
        "original_price": {
          "minimum_amount": "119.90",
          "maximum_amount": "119.90",
          "currency": "BRL"
        },
        "seller_discount_price": {
          "minimum_amount": "99.90",
          "maximum_amount": "99.90",
          "currency": "BRL"
        },
        "platform_discount_price": {
          "minimum_amount": "99.90",
          "maximum_amount": "99.90",
          "currency": "BRL"
        }
      },
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/532190923147?region=BR",
      "sale_regions": [
        "BR"
      ],
      "commission": {
        "rate": 1900,
        "reward_rate": 0
      }
    }
  ],
  "next_page_token": "",
  "total_count": 8
} as unknown as T.GetShowcaseProductsData;
// Caminho feliz: `errors` vazio. O exemplo da doc (um erro 16001001) fazia toda adição
// no mock — inclusive na demo de feira — cair na falha parcial.
export const addShowcaseProductsFixture = {
  "errors": []
} as unknown as T.AddShowcaseProductsData;
export const removeShowcaseProductsFixture = {
  "code": 0,
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
} as unknown as T.RemoveShowcaseProductsData;
export const topShowcaseProductsFixture = {
  "code": 0,
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
} as unknown as T.TopShowcaseProductsData;
export const searchCreatorAffiliateOrdersFixture = {
  "orders": [
    {
      "id": "789078671231123124",
      "create_time": 1786190400,
      "status": "SETTLED",
      "skus": [
        {
          "id": "1729793769377925388",
          "product_name": "Máscara Facial Argila Verde",
          "product_id": "1729793769377859852",
          "price": { "amount": "49.90", "currency": "BRL" },
          "shop_name": "Bella Store",
          "content_type": "LIVE",
          "content_id": "7493990579714164574",
          "quantity": 2,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "99.80", "currency": "BRL" },
          "estimated_commission": { "amount": "9.98", "currency": "BRL" },
          "actual_commission_base": { "amount": "49.90", "currency": "BRL" },
          "actual_commission": { "amount": "4.99", "currency": "BRL" },
          "returned_quantity": 1,
          "refunded_quantity": 0
        }
      ]
    },
    {
      "id": "800000000000001",
      "create_time": 1785748500,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000001",
          "product_name": "Sérum Vitamina C 30ml",
          "product_id": "620000000000001",
          "price": { "amount": "89.90", "currency": "BRL" },
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046149",
          "quantity": 1,
          "commission_rate": 1500,
          "estimated_commission_base": { "amount": "89.90", "currency": "BRL" },
          "estimated_commission": { "amount": "13.49", "currency": "BRL" },
          "actual_commission_base": { "amount": "89.90", "currency": "BRL" },
          "actual_commission": { "amount": "13.49", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000002",
      "create_time": 1786348800,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000002",
          "product_name": "Sérum Vitamina C 30ml",
          "product_id": "620000000000001",
          "price": { "amount": "89.90", "currency": "BRL" },
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046149",
          "quantity": 2,
          "commission_rate": 1500,
          "estimated_commission_base": { "amount": "179.80", "currency": "BRL" },
          "estimated_commission": { "amount": "26.97", "currency": "BRL" },
          "actual_commission_base": { "amount": "179.80", "currency": "BRL" },
          "actual_commission": { "amount": "26.97", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000003",
      "create_time": 1787135400,
      "status": "To-SETTLE",
      "skus": [
        {
          "id": "900000000000003",
          "product_name": "Sérum Vitamina C 30ml",
          "product_id": "620000000000001",
          "price": { "amount": "89.90", "currency": "BRL" },
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046149",
          "quantity": 1,
          "commission_rate": 1500,
          "estimated_commission_base": { "amount": "89.90", "currency": "BRL" },
          "estimated_commission": { "amount": "13.49", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000004",
      "create_time": 1785853800,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000004",
          "product_name": "Kit Skincare Noturno",
          "product_id": "620000000000002",
          "price": { "amount": "159.90", "currency": "BRL" },
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046250",
          "quantity": 1,
          "commission_rate": 2500,
          "estimated_commission_base": { "amount": "159.90", "currency": "BRL" },
          "estimated_commission": { "amount": "39.98", "currency": "BRL" },
          "actual_commission_base": { "amount": "159.90", "currency": "BRL" },
          "actual_commission": { "amount": "39.98", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000005",
      "create_time": 1786722000,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000005",
          "product_name": "Kit Skincare Noturno",
          "product_id": "620000000000002",
          "price": { "amount": "159.90", "currency": "BRL" },
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046250",
          "quantity": 2,
          "commission_rate": 2500,
          "estimated_commission_base": { "amount": "319.80", "currency": "BRL" },
          "estimated_commission": { "amount": "79.95", "currency": "BRL" },
          "actual_commission_base": { "amount": "319.80", "currency": "BRL" },
          "actual_commission": { "amount": "79.95", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000006",
      "create_time": 1786034700,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000006",
          "product_name": "Base Líquida Matte FPS30",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351",
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "actual_commission_base": { "amount": "39.90", "currency": "BRL" },
          "actual_commission": { "amount": "3.99", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000007",
      "create_time": 1786475400,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000007",
          "product_name": "Base Líquida Matte FPS30",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351",
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "actual_commission_base": { "amount": "39.90", "currency": "BRL" },
          "actual_commission": { "amount": "3.99", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000008",
      "create_time": 1786997100,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000008",
          "product_name": "Base Líquida Matte FPS30",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351",
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "actual_commission_base": { "amount": "39.90", "currency": "BRL" },
          "actual_commission": { "amount": "3.99", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000009",
      "create_time": 1787399100,
      "status": "To-SETTLE",
      "skus": [
        {
          "id": "900000000000009",
          "product_name": "Base Líquida Matte FPS30",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351",
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000010",
      "create_time": 1785927600,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000010",
          "product_name": "Fone Bluetooth TWS Pro",
          "product_id": "620000000000004",
          "price": { "amount": "199.90", "currency": "BRL" },
          "shop_name": "TechHouse",
          "content_type": "VIDEO",
          "content_id": "7271486684427046452",
          "quantity": 1,
          "commission_rate": 500,
          "estimated_commission_base": { "amount": "199.90", "currency": "BRL" },
          "estimated_commission": { "amount": "10.00", "currency": "BRL" },
          "actual_commission_base": { "amount": "199.90", "currency": "BRL" },
          "actual_commission": { "amount": "10.00", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000011",
      "create_time": 1786814700,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000011",
          "product_name": "Fone Bluetooth TWS Pro",
          "product_id": "620000000000004",
          "price": { "amount": "199.90", "currency": "BRL" },
          "shop_name": "TechHouse",
          "content_type": "VIDEO",
          "content_id": "7271486684427046452",
          "quantity": 1,
          "commission_rate": 500,
          "estimated_commission_base": { "amount": "199.90", "currency": "BRL" },
          "estimated_commission": { "amount": "10.00", "currency": "BRL" },
          "actual_commission_base": { "amount": "199.90", "currency": "BRL" },
          "actual_commission": { "amount": "10.00", "currency": "BRL" }
        }
      ]
    },
    {
      "id": "800000000000012",
      "create_time": 1787336100,
      "status": "AWAITING PAYMENT",
      "skus": [
        {
          "id": "900000000000012",
          "product_name": "Garrafa Térmica 1L Inox",
          "product_id": "620000000000005",
          "price": { "amount": "79.90", "currency": "BRL" },
          "shop_name": "CasaViva",
          "content_type": "VIDEO",
          "content_id": "7271486684427046553",
          "quantity": 1,
          "commission_rate": 2000,
          "estimated_commission_base": { "amount": "79.90", "currency": "BRL" },
          "estimated_commission": { "amount": "15.98", "currency": "BRL" }
        }
      ]
    }
  ],
  "total_count": 13
} as unknown as T.SearchCreatorAffiliateOrdersData;
export const creatorSearchAffiliateTraceOrdersFixture = {
  "orders": [
    {
      "id": 789078671231123124,
      "status": "SETTLED",
      "skus": [
        {
          "id": "1729793769377925388",
          "product_id": "1729793769377859852",
          "price": { "amount": "49.90", "currency": "BRL" },
          "quantity": 2,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "99.80", "currency": "BRL" },
          "actual_commission": { "amount": "4.99", "currency": "BRL" },
          "estimated_commission": { "amount": "9.98", "currency": "BRL" },
          "product_name": "Máscara Facial Argila Verde",
          "shop_name": "Bella Store",
          "returned_quantity": 1,
          "refunded_quantity": 0,
          "actual_commission_base": { "amount": "49.90", "currency": "BRL" },
          "content_type": "LIVE",
          "content_id": "7493990579714164574"
        }
      ],
      "create_time": 1786190400
    },
    {
      "id": 800000000000001,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000001",
          "product_id": "620000000000001",
          "price": { "amount": "89.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 1500,
          "estimated_commission_base": { "amount": "89.90", "currency": "BRL" },
          "actual_commission": { "amount": "13.49", "currency": "BRL" },
          "estimated_commission": { "amount": "13.49", "currency": "BRL" },
          "product_name": "Sérum Vitamina C 30ml",
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046149"
        }
      ],
      "create_time": 1785748500
    },
    {
      "id": 800000000000002,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000002",
          "product_id": "620000000000001",
          "price": { "amount": "89.90", "currency": "BRL" },
          "quantity": 2,
          "commission_rate": 1500,
          "estimated_commission_base": { "amount": "179.80", "currency": "BRL" },
          "actual_commission": { "amount": "26.97", "currency": "BRL" },
          "estimated_commission": { "amount": "26.97", "currency": "BRL" },
          "product_name": "Sérum Vitamina C 30ml",
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046149"
        }
      ],
      "create_time": 1786348800
    },
    {
      "id": 800000000000003,
      "status": "To-SETTLE",
      "skus": [
        {
          "id": "900000000000003",
          "product_id": "620000000000001",
          "price": { "amount": "89.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 1500,
          "estimated_commission_base": { "amount": "89.90", "currency": "BRL" },
          "estimated_commission": { "amount": "13.49", "currency": "BRL" },
          "product_name": "Sérum Vitamina C 30ml",
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046149"
        }
      ],
      "create_time": 1787135400
    },
    {
      "id": 800000000000004,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000004",
          "product_id": "620000000000002",
          "price": { "amount": "159.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 2500,
          "estimated_commission_base": { "amount": "159.90", "currency": "BRL" },
          "actual_commission": { "amount": "39.98", "currency": "BRL" },
          "estimated_commission": { "amount": "39.98", "currency": "BRL" },
          "product_name": "Kit Skincare Noturno",
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046250"
        }
      ],
      "create_time": 1785853800
    },
    {
      "id": 800000000000005,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000005",
          "product_id": "620000000000002",
          "price": { "amount": "159.90", "currency": "BRL" },
          "quantity": 2,
          "commission_rate": 2500,
          "estimated_commission_base": { "amount": "319.80", "currency": "BRL" },
          "actual_commission": { "amount": "79.95", "currency": "BRL" },
          "estimated_commission": { "amount": "79.95", "currency": "BRL" },
          "product_name": "Kit Skincare Noturno",
          "shop_name": "Bella Store",
          "content_type": "VIDEO",
          "content_id": "7271486684427046250"
        }
      ],
      "create_time": 1786722000
    },
    {
      "id": 800000000000006,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000006",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "actual_commission": { "amount": "3.99", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "product_name": "Base Líquida Matte FPS30",
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351"
        }
      ],
      "create_time": 1786034700
    },
    {
      "id": 800000000000007,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000007",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "actual_commission": { "amount": "3.99", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "product_name": "Base Líquida Matte FPS30",
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351"
        }
      ],
      "create_time": 1786475400
    },
    {
      "id": 800000000000008,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000008",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "actual_commission": { "amount": "3.99", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "product_name": "Base Líquida Matte FPS30",
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351"
        }
      ],
      "create_time": 1786997100
    },
    {
      "id": 800000000000009,
      "status": "ORDERED",
      "skus": [
        {
          "id": "900000000000009",
          "product_id": "620000000000003",
          "price": { "amount": "39.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 1000,
          "estimated_commission_base": { "amount": "39.90", "currency": "BRL" },
          "estimated_commission": { "amount": "3.99", "currency": "BRL" },
          "product_name": "Base Líquida Matte FPS30",
          "shop_name": "Cor & Pele",
          "content_type": "VIDEO",
          "content_id": "7271486684427046351"
        }
      ],
      "create_time": 1787399100
    },
    {
      "id": 800000000000010,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000010",
          "product_id": "620000000000004",
          "price": { "amount": "199.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 500,
          "estimated_commission_base": { "amount": "199.90", "currency": "BRL" },
          "actual_commission": { "amount": "10.00", "currency": "BRL" },
          "estimated_commission": { "amount": "10.00", "currency": "BRL" },
          "product_name": "Fone Bluetooth TWS Pro",
          "shop_name": "TechHouse",
          "content_type": "VIDEO",
          "content_id": "7271486684427046452"
        }
      ],
      "create_time": 1785927600
    },
    {
      "id": 800000000000011,
      "status": "SETTLED",
      "skus": [
        {
          "id": "900000000000011",
          "product_id": "620000000000004",
          "price": { "amount": "199.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 500,
          "estimated_commission_base": { "amount": "199.90", "currency": "BRL" },
          "actual_commission": { "amount": "10.00", "currency": "BRL" },
          "estimated_commission": { "amount": "10.00", "currency": "BRL" },
          "product_name": "Fone Bluetooth TWS Pro",
          "shop_name": "TechHouse",
          "content_type": "VIDEO",
          "content_id": "7271486684427046452"
        }
      ],
      "create_time": 1786814700
    },
    {
      "id": 800000000000012,
      "status": "ORDERED",
      "skus": [
        {
          "id": "900000000000012",
          "product_id": "620000000000005",
          "price": { "amount": "79.90", "currency": "BRL" },
          "quantity": 1,
          "commission_rate": 2000,
          "estimated_commission_base": { "amount": "79.90", "currency": "BRL" },
          "estimated_commission": { "amount": "15.98", "currency": "BRL" },
          "product_name": "Garrafa Térmica 1L Inox",
          "shop_name": "CasaViva",
          "content_type": "VIDEO",
          "content_id": "7271486684427046553"
        }
      ],
      "create_time": 1787336100
    }
  ],
  "total_count": 13
} as unknown as T.CreatorSearchAffiliateTraceOrdersData;
export const creatorSearchOpenCollaborationProductFixture = {
  "products": [
    {
      "shop": {
        "name": "Nuance Beauty"
      },
      "id": "1729624807198591370",
      "has_inventory": true,
      "units_sold": 18420,
      "title": "Kit 2 batons matte + lápis labial",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["4"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591370?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "79.90",
        "maximum_amount": "79.90"
      },
      "category_chains": [
        {
          "id": "60000",
          "local_name": "Beleza",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 2500,
        "currency": "BRL",
        "amount": "14.97"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "59.90",
        "maximum_amount": "59.90"
      }
    },
    {
      "shop": {
        "name": "Nuance Beauty"
      },
      "id": "1729624807198591371",
      "has_inventory": true,
      "units_sold": 9310,
      "title": "Paleta de sombras nude 12 cores",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["2"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591371?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "109.90",
        "maximum_amount": "109.90"
      },
      "category_chains": [
        {
          "id": "60001",
          "local_name": "Beleza",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 2200,
        "currency": "BRL",
        "amount": "18.68"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "84.90",
        "maximum_amount": "84.90"
      }
    },
    {
      "shop": {
        "name": "CreatorKit Store"
      },
      "id": "1729624807198591372",
      "has_inventory": true,
      "units_sold": 12780,
      "title": "Ring light 30 cm com tripé 2 m",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["110"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591372?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "199.90",
        "maximum_amount": "199.90"
      },
      "category_chains": [
        {
          "id": "60002",
          "local_name": "Eletrônicos",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1500,
        "currency": "BRL",
        "amount": "22.48"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "149.90",
        "maximum_amount": "149.90"
      }
    },
    {
      "shop": {
        "name": "CreatorKit Store"
      },
      "id": "1729624807198591373",
      "has_inventory": true,
      "units_sold": 7640,
      "title": "Microfone de lapela para celular",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["111"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591373?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "89.90",
        "maximum_amount": "89.90"
      },
      "category_chains": [
        {
          "id": "60003",
          "local_name": "Eletrônicos",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1800,
        "currency": "BRL",
        "amount": "11.68"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "64.90",
        "maximum_amount": "64.90"
      }
    },
    {
      "shop": {
        "name": "Stride Esportes"
      },
      "id": "1729624807198591374",
      "has_inventory": true,
      "units_sold": 5210,
      "title": "Tênis esportivo leve para corrida",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["91"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591374?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "329.90",
        "maximum_amount": "329.90"
      },
      "category_chains": [
        {
          "id": "60004",
          "local_name": "Calçados",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1100,
        "currency": "BRL",
        "amount": "28.59"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "259.90",
        "maximum_amount": "259.90"
      }
    },
    {
      "shop": {
        "name": "TempoTech Oficial"
      },
      "id": "1729624807198591375",
      "has_inventory": true,
      "units_sold": 3480,
      "title": "Relógio couro legítimo 42 mm",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["93"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591375?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "279.00",
        "maximum_amount": "279.00"
      },
      "category_chains": [
        {
          "id": "60005",
          "local_name": "Acessórios",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1200,
        "currency": "BRL",
        "amount": "23.88"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "199.00",
        "maximum_amount": "199.00"
      }
    },
    {
      "shop": {
        "name": "CozinhaMais Casa"
      },
      "id": "1729624807198591376",
      "has_inventory": true,
      "units_sold": 6150,
      "title": "Mixer de mão 500 W com 3 hastes",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["61"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591376?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "189.90",
        "maximum_amount": "189.90"
      },
      "category_chains": [
        {
          "id": "60006",
          "local_name": "Casa e cozinha",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1300,
        "currency": "BRL",
        "amount": "19.49"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "149.90",
        "maximum_amount": "149.90"
      }
    },
    {
      "shop": {
        "name": "CasaViva Utilidades"
      },
      "id": "1729624807198591377",
      "has_inventory": true,
      "units_sold": 8730,
      "title": "Marmita térmica inox 3 andares",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["65"],
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591377?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "129.90",
        "maximum_amount": "129.90"
      },
      "category_chains": [
        {
          "id": "60007",
          "local_name": "Casa e cozinha",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1900,
        "currency": "BRL",
        "amount": "18.98"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "99.90",
        "maximum_amount": "99.90"
      }
    }
  ],
  "next_page_token": "b2Zmc2V0PTg=",
  "total_count": 8
} as unknown as T.CreatorSearchOpenCollaborationProductData;
export const getOpenCollaborationProductListByProductIdsFixture = {
  "products": [
    {
      "shop": {
        "name": "Nuance Beauty"
      },
      "id": "1729432087292775304",
      "has_inventory": true,
      "units_sold": 28470,
      "title": "Batom matte vermelho longa duração",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["4"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775304?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "49.90",
        "maximum_amount": "49.90"
      },
      "category_chains": [
        {
          "id": "60000",
          "local_name": "Beleza",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 2500,
        "currency": "BRL",
        "amount": "9.97"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "39.90",
        "maximum_amount": "39.90"
      }
    },
    {
      "shop": {
        "name": "Nuance Beauty"
      },
      "id": "1729432087292775302",
      "has_inventory": true,
      "units_sold": 15380,
      "title": "Paleta de sombras 18 cores com espelho",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["2"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775302?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "99.90",
        "maximum_amount": "99.90"
      },
      "category_chains": [
        {
          "id": "60001",
          "local_name": "Beleza",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 2200,
        "currency": "BRL",
        "amount": "17.58"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "79.90",
        "maximum_amount": "79.90"
      }
    },
    {
      "shop": {
        "name": "Bella Derm Oficial"
      },
      "id": "1729432087292775303",
      "has_inventory": true,
      "units_sold": 11250,
      "title": "Pó compacto translúcido efeito matte",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["3"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775303?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "64.90",
        "maximum_amount": "64.90"
      },
      "category_chains": [
        {
          "id": "60002",
          "local_name": "Beleza",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1800,
        "currency": "BRL",
        "amount": "9.88"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "54.90",
        "maximum_amount": "54.90"
      }
    },
    {
      "shop": {
        "name": "Bella Derm Oficial"
      },
      "id": "1729432087292775305",
      "has_inventory": true,
      "units_sold": 9340,
      "title": "Esmalte vermelho efeito gel 8ml",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["5"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775305?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "29.90",
        "maximum_amount": "29.90"
      },
      "category_chains": [
        {
          "id": "60003",
          "local_name": "Beleza",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 2800,
        "currency": "BRL",
        "amount": "6.97"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "24.90",
        "maximum_amount": "24.90"
      }
    },
    {
      "shop": {
        "name": "CreatorKit Store"
      },
      "id": "1729432087292775411",
      "has_inventory": true,
      "units_sold": 8930,
      "title": "Bastão de selfie retrátil com controle",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["111"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775411?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "89.90",
        "maximum_amount": "89.90"
      },
      "category_chains": [
        {
          "id": "60004",
          "local_name": "Eletrônicos",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1600,
        "currency": "BRL",
        "amount": "11.18"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "69.90",
        "maximum_amount": "69.90"
      }
    },
    {
      "shop": {
        "name": "CreatorKit Store"
      },
      "id": "1729432087292775410",
      "has_inventory": true,
      "units_sold": 15230,
      "title": "Ring light de mesa com tripé 26 cm",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["110"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775410?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "159.90",
        "maximum_amount": "159.90"
      },
      "category_chains": [
        {
          "id": "60005",
          "local_name": "Eletrônicos",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1500,
        "currency": "BRL",
        "amount": "19.48"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "129.90",
        "maximum_amount": "129.90"
      }
    },
    {
      "shop": {
        "name": "Stride Esportes"
      },
      "id": "1729432087292775391",
      "has_inventory": true,
      "units_sold": 6280,
      "title": "Tênis esportivo branco e vermelho",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["91"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775391?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "319.90",
        "maximum_amount": "319.90"
      },
      "category_chains": [
        {
          "id": "60006",
          "local_name": "Calçados",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1100,
        "currency": "BRL",
        "amount": "28.59"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "259.90",
        "maximum_amount": "259.90"
      }
    },
    {
      "shop": {
        "name": "TempoTech Oficial"
      },
      "id": "1729432087292775393",
      "has_inventory": true,
      "units_sold": 7180,
      "title": "Relógio pulseira de couro marrom",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["93"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775393?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "249.00",
        "maximum_amount": "249.00"
      },
      "category_chains": [
        {
          "id": "60007",
          "local_name": "Acessórios",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1200,
        "currency": "BRL",
        "amount": "23.88"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "199.00",
        "maximum_amount": "199.00"
      }
    },
    {
      "shop": {
        "name": "Urban Fit Store"
      },
      "id": "1729432087292775386",
      "has_inventory": true,
      "units_sold": 3120,
      "title": "Camisa manga curta estampa floral",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["86"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775386?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "109.90",
        "maximum_amount": "109.90"
      },
      "category_chains": [
        {
          "id": "60008",
          "local_name": "Moda",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 2000,
        "currency": "BRL",
        "amount": "17.98"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "89.90",
        "maximum_amount": "89.90"
      }
    },
    {
      "shop": {
        "name": "CozinhaMais Casa"
      },
      "id": "1729432087292775361",
      "has_inventory": true,
      "units_sold": 5410,
      "title": "Mixer de mão 3 velocidades 500W",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["61"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775361?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "179.90",
        "maximum_amount": "179.90"
      },
      "category_chains": [
        {
          "id": "60009",
          "local_name": "Casa e cozinha",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1300,
        "currency": "BRL",
        "amount": "19.49"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "149.90",
        "maximum_amount": "149.90"
      }
    },
    {
      "shop": {
        "name": "CasaViva Utilidades"
      },
      "id": "1729432087292775347",
      "has_inventory": true,
      "units_sold": 4890,
      "title": "Luminária de mesa vintage com cúpula",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["47"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775347?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "149.90",
        "maximum_amount": "149.90"
      },
      "category_chains": [
        {
          "id": "600010",
          "local_name": "Casa e cozinha",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1700,
        "currency": "BRL",
        "amount": "20.38"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "119.90",
        "maximum_amount": "119.90"
      }
    },
    {
      "shop": {
        "name": "CasaViva Utilidades"
      },
      "id": "1729432087292775365",
      "has_inventory": true,
      "units_sold": 8120,
      "title": "Marmita térmica inox 3 andares",
      "sale_region": "BR",
      "main_image_url": PRODUCT_IMAGES["65"],
      "detail_link": "https://shop.tiktok.com/view/product/1729432087292775365?region=BR",
      "original_price": {
        "currency": "BRL",
        "minimum_amount": "119.90",
        "maximum_amount": "119.90"
      },
      "category_chains": [
        {
          "id": "600011",
          "local_name": "Casa e cozinha",
          "is_leaf": true,
          "parent_id": "600000"
        }
      ],
      "commission": {
        "rate": 1900,
        "currency": "BRL",
        "amount": "18.98"
      },
      "sales_price": {
        "currency": "BRL",
        "minimum_amount": "99.90",
        "maximum_amount": "99.90"
      }
    }
  ]
} as unknown as T.GetOpenCollaborationProductListByProductIdsData;
export const searchCreatorTargetCollaborationsFixture = {
  "total_count": 3,
  "next_page_token": "",
  "target_collaborations": [
    {
      "id": "789078671231123120",
      "name": "Campanha Beleza · Setembro",
      "status": "LIVE",
      "products": [
        {
          "id": "1729432087292775300",
          "title": "Kit 2 batons matte + lápis labial",
          "main_image_url": PRODUCT_IMAGES["4"],
          "commission": {
            "rate": 2500,
            "amount": "14.97",
            "currency": "BRL"
          }
        },
        {
          "id": "1729432087292775301",
          "title": "Paleta de sombras nude 12 cores",
          "main_image_url": PRODUCT_IMAGES["2"],
          "commission": {
            "rate": 2200,
            "amount": "18.68",
            "currency": "BRL"
          }
        },
        {
          "id": "1729432087292775302",
          "title": "Pó compacto translúcido",
          "main_image_url": PRODUCT_IMAGES["3"],
          "commission": {
            "rate": 1800,
            "amount": "11.68",
            "currency": "BRL"
          }
        }
      ]
    },
    {
      "id": "789078671231123121",
      "name": "Lançamento CreatorKit",
      "status": "LIVE",
      "products": [
        {
          "id": "1729432087292775305",
          "title": "Ring light 30 cm com tripé 2 m",
          "main_image_url": PRODUCT_IMAGES["110"],
          "commission": {
            "rate": 1500,
            "amount": "22.48",
            "currency": "BRL"
          }
        },
        {
          "id": "1729432087292775304",
          "title": "Microfone de lapela para celular",
          "main_image_url": PRODUCT_IMAGES["111"],
          "commission": {
            "rate": 1800,
            "amount": "11.68",
            "currency": "BRL"
          }
        }
      ]
    },
    {
      "id": "789078671231123122",
      "name": "Volta às aulas · Casa",
      "status": "ENDED",
      "products": [
        {
          "id": "1729432087292775309",
          "title": "Mixer de mão 500 W",
          "main_image_url": PRODUCT_IMAGES["61"],
          "commission": {
            "rate": 1300,
            "amount": "19.49",
            "currency": "BRL"
          }
        },
        {
          "id": "1729432087292775311",
          "title": "Marmita térmica inox 3 andares",
          "main_image_url": PRODUCT_IMAGES["65"],
          "commission": {
            "rate": 1900,
            "amount": "18.98",
            "currency": "BRL"
          }
        }
      ]
    }
  ]
} as unknown as T.SearchCreatorTargetCollaborationsData;
export const getCreatorApplicableSampleLabelFixture = {
  "label": {
    "can_apply": true,
    "status": "ONGOING",
    "application_id": "86427198341982134",
    "reach_limit": true,
    "sample_product": {
      "sample_sku_list": [
        {
          "id": "1731055098570377347",
          "sale_property_value_ids": "7068196393634072325",
          "price": {
            "amount": "7588986",
            "currency": "USD"
          },
          "sale_properties": [
            {
              "id": "100000",
              "name": "color",
              "value_id": "7425668826861520646",
              "value_name": "Default"
            }
          ],
          "is_available": true,
          "unavailable_reason": "IS_PREORDER"
        }
      ]
    }
  }
} as unknown as T.GetCreatorApplicableSampleLabelData;
export const searchCreatorSampleApplicationsFixture = {
  "next_page_token": "",
  "sample_applications": [
    {
      "id": "8070590921506065180",
      "sample_product": {
        "id": "1729432087292775304",
        "sku_id": "1729480364147774360",
        "sku_sale_property_value_names": "vermelho, tamanho único"
      },
      "main_order_id": "13444220",
      "activity_id": "13456670",
      "status": "PENDING",
      "creator_fulfillment": {
        "id": "123450",
        "expiration_time": 1758326400,
        "total_suspend_duration": 0,
        "status": "PENDING",
        "bound_product_status": "LIVE"
      }
    },
    {
      "id": "8070590921506065181",
      "sample_product": {
        "id": "1729432087292775410",
        "sku_id": "1729480364147774361",
        "sku_sale_property_value_names": "branco, 26 cm"
      },
      "main_order_id": "13444221",
      "activity_id": "13456671",
      "status": "AWAITING_SHIPMENT",
      "creator_fulfillment": {
        "id": "123451",
        "expiration_time": 1758412800,
        "total_suspend_duration": 0,
        "status": "PENDING",
        "bound_product_status": "LIVE"
      }
    },
    {
      "id": "8070590921506065182",
      "sample_product": {
        "id": "1729432087292775391",
        "sku_id": "1729480364147774362",
        "sku_sale_property_value_names": "branco/vermelho, 40"
      },
      "main_order_id": "13444222",
      "activity_id": "13456672",
      "status": "SHIPPED",
      "creator_fulfillment": {
        "id": "123452",
        "expiration_time": 1758499200,
        "total_suspend_duration": 0,
        "status": "PENDING",
        "bound_product_status": "LIVE"
      }
    },
    {
      "id": "8070590921506065183",
      "sample_product": {
        "id": "1729432087292775302",
        "sku_id": "1729480364147774363",
        "sku_sale_property_value_names": "nude, 12 cores"
      },
      "main_order_id": "13444223",
      "activity_id": "13456673",
      "status": "CONTENT_PENDING",
      "creator_fulfillment": {
        "id": "123453",
        "expiration_time": 1758585600,
        "total_suspend_duration": 0,
        "status": "PENDING",
        "bound_product_status": "LIVE"
      }
    },
    {
      "id": "8070590921506065184",
      "sample_product": {
        "id": "1729432087292775361",
        "sku_id": "1729480364147774364",
        "sku_sale_property_value_names": "preto, 500 W"
      },
      "main_order_id": "13444224",
      "activity_id": "13456674",
      "status": "COMPLETED",
      "creator_fulfillment": {
        "id": "123454",
        "expiration_time": 1758672000,
        "total_suspend_duration": 0,
        "status": "SUCCEED",
        "bound_product_status": "LIVE"
      }
    },
    {
      "id": "8070590921506065185",
      "sample_product": {
        "id": "1729432087292775365",
        "sku_id": "1729480364147774365",
        "sku_sale_property_value_names": "inox, 3 andares"
      },
      "main_order_id": "13444225",
      "activity_id": "13456675",
      "status": "REJECT_CANCELLED",
      "creator_fulfillment": {
        "id": "123455",
        "expiration_time": 1758758400,
        "total_suspend_duration": 0,
        "status": "PENDING",
        "bound_product_status": "LIVE"
      }
    }
  ]
} as unknown as T.SearchCreatorSampleApplicationsData;
export const getCreatorSampleApplicationDetailFixture = {
  "sample_application": {
    "id": "8070590921506065183",
    "create_time": 1731298837,
    "sample_product": {
      "id": "1729863469568985219",
      "sku_id": "1729480364147774364",
      "sku_sale_property_value_names": "\"red, large size\""
    },
    "main_order_id": "57871819384716917",
    "activity_id": "74378918272345199",
    "type": "FREE_SAMPLE",
    "status": "PENDING",
    "creator_fulfillment": {
      "id": "87147319238415178",
      "expiration_time": 1726301400,
      "total_suspend_duration": 7641234,
      "status": "PENDING"
    }
  }
} as unknown as T.GetCreatorSampleApplicationDetailData;
export const creatorSearchSampleApplicationFulfillmentsFixture = {
  "fulfillments": [
    {
      "id": "123456",
      "shop_id": "123456",
      "application_id": "123456",
      "sample_application_type": "FREE_SAMPLE",
      "product_id": "123456",
      "expiration_time": 1728542813,
      "total_suspend_duration": 100020,
      "status": "ONGOING",
      "bound_product_status": "LIVE"
    }
  ]
} as unknown as T.CreatorSearchSampleApplicationFulfillmentsData;
export const creatorGenerateGeneralLinkFixture = {
  "sharing_links": [
    {
      "material_id": "7362840009596339971",
      "sharing_link": "https://www.tiktok.com/view/product/1730958349688804006?chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007518161308526446350%22%2C%22sc%22%3A%22OPEN_API%22%7D&scene=pdp&utm_source=open_api&trackParams=%7B%22enter_from_info%22%3A%22product_share_outside%22%2C%22source_page_type%22%3A%22product_share%22%2C%22enable_shop_tab_popup%22%3A1%7D&share_app_id=1233",
      "deep_link": "snssdk1180://ec/pdp?biz_type=0&enter_method=web&gd_label=click_wap_p_product_detail_t_launch_pop_up_s__e__f__fp__fps_affiliate_links_rf_&h5_start_ts=1768977752558&is_commerce=1&jump_time=1768977752558&need_mall=1&needlaunchlog=1&o_app_code=abcsadaadada&page_name=reflow_pdp&page_name=product_detail&params_url=https%3A%2F%2Fshop-id.tokopedia.com%2Fview%2Fproduct%2F1730831248044885504%3Fchain_key%3D%257B%2522event_id%2522%253A%2522o_event_id%2522%252C%2522k%2522%253A%2522000000000000000007596668298679682828%2522%252C%2522sc%2522%253A%2522OPEN_API%2522%252C%2522t%2522%253A1%257D%26div_media_source%3Daffiliate%26event_id%3Do_event_id%26landing_page_name%3Dproduct_detail%26landpage_form%3Dhalf%26page_name%3Dproduct_detail%26scene%3Dpdp%26share_app_id%3D1180%26sticky_diversion_config%3D%257B%2522merge_action%2522%253A%2522\n",
      "one_link": "https://snssdk1180.onelink.me/BAuo?params_url=https%3A%2F%2Fshop-id.tokopedia.com%2Fview%2Fproduct%2F1730831248044885504%3Fchain_key%3D%257B%2522event_id%2522%253A%2522o_event_id%2522%252C%2522k%2522%253A%2522000000000000000007596668298679682828%2522%252C%2522sc%2522%253A%2522OPEN_API%2522%252C%2522t%2522%253A1%257D%26div_media_source%3Daffiliate%26event_id%3Do_event_id%26landing_page_name%3Dproduct_detail%26landpage_form%3Dhalf%26page_name%3Dproduct_detail%26scene%3Dpdp%26share_app_id%3D1180%26sticky_diversion_config%3D%257B%2522merge_action%2522%253A%2522merge%2522%252C%2522data%2522%253A%257B%2522channel%2522%253A%255B%2522benefit_hub%2522%255D%257D%252C%2522is_sticky%2522%253A1%257D%26touch_point_product_id%3D1730831248044885504%26trackParams%3D%257B%2522enter_from_info%2522%253A%2522product_share_outside%2522%252C%2522source_page_type%2522%253A%2522product_share%2522%252C%2522enable_shop_tab_popup%2522%253A1%257D%26utm_source%3Dopen_api\n"
    }
  ],
  "failed_materials": [
    {
      "material_id": "7362840009596339972",
      "fail_reason": "Product was sold out"
    }
  ]
} as unknown as T.CreatorGenerateGeneralLinkData;
export const creatorGeneratePublisherLinkFixture = {
  "sharing_links": [
    {
      "material_id": 7362840009596339971,
      "sharing_link": "https://www.tiktok.com/t/AIxvOHlaJoKO",
      "deep_link": "snssdk1180://ec/pdp?biz_type=0&enter_method=web&gd_label=click_wap_p_product_detail_t_launch_pop_up_s__e__f__fp__fps_affiliate_links_rf_&h5_start_ts=1768977752558&is_commerce=1&jump_time=1768977752558&need_mall=1&needlaunchlog=1&o_app_code=abcsadaadada&page_name=reflow_pdp&page_name=product_detail&params_url=https%3A%2F%2Fshop-id.tokopedia.com%2Fview%2Fproduct%2F1730831248044885504%3Fchain_key%3D%257B%2522event_id%2522%253A%2522o_event_id%2522%252C%2522k%2522%253A%2522000000000000000007596668298679682828%2522%252C%2522sc%2522%253A%2522OPEN_API%2522%252C%2522t%2522%253A1%257D%26div_media_source%3Daffiliate%26event_id%3Do_event_id%26landing_page_name%3Dproduct_detail%26landpage_form%3Dhalf%26page_name%3Dproduct_detail%26scene%3Dpdp%26share_app_id%3D1180%26sticky_diversion_config%3D%257B%2522merge_action%2522%253A%2522\n",
      "one_link": "https://snssdk1180.onelink.me/BAuo?params_url=https%3A%2F%2Fshop-id.tokopedia.com%2Fview%2Fproduct%2F1730831248044885504%3Fchain_key%3D%257B%2522event_id%2522%253A%2522o_event_id%2522%252C%2522k%2522%253A%2522000000000000000007596668298679682828%2522%252C%2522sc%2522%253A%2522OPEN_API%2522%252C%2522t%2522%253A1%257D%26div_media_source%3Daffiliate%26event_id%3Do_event_id%26landing_page_name%3Dproduct_detail%26landpage_form%3Dhalf%26page_name%3Dproduct_detail%26scene%3Dpdp%26share_app_id%3D1180%26sticky_diversion_config%3D%257B%2522merge_action%2522%253A%2522merge%2522%252C%2522data%2522%253A%257B%2522channel%2522%253A%255B%2522benefit_hub%2522%255D%257D%252C%2522is_sticky%2522%253A1%257D%26touch_point_product_id%3D1730831248044885504%26trackParams%3D%257B%2522enter_from_info%2522%253A%2522product_share_outside%2522%252C%2522source_page_type%2522%253A%2522product_share%2522%252C%2522enable_shop_tab_popup%2522%253A1%257D%26utm_source%3Dopen_api\n"
    }
  ],
  "failed_materials": [
    {
      "material_id": "7362840009596339923",
      "fail_reason": "The product was sold out"
    }
  ]
} as unknown as T.CreatorGeneratePublisherLinkData;
export const getShopProductsFixture = {
  "products": [
    {
      "id": "1729592969712207012",
      "title": "Batom matte vermelho longa duração",
      "price": {
        "amount": "39.90",
        "currency": "BRL"
      },
      "added_status": "ADDED",
      "brand_name": "Nuance",
      "images": [
        {
          "url": PRODUCT_IMAGES["4"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 28470
    },
    {
      "id": "1729592969712207013",
      "title": "Paleta de sombras 18 cores",
      "price": {
        "amount": "79.90",
        "currency": "BRL"
      },
      "added_status": "ADDABLE",
      "brand_name": "Nuance",
      "images": [
        {
          "url": PRODUCT_IMAGES["2"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 15380
    },
    {
      "id": "1729592969712207014",
      "title": "Ring light de mesa com tripé 26 cm",
      "price": {
        "amount": "129.90",
        "currency": "BRL"
      },
      "added_status": "ADDABLE",
      "brand_name": "CreatorKit",
      "images": [
        {
          "url": PRODUCT_IMAGES["110"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 15230
    },
    {
      "id": "1729592969712207015",
      "title": "Bastão de selfie retrátil",
      "price": {
        "amount": "69.90",
        "currency": "BRL"
      },
      "added_status": "ADDED",
      "brand_name": "CreatorKit",
      "images": [
        {
          "url": PRODUCT_IMAGES["111"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 8930
    },
    {
      "id": "1729592969712207016",
      "title": "Tênis esportivo branco e vermelho",
      "price": {
        "amount": "259.90",
        "currency": "BRL"
      },
      "added_status": "ADDABLE",
      "brand_name": "Stride",
      "images": [
        {
          "url": PRODUCT_IMAGES["91"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 6280
    },
    {
      "id": "1729592969712207017",
      "title": "Relógio pulseira de couro marrom",
      "price": {
        "amount": "199.00",
        "currency": "BRL"
      },
      "added_status": "ADDABLE",
      "brand_name": "TempoTech",
      "images": [
        {
          "url": PRODUCT_IMAGES["93"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 7180
    },
    {
      "id": "1729592969712207018",
      "title": "Mixer de mão 3 velocidades 500W",
      "price": {
        "amount": "149.90",
        "currency": "BRL"
      },
      "added_status": "ADDED",
      "brand_name": "CozinhaMais",
      "images": [
        {
          "url": PRODUCT_IMAGES["61"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 5410
    },
    {
      "id": "1729592969712207019",
      "title": "Marmita térmica inox 3 andares",
      "price": {
        "amount": "99.90",
        "currency": "BRL"
      },
      "added_status": "ADDABLE",
      "brand_name": "CasaViva",
      "images": [
        {
          "url": PRODUCT_IMAGES["65"],
          "width": 360,
          "height": 360
        }
      ],
      "sales_count": 8120
    }
  ],
  "total_count": 8,
  "next_page_token": ""
} as unknown as T.GetShopProductsData;
export const searchMusicFixture = {
  "music": [
    {
      "id": "717294069642063450",
      "title": "Verão na Praia",
      "author": "Duo Maré",
      "cover_thumb": {
        "url_list": [
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjNiNmIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3YzJkNWEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjYiIGZpbGw9IiMwMDAiIG9wYWNpdHk9Ii4yOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxOCIgeT0iMTgyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNTgiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45MiI+VjwvdGV4dD48L3N2Zz4="
        ]
      },
      "duration": "168",
      "play_url": {
        "url_list": [
          ""
        ]
      }
    },
    {
      "id": "717294069642063451",
      "title": "Batida da Cidade",
      "author": "MC Rafa",
      "cover_thumb": {
        "url_list": [
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMyNTYzZWIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxZTFiNGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjYiIGZpbGw9IiMwMDAiIG9wYWNpdHk9Ii4yOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxOCIgeT0iMTgyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNTgiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45MiI+QjwvdGV4dD48L3N2Zz4="
        ]
      },
      "duration": "142",
      "play_url": {
        "url_list": [
          ""
        ]
      }
    },
    {
      "id": "717294069642063452",
      "title": "Luz de Neon",
      "author": "Aurora Livre",
      "cover_thumb": {
        "url_list": [
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNhODU1ZjciLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzYjA3NjQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjYiIGZpbGw9IiMwMDAiIG9wYWNpdHk9Ii4yOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxOCIgeT0iMTgyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNTgiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45MiI+TDwvdGV4dD48L3N2Zz4="
        ]
      },
      "duration": "195",
      "play_url": {
        "url_list": [
          ""
        ]
      }
    },
    {
      "id": "717294069642063453",
      "title": "Manhã Leve",
      "author": "Céu Aberto",
      "cover_thumb": {
        "url_list": [
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmNTllMGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3YzJkMTIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjYiIGZpbGw9IiMwMDAiIG9wYWNpdHk9Ii4yOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxOCIgeT0iMTgyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNTgiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45MiI+TTwvdGV4dD48L3N2Zz4="
        ]
      },
      "duration": "203",
      "play_url": {
        "url_list": [
          ""
        ]
      }
    },
    {
      "id": "717294069642063454",
      "title": "Passo Certo",
      "author": "Grupo Trilha",
      "cover_thumb": {
        "url_list": [
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMxMGI5ODEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNjRlM2IiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjYiIGZpbGw9IiMwMDAiIG9wYWNpdHk9Ii4yOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxOCIgeT0iMTgyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNTgiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45MiI+UDwvdGV4dD48L3N2Zz4="
        ]
      },
      "duration": "157",
      "play_url": {
        "url_list": [
          ""
        ]
      }
    },
    {
      "id": "717294069642063455",
      "title": "Depois do Show",
      "author": "Nina Costa",
      "cover_thumb": {
        "url_list": [
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlYzQ4OTkiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1MDA3MjQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjYiIGZpbGw9IiMwMDAiIG9wYWNpdHk9Ii4yOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiLz48dGV4dCB4PSIxOCIgeT0iMTgyIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNTgiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii45MiI+RDwvdGV4dD48L3N2Zz4="
        ]
      },
      "duration": "221",
      "play_url": {
        "url_list": [
          ""
        ]
      }
    }
  ],
  "next_page_token": "",
  "has_more": false,
  "search_id": "2026092118000000000DEMO"
} as unknown as T.SearchMusicData;
export const uploadFileInitFixture = {
  "upload_url": "https://open-api.tiktokglobalshop.com/file/202512/upload",
  "upload_token": "example_upload_token_4f7a9c2e8b1d"
} as unknown as T.UploadFileInitData;
export const uploadShoppableVideoFileFixture = {
  "video_file": {
    "id": "123123123123",
    "md5": "D41D8CD98F00B204E9800998ECF8427E"
  }
} as unknown as T.UploadShoppableVideoFileData;
export const uploadShoppablePhotoFileFixture = {
  "photo_file": {
    "photo_uri": "skldjfskdlfjlskdfs000023423s"
  }
} as unknown as T.UploadShoppablePhotoFileData;
export const precheckVideoContentFixture = {
  "precheck": {
    "task_id": "1123123123"
  }
} as unknown as T.PrecheckVideoContentData;
export const getShoppableVideoPrecheckResultFixture = {
  "precheck_task": {
    "id": "7493990579714164574",
    "violation_check_result": {
      "status": "SUCCESS",
      "issues": []
    },
    "good_quality_check_result": {
      "status": "SUCCESS",
      "issues": [
        {
          "code": "MULTI_ANGLE_SUGGESTION",
          "suggestions": "O vídeo está aprovado. Mostrar o produto em mais de um ângulo tende a aumentar a conversão."
        }
      ]
    }
  }
} as unknown as T.GetShoppableVideoPrecheckResultData;
export const postShoppableVideoFixture = {
  "video": {
    "id": "7548431509997292816"
  },
  "quota": "3/day"
} as unknown as T.PostShoppableVideoData;
export const postShoppablePhotosFixture = {
  "photo": {
    "photo_post_id": "34234234234324342"
  },
  "quota": "3/day"
} as unknown as T.PostShoppablePhotosData;
export const getShoppableVideoStatusFixture = {
  "video": {
    "id": "7493990579714164574",
    "post_status": "SUCCESS",
    "post_time": 1758153600
  }
} as unknown as T.GetShoppableVideoStatusData;
export const getVideoPerformancesFixture = {
  "videos": [
    {
      "id": "7271486684427046149",
      "performances": [
        {
          "time_range": { "start_time": 1785542400, "end_time": 1787615940 },
          "metrics": {
            "anchor_display_rate": "0.55",
            "click_through_rate": "0.09",
            "order_count": 4,
            "item_sold_count": 5,
            "gmv": { "amount": "420.00", "currency": "BRL" }
          }
        }
      ]
    },
    {
      "id": "7271486684427046250",
      "performances": [
        {
          "time_range": { "start_time": 1785542400, "end_time": 1787615940 },
          "metrics": {
            "anchor_display_rate": "0.62",
            "click_through_rate": "0.11",
            "order_count": 3,
            "item_sold_count": 4,
            "gmv": { "amount": "480.00", "currency": "BRL" }
          }
        }
      ]
    },
    {
      "id": "7271486684427046351",
      "performances": [
        {
          "time_range": { "start_time": 1785542400, "end_time": 1787615940 },
          "metrics": {
            "anchor_display_rate": "0.40",
            "click_through_rate": "0.05",
            "order_count": 5,
            "item_sold_count": 5,
            "gmv": { "amount": "160.00", "currency": "BRL" }
          }
        }
      ]
    },
    {
      "id": "7271486684427046452",
      "performances": [
        {
          "time_range": { "start_time": 1785542400, "end_time": 1787615940 },
          "metrics": {
            "anchor_display_rate": "0.70",
            "click_through_rate": "0.14",
            "order_count": 6,
            "item_sold_count": 7,
            "gmv": { "amount": "850.00", "currency": "BRL" }
          }
        }
      ]
    },
    {
      "id": "7271486684427046553",
      "performances": [
        {
          "time_range": { "start_time": 1785542400, "end_time": 1787615940 },
          "metrics": {
            "anchor_display_rate": "0.30",
            "click_through_rate": "0.03",
            "order_count": 1,
            "item_sold_count": 1,
            "gmv": { "amount": "60.00", "currency": "BRL" }
          }
        }
      ]
    }
  ]
} as unknown as T.GetVideoPerformancesData;
export const getLiveRoomCoreStatsFixture = {
  "stats": {
    "sales": 123,
    "local_gmv": {
      "amount": "123.45",
      "currency": "USD"
    },
    "created_order_count": 123,
    "current_visitor_count": 123,
    "paid_order_count": 123,
    "local_unit_price": {
      "amount": "12.34",
      "currency": "USD"
    },
    "product_reach_count": 123,
    "watch_pv": 123,
    "click_through_rate": "0.11",
    "accumulated_new_follower_count": 123,
    "buyer_count": 123,
    "accumulated_comment_count": 123,
    "product_view_count": 123,
    "click_order_rate": "0.11",
    "avg_watching_duration": 123,
    "accumulated_sharing_count": 123,
    "peak_concurrent_user_count": 123
  }
} as unknown as T.GetLiveRoomCoreStatsData;
export const getLiveRoomGmvTrendFixture = {
  "gmv_trend_performances": [
    {
      "stats_type": "TREND_GMV",
      "data_points": [
        {
          "order_count": 123,
          "timestamp": 1623812664,
          "gmv": {
            "currency": "USD",
            "amount": "123.45"
          }
        }
      ]
    }
  ]
} as unknown as T.GetLiveRoomGmvTrendData;
export const getLiveRoomViewTrendsFixture = {
  "view_trend_performances": [
    {
      "stats_type": "TREND_ONLINE_VIEWER",
      "data_points": [
        {
          "value": "123",
          "timestamp": 1623812664
        }
      ]
    }
  ]
} as unknown as T.GetLiveRoomViewTrendsData;
export const getLiveRoomTrafficPerformanceFixture = {
  "traffic_performances": [
    {
      "source": {
        "name": "card_click",
        "watch_pv": 123
      },
      "sub_sources": [
        {
          "name": "card_click",
          "watch_pv": 123
        }
      ]
    }
  ]
} as unknown as T.GetLiveRoomTrafficPerformanceData;
export const getLiveRoomInteractiveTrendsFixture = {
  "interactive_trend_performances": [
    {
      "stats_type": "WATCH_PV",
      "data_points": [
        {
          "value": "456",
          "timestamp": 1623812664
        }
      ]
    }
  ]
} as unknown as T.GetLiveRoomInteractiveTrendsData;
export const getLiveRoomProductStatsFixture = {
  "product_stats": [
    {
      "main_image_url": PRODUCT_IMAGES["111"] + "",
      "product_id": "1732333333333333629",
      "is_live": true,
      "click_through_rate": "0.11",
      "sellable_region": "ID",
      "created_order_count": 123,
      "exposure_count": 123,
      "total_click_count": 123,
      "local_gmv": {
        "amount": "123.45",
        "currency": "USD"
      },
      "product_name": "Wireless Charging Stand",
      "local_unit_price": {
        "amount": "12.34",
        "currency": "USD"
      },
      "paid_order_count": 123,
      "inventory_left_count": 123,
      "inventory_consumption_count": 123,
      "created_order_user_count": 123,
      "paid_user_count": 123,
      "click_order_rate": "0.11"
    }
  ]
} as unknown as T.GetLiveRoomProductStatsData;
export const getLiveRoomUserPortraitsFixture = {
  "all_ads_gender_indicators": [
    {
      "type": "USER_PORTRAIT_GENDER_UNKNOWN",
      "value": "123"
    }
  ],
  "all_fan_indicators": [
    {
      "type": "USER_PORTRAIT_FOLLOWER",
      "value": "123"
    }
  ],
  "all_ads_age_indicators": [
    {
      "type": "USER_PORTRAIT_AGE_LESS_THAN_15",
      "value": "123"
    }
  ],
  "region_indicators": [
    {
      "value": "123",
      "type": "ID"
    }
  ],
  "paid_ads_age_indicators": [
    {
      "type": "USER_PORTRAIT_AGE_LESS_THAN_15",
      "value": "123"
    }
  ],
  "paid_ads_gender_indicators": [
    {
      "type": "USER_PORTRAIT_GENDER_UNKNOWN",
      "value": "123"
    }
  ],
  "paid_fan_indicators": [
    {
      "type": "USER_PORTRAIT_FOLLOWER",
      "value": "123"
    }
  ]
} as unknown as T.GetLiveRoomUserPortraitsData;
export const getTokoProductMappersFixture = {
  "error": {
    "code": 1,
    "message": "empty_product_id"
  },
  "product": [
    {
      "toko_pid": 2177906740,
      "tts_pid": 1735209287836402920
    }
  ]
} as unknown as T.GetTokoProductMappersData;
export const tokoProductMapperV2Fixture = {
  "error": {
    "code": 1,
    "message": "empty_product_id"
  },
  "product": [
    {
      "toko_pid": 2177906740,
      "tts_pid": 1735209287836402920
    }
  ]
} as unknown as T.TokoProductMapperV2Data;

export const getLiveRoomInfoFixture = {
  id: "7280670009880123456",
  start_time: 1699900000,
  status: "ONGOING",
  title: "Live de lançamento — kit skincare",
} as unknown as T.GetLiveRoomInfoData;

export const generateAffiliateSharingLinkFixture = {
  affiliate_sharing_links: [
    { affiliate_sharing_link: "https://www.tiktok.com/t/ZSabc12345/", tag: "video-01" },
  ],
  errors: [],
} as unknown as T.GenerateAffiliateSharingLinkData;

/**
 * Catálogo de produtos para promover (Creator Select Affiliate Product).
 *
 * Escrito à mão, não gerado da doc: a doc não traz exemplo de resposta para
 * este endpoint, e sem fixture a aba "Produtos para promover" da Descoberta
 * abria em erro.
 *
 * `main_image_url` é omitido de propósito. O `ProductImage` cai num ícone de
 * pacote quando não há imagem, e numa feira sem Wi-Fi isso é melhor que doze
 * imagens quebradas — uma URL de CDN da TikTok não carrega offline.
 *
 * `commission.rate` é centésimo de % (o app divide por 10000): 1800 = 18,00%.
 */
export const creatorSelectAffiliateProductFixture = {
  "next_page_token": "",
  "total_count": 12,
  "products": [
    {
      "id": "1729432087292775304",
      "title": "Batom matte vermelho longa duração",
      "brand_name": "Nuance",
      "main_image_url": PRODUCT_IMAGES["4"],
      "commission": {
        "amount": "9.97",
        "rate": 2500
      },
      "price": {
        "floor_price": "39.90",
        "ceiling_price": "49.90",
        "currency": "BRL"
      },
      "review": {
        "count": 7210,
        "overall_score": "4.8"
      },
      "shop": {
        "name": "Nuance Beauty",
        "rating": "4.9"
      },
      "stock": {
        "quantity": 890
      },
      "market_performance": {
        "historical_sold_quantity": 28470
      }
    },
    {
      "id": "1729432087292775302",
      "title": "Paleta de sombras 18 cores com espelho",
      "brand_name": "Nuance",
      "main_image_url": PRODUCT_IMAGES["2"],
      "commission": {
        "amount": "17.58",
        "rate": 2200
      },
      "price": {
        "floor_price": "79.90",
        "ceiling_price": "99.90",
        "currency": "BRL"
      },
      "review": {
        "count": 4126,
        "overall_score": "4.7"
      },
      "shop": {
        "name": "Nuance Beauty",
        "rating": "4.9"
      },
      "stock": {
        "quantity": 410
      },
      "market_performance": {
        "historical_sold_quantity": 15380
      }
    },
    {
      "id": "1729432087292775303",
      "title": "Pó compacto translúcido efeito matte",
      "brand_name": "Bella Derm",
      "main_image_url": PRODUCT_IMAGES["3"],
      "commission": {
        "amount": "9.88",
        "rate": 1800
      },
      "price": {
        "floor_price": "54.90",
        "ceiling_price": "64.90",
        "currency": "BRL"
      },
      "review": {
        "count": 3305,
        "overall_score": "4.6"
      },
      "shop": {
        "name": "Bella Derm Oficial",
        "rating": "4.8"
      },
      "stock": {
        "quantity": 520
      },
      "market_performance": {
        "historical_sold_quantity": 11250
      }
    },
    {
      "id": "1729432087292775305",
      "title": "Esmalte vermelho efeito gel 8ml",
      "brand_name": "Bella Derm",
      "main_image_url": PRODUCT_IMAGES["5"],
      "commission": {
        "amount": "6.97",
        "rate": 2800
      },
      "price": {
        "floor_price": "24.90",
        "ceiling_price": "29.90",
        "currency": "BRL"
      },
      "review": {
        "count": 1964,
        "overall_score": "4.5"
      },
      "shop": {
        "name": "Bella Derm Oficial",
        "rating": "4.8"
      },
      "stock": {
        "quantity": 640
      },
      "market_performance": {
        "historical_sold_quantity": 9340
      }
    },
    {
      "id": "1729432087292775411",
      "title": "Bastão de selfie retrátil com controle",
      "brand_name": "CreatorKit",
      "main_image_url": PRODUCT_IMAGES["111"],
      "commission": {
        "amount": "11.18",
        "rate": 1600
      },
      "price": {
        "floor_price": "69.90",
        "ceiling_price": "89.90",
        "currency": "BRL"
      },
      "review": {
        "count": 2187,
        "overall_score": "4.6"
      },
      "shop": {
        "name": "CreatorKit Store",
        "rating": "4.7"
      },
      "stock": {
        "quantity": 275
      },
      "market_performance": {
        "historical_sold_quantity": 8930
      }
    },
    {
      "id": "1729432087292775410",
      "title": "Ring light de mesa com tripé 26 cm",
      "brand_name": "CreatorKit",
      "main_image_url": PRODUCT_IMAGES["110"],
      "commission": {
        "amount": "19.48",
        "rate": 1500
      },
      "price": {
        "floor_price": "129.90",
        "ceiling_price": "159.90",
        "currency": "BRL"
      },
      "review": {
        "count": 3844,
        "overall_score": "4.7"
      },
      "shop": {
        "name": "CreatorKit Store",
        "rating": "4.7"
      },
      "stock": {
        "quantity": 190
      },
      "market_performance": {
        "historical_sold_quantity": 15230
      }
    },
    {
      "id": "1729432087292775391",
      "title": "Tênis esportivo branco e vermelho",
      "brand_name": "Stride",
      "main_image_url": PRODUCT_IMAGES["91"],
      "commission": {
        "amount": "28.59",
        "rate": 1100
      },
      "price": {
        "floor_price": "259.90",
        "ceiling_price": "319.90",
        "currency": "BRL"
      },
      "review": {
        "count": 1733,
        "overall_score": "4.5"
      },
      "shop": {
        "name": "Stride Esportes",
        "rating": "4.6"
      },
      "stock": {
        "quantity": 175
      },
      "market_performance": {
        "historical_sold_quantity": 6280
      }
    },
    {
      "id": "1729432087292775393",
      "title": "Relógio pulseira de couro marrom",
      "brand_name": "TempoTech",
      "main_image_url": PRODUCT_IMAGES["93"],
      "commission": {
        "amount": "23.88",
        "rate": 1200
      },
      "price": {
        "floor_price": "199.00",
        "ceiling_price": "249.00",
        "currency": "BRL"
      },
      "review": {
        "count": 2044,
        "overall_score": "4.4"
      },
      "shop": {
        "name": "TempoTech Oficial",
        "rating": "4.5"
      },
      "stock": {
        "quantity": 96
      },
      "market_performance": {
        "historical_sold_quantity": 7180
      }
    },
    {
      "id": "1729432087292775386",
      "title": "Camisa manga curta estampa floral",
      "brand_name": "Urban Fit",
      "main_image_url": PRODUCT_IMAGES["86"],
      "commission": {
        "amount": "17.98",
        "rate": 2000
      },
      "price": {
        "floor_price": "89.90",
        "ceiling_price": "109.90",
        "currency": "BRL"
      },
      "review": {
        "count": 964,
        "overall_score": "4.4"
      },
      "shop": {
        "name": "Urban Fit Store",
        "rating": "4.5"
      },
      "stock": {
        "quantity": 340
      },
      "market_performance": {
        "historical_sold_quantity": 3120
      }
    },
    {
      "id": "1729432087292775361",
      "title": "Mixer de mão 3 velocidades 500W",
      "brand_name": "CozinhaMais",
      "main_image_url": PRODUCT_IMAGES["61"],
      "commission": {
        "amount": "19.49",
        "rate": 1300
      },
      "price": {
        "floor_price": "149.90",
        "ceiling_price": "179.90",
        "currency": "BRL"
      },
      "review": {
        "count": 1502,
        "overall_score": "4.6"
      },
      "shop": {
        "name": "CozinhaMais Casa",
        "rating": "4.7"
      },
      "stock": {
        "quantity": 210
      },
      "market_performance": {
        "historical_sold_quantity": 5410
      }
    },
    {
      "id": "1729432087292775347",
      "title": "Luminária de mesa vintage com cúpula",
      "brand_name": "CasaViva",
      "main_image_url": PRODUCT_IMAGES["47"],
      "commission": {
        "amount": "20.38",
        "rate": 1700
      },
      "price": {
        "floor_price": "119.90",
        "ceiling_price": "149.90",
        "currency": "BRL"
      },
      "review": {
        "count": 1487,
        "overall_score": "4.6"
      },
      "shop": {
        "name": "CasaViva Utilidades",
        "rating": "4.8"
      },
      "stock": {
        "quantity": 260
      },
      "market_performance": {
        "historical_sold_quantity": 4890
      }
    },
    {
      "id": "1729432087292775365",
      "title": "Marmita térmica inox 3 andares",
      "brand_name": "CasaViva",
      "main_image_url": PRODUCT_IMAGES["65"],
      "commission": {
        "amount": "18.98",
        "rate": 1900
      },
      "price": {
        "floor_price": "99.90",
        "ceiling_price": "119.90",
        "currency": "BRL"
      },
      "review": {
        "count": 2530,
        "overall_score": "4.7"
      },
      "shop": {
        "name": "CasaViva Utilidades",
        "rating": "4.8"
      },
      "stock": {
        "quantity": 380
      },
      "market_performance": {
        "historical_sold_quantity": 8120
      }
    }
  ]
} as unknown as T.CreatorSelectAffiliateProductData;

/**
 * Pré-checagem de âncora de produto (Estúdio). Os dois endpoints só devolvem
 * "pode" ou "não pode" — o app lê apenas o `ok`, então o corpo é vazio.
 */
export const checkAnchorPrerequisitesFixture = {} as unknown as Record<string, never>;

export const checkAnchorContentFixture = {} as unknown as Record<string, never>;

/**
 * Deeplink de solicitação de amostra. No mock aponta pro próprio app da TikTok
 * sem parâmetro de sessão: serve pra tela mostrar o botão e o fluxo, não pra
 * abrir um pedido de verdade.
 */
export const creatorGetSampleRequestDeeplinkFixture = {
  "deeplink": "https://www.tiktok.com/view/product/1729432087292775300"
} as unknown as T.CreatorGetSampleRequestDeeplinkData;

export const FIXTURES: Record<string, unknown> = {
  getCreatorProfile: getCreatorProfileFixture,
  getShowcaseProducts: getShowcaseProductsFixture,
  addShowcaseProducts: addShowcaseProductsFixture,
  removeShowcaseProducts: removeShowcaseProductsFixture,
  topShowcaseProducts: topShowcaseProductsFixture,
  searchCreatorAffiliateOrders: searchCreatorAffiliateOrdersFixture,
  creatorSearchAffiliateTraceOrders: creatorSearchAffiliateTraceOrdersFixture,
  creatorSearchOpenCollaborationProduct: creatorSearchOpenCollaborationProductFixture,
  getOpenCollaborationProductListByProductIds: getOpenCollaborationProductListByProductIdsFixture,
  searchCreatorTargetCollaborations: searchCreatorTargetCollaborationsFixture,
  getCreatorApplicableSampleLabel: getCreatorApplicableSampleLabelFixture,
  searchCreatorSampleApplications: searchCreatorSampleApplicationsFixture,
  getCreatorSampleApplicationDetail: getCreatorSampleApplicationDetailFixture,
  creatorSearchSampleApplicationFulfillments: creatorSearchSampleApplicationFulfillmentsFixture,
  creatorGenerateGeneralLink: creatorGenerateGeneralLinkFixture,
  creatorGeneratePublisherLink: creatorGeneratePublisherLinkFixture,
  getShopProducts: getShopProductsFixture,
  searchMusic: searchMusicFixture,
  uploadFileInit: uploadFileInitFixture,
  uploadShoppableVideoFile: uploadShoppableVideoFileFixture,
  uploadShoppablePhotoFile: uploadShoppablePhotoFileFixture,
  precheckVideoContent: precheckVideoContentFixture,
  getShoppableVideoPrecheckResult: getShoppableVideoPrecheckResultFixture,
  postShoppableVideo: postShoppableVideoFixture,
  postShoppablePhotos: postShoppablePhotosFixture,
  getShoppableVideoStatus: getShoppableVideoStatusFixture,
  getVideoPerformances: getVideoPerformancesFixture,
  getLiveRoomCoreStats: getLiveRoomCoreStatsFixture,
  getLiveRoomGmvTrend: getLiveRoomGmvTrendFixture,
  getLiveRoomViewTrends: getLiveRoomViewTrendsFixture,
  getLiveRoomTrafficPerformance: getLiveRoomTrafficPerformanceFixture,
  getLiveRoomInteractiveTrends: getLiveRoomInteractiveTrendsFixture,
  getLiveRoomProductStats: getLiveRoomProductStatsFixture,
  getLiveRoomUserPortraits: getLiveRoomUserPortraitsFixture,
  getTokoProductMappers: getTokoProductMappersFixture,
  tokoProductMapperV2: tokoProductMapperV2Fixture,
  getLiveRoomInfo: getLiveRoomInfoFixture,
  generateAffiliateSharingLink: generateAffiliateSharingLinkFixture,
  creatorSelectAffiliateProduct: creatorSelectAffiliateProductFixture,
  checkAnchorPrerequisites: checkAnchorPrerequisitesFixture,
  checkAnchorContent: checkAnchorContentFixture,
  creatorGetSampleRequestDeeplink: creatorGetSampleRequestDeeplinkFixture,
};
