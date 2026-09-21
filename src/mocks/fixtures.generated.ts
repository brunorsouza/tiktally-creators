// AUTO-GERADO — mock (data) de cada endpoint.
import type * as T from "@/types/creator-api.generated";
import { PRODUCT_IMAGES } from "@/mocks/productImages.generated";

/**
 * Avatar do creator, SVG embutido.
 *
 * Não é foto de pessoa de propósito: rosto identificável de terceiro em material
 * de feira é o pior dos casos, e a tela de Perfil só precisa de um avatar que
 * não quebre offline.
 */
const AVATAR_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjNiNmIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3YzJkNWEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcng9IjYwIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNjAiIHk9Ijc2IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFCPC90ZXh0Pjwvc3ZnPg==";

export const getCreatorProfileFixture = {
  "avatar": {
    "width": 100,
    "height": 100,
    "url": AVATAR_DATA_URI
  },
  "username": "abc123",
  "selection_region": "US",
  "register_region": "US",
  "seller_type": "LOCAL",
  "permissions": [
    "LIVE_STREAM_PERMISSION",
    "SELF_SALE_PERMISSION",
    "ADD_AFFILIATE_PERMISSION"
  ],
  "user_type": "TIKTOK_SHOP_OFFICIAL_ACCOUNT",
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
export const addShowcaseProductsFixture = {
  "errors": [
    {
      "code": 16001001,
      "message": "Encounter network error, please try again.",
      "detail": {
        "product_id": "12390753231"
      }
    }
  ]
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
      "status": "ORDERED",
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
      "status": "ORDERED",
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
        "status": "FINISHED",
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
      "title": "testcase autotest Live Product",
      "price": {
        "amount": "56.00",
        "currency": "USD"
      },
      "added_status": "ADDABLE\n",
      "brand_name": "Apple",
      "images": [
        {
          "url": AVATAR_DATA_URI,
          "width": 200,
          "height": 200
        }
      ],
      "sales_count": 33
    }
  ],
  "total_count": 300,
  "next_page_token": "b2Zmc2V0PTAK"
} as unknown as T.GetShopProductsData;
export const searchMusicFixture = {
  "music": [
    {
      "id": "717294069642063456",
      "title": "Love Story",
      "author": "Taylor Swift",
      "cover_thumb": {
        "url_list": [
          PRODUCT_IMAGES["5"] + ""
        ]
      },
      "duration": "235",
      "play_url": {
        "url_list": [
          "https://example.com/music/play/love_story.mp3"
        ]
      }
    }
  ],
  "next_page_token": "40",
  "has_more": false,
  "search_id": "2026021821534288157A7F308E8C81359B"
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
      "status": "FAIL",
      "issues": [
        {
          "risk": "Pirated Content",
          "suggestions": "Your video may include unoriginal content. Creating original content is essential for standing out from the crowd."
        }
      ]
    },
    "good_quality_check_result": {
      "status": "FAIL",
      "issues": [
        {
          "code": "LOW_CONTENT_PROMOTIO",
          "suggestions": "You can try to showcase the product from multiple perspectives."
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
    "post_status": "FAIL",
    "post_time": 1685548800
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
