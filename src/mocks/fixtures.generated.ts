// AUTO-GERADO — mock (data) de cada endpoint.
import type * as T from "@/types/creator-api.generated";

export const getCreatorProfileFixture = {
  "avatar": {
    "width": 100,
    "height": 100,
    "url": "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/d76b8cc1b598de90ad5048df46e672b3~c5_100x100.webp?x-expires=1691895600&x-signature=oAT9KOL7aCN3Did9U%2FoKEsbBDj0%3D"
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
      "id": "53219092314",
      "shop": {
        "name": "Gift store"
      },
      "addition": {
        "customized_main_images": [
          {
            "width": 100,
            "heigth": 100,
            "url": "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/d76b8cc1b598de90ad5048df46e672b3~c5_100x100.webp?x-expires=1691895600&x-signature=oAT9KOL7aCN3Did9U%2FoKEsbBDj0%3D"
          }
        ]
      },
      "price": {
        "original_price": {
          "minimum_amount": "12.21",
          "maximum_amount": "100.00",
          "currency": "USD"
        },
        "seller_discount_price": {
          "minimum_amount": "12.21",
          "maximum_amount": "100.00",
          "currency": "USD"
        },
        "platform_discount_price": {
          "minimum_amount": "12.21",
          "maximum_amount": "100.00",
          "currency": "USD"
        }
      },
      "title": "Chirstmas Gift",
      "main_images": [
        {
          "width": 100,
          "heigth": 100,
          "url": "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/d76b8cc1b598de90ad5048df46e672b3~c5_100x100.webp?x-expires=1691895600&x-signature=oAT9KOL7aCN3Did9U%2FoKEsbBDj0%3D"
        }
      ],
      "status": {
        "inventory_status": "IN_STOCK",
        "review_status": "APPROVED",
        "is_hidden": false,
        "added_status": "ADDED"
      },
      "source": "AFFILIATE",
      "detail_link": "https://shop.tiktok.com/view/product/248901892031?region=US&local=en",
      "third_party_link": "https://storename.myshopify.com/products/gold-bracelet-engraved-with-diamonds",
      "sale_regions": [
        "US"
      ],
      "commission": {
        "rate": 3000,
        "reward_rate": 500
      },
      "collaboration": {
        "id": "7495383576027499219",
        "type": "OPEN",
        "partner": {
          "id": "123456789",
          "name": "Partner Name"
        }
      }
    }
  ],
  "next_page_token": "V231as2V0PTAK",
  "total_count": 15
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
      "create_time": 1685548800,
      "delivery_time": 1685548800,
      "status": "SETTLED",
      "skus": [
        {
          "id": "1729793769377925388",
          "campaign_id": "73661290629",
          "open_collaboration_id": "73661290629",
          "target_collaboration_id": "73661290629",
          "product_name": "black_suit",
          "product_id": "1729793769377859852",
          "price": {
            "amount": "Rp9.900",
            "currency": "IDR"
          },
          "shop_name": "TestCase idl2l",
          "content_type": "LIVE",
          "content_id": "7493990579714164574",
          "quantity": 2,
          "commission_rate": 1000,
          "commission_tier_setting": "3.0 OR 5.0",
          "commission_model": "Tiered commission",
          "commission_bonus_rate": 1000,
          "estimated_commission_base": {
            "amount": "Rp9.900",
            "currency": "IDR"
          },
          "standard_commission_rate": 5000,
          "shop_ads_commission_rate": 5000,
          "estimated_bonus_commission": {
            "amount": "Rp1.00",
            "currency": "IDR"
          },
          "estimated_standard_commission": {
            "amount": "Rp8.000",
            "currency": "IDR"
          },
          "estimated_shop_ads_commission": {
            "amount": "Rp8.000",
            "currency": "IDR"
          },
          "estimated_commission": {
            "amount": "Rp1.980",
            "currency": "IDR"
          },
          "actual_commission": {
            "amount": "Rp1.900",
            "currency": "IDR"
          },
          "actual_bonus_commission": {
            "amount": "Rp2.000",
            "currency": "IDR"
          },
          "actual_commission_base": {
            "amount": "Rp9.900",
            "currency": "IDR"
          },
          "actual_standard_commission": {
            "amount": "Rp5.000",
            "currency": "IDR"
          },
          "actual_shop_ads_commission": {
            "amount": "Rp5.000",
            "currency": "IDR"
          },
          "returned_quantity": 1,
          "refunded_quantity": 0,
          "tag": "test-01",
          "creator_commission_reward_rate": 1000,
          "estimated_creator_commission_reward_fee": {
            "amount": "250",
            "currency": "IDR"
          },
          "actual_creator_commission_reward_fee": {
            "amount": "100",
            "currency": "IRD"
          },
          "isr": {
            "amount": "100",
            "currency": "IRD"
          },
          "iva": {
            "amount": "100",
            "currency": "IRD"
          },
          "pit": {
            "amount": "100",
            "currency": "IRD"
          },
          "shared_with_partner": {
            "amount": "100",
            "currency": "IRD"
          },
          "trace_info": {
            "id": "15678763",
            "type": "SPECIFIC"
          },
          "last_update_time": 1685548800
        }
      ]
    }
  ],
  "next_page_token": "b2Zmc2V0PTEw",
  "total_count": 10
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
          "price": {
            "amount": "Rp9.900",
            "currency": "IDR"
          },
          "quantity": 2,
          "commission_rate": 1000,
          "estimated_commission_base": {
            "amount": "Rp9.900",
            "currency": "IDR"
          },
          "actual_commission": {
            "amount": "Rp1.900",
            "currency": "IDR"
          },
          "shop_ads_commission_rate": 5000,
          "commission_bonus_rate": 1000,
          "product_name": "black suit",
          "shop_name": "TestCase idl2l",
          "returned_quantity": 1,
          "refunded_quantity": 0,
          "campaign_id": "73661290629",
          "actual_commission_base": {
            "amount": "Rp9.900",
            "currency": "IDR"
          },
          "actual_shop_ads_commission": {
            "amount": "Rp5.000",
            "currency": "IDR"
          },
          "estimated_shop_ads_commission": {
            "amount": "Rp8.000",
            "currency": "IDR"
          },
          "estimated_bonus_commission": {
            "amount": "Rp1.00",
            "currency": "IDR"
          },
          "delivery_time": 1685548800,
          "creator_commission_reward_rate": 1000,
          "estimated_creator_commission_reward_fee": {
            "amount": "250",
            "currency": "IDR"
          },
          "actual_creator_commission_reward_fee": {
            "amount": "100",
            "currency": "IDR"
          },
          "content_type": "LIVE",
          "content_id": "7493990579714164574",
          "trace": {
            "id": "15678763",
            "type": "SPECIFIC"
          },
          "estimated_commission": {
            "amount": "1",
            "currency": "USD"
          },
          "actual_bonus_commission": {
            "amount": "1",
            "currency": "USD"
          }
        }
      ],
      "create_time": 1685548800,
      "delivery_time": 1685548800
    }
  ],
  "next_page_token": "b2Zmc2V0PTEw",
  "total_count": 10
} as unknown as T.CreatorSearchAffiliateTraceOrdersData;
export const creatorSearchOpenCollaborationProductFixture = {
  "products": [
    {
      "shop": {
        "name": "Test shop"
      },
      "id": "1729432087292775344",
      "has_inventory": false,
      "units_sold": 12123,
      "title": "Blue t-shirt",
      "sale_region": "ID",
      "main_image_url": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/fa0387fa5a204dcfa44d5be75877a163~tplv-o3syd03w52-origin-webp.webp?from=3478900499",
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591373?region=ID&local=en",
      "original_price": {
        "currency": "USD",
        "minimum_amount": "12.21",
        "maximum_amount": "100.00"
      },
      "category_chains": [
        {
          "id": "343554",
          "local_name": "COMPUTER",
          "is_leaf": false,
          "parent_id": "341182"
        }
      ],
      "commission": {
        "rate": 3000,
        "currency": "USD",
        "amount": "121.32"
      },
      "sales_price": {
        "currency": "USD",
        "minimum_amount": "34.3",
        "maximum_amount": "55.7"
      }
    }
  ],
  "next_page_token": "b2Zmc2V0PTEw",
  "total_count": 10000
} as unknown as T.CreatorSearchOpenCollaborationProductData;
export const getOpenCollaborationProductListByProductIdsFixture = {
  "products": [
    {
      "shop": {
        "name": "Test shop"
      },
      "id": "1729432087292775344",
      "has_inventory": false,
      "units_sold": 12,
      "title": "Blue t-shirt",
      "sale_region": "ID",
      "main_image_url": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/fa0387fa5a204dcfa44d5be75877a163~tplv-o3syd03w52-origin-webp.webp?from=3478900499",
      "detail_link": "https://shop.tiktok.com/view/product/1729624807198591373?region=ID&local=en",
      "original_price": {
        "currency": "USD",
        "minimum_amount": "12.21",
        "maximum_amount": "100.00"
      },
      "category_chains": [
        {
          "id": "3435545",
          "local_name": "COMPUTER",
          "is_leaf": false,
          "parent_id": "12345"
        }
      ],
      "commission": {
        "rate": 100,
        "currency": "USD",
        "amount": "123"
      },
      "sales_price": {
        "currency": "USD",
        "minimum_amount": "34.3",
        "maximum_amount": "55.7"
      },
      "shop_ads_commission": {
        "rate": 100
      }
    }
  ]
} as unknown as T.GetOpenCollaborationProductListByProductIdsData;
export const searchCreatorTargetCollaborationsFixture = {
  "total_count": 100,
  "next_page_token": "b2Zmc2V0PTAK",
  "target_collaborations": [
    {
      "id": "789078671231123124",
      "name": "target_collaboration",
      "status": "LIVE",
      "products": [
        {
          "id": "1729432087292775344",
          "title": "Blue t-shirt",
          "main_image_url": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/fa0387fa5a204dcfa44d5be75877a163~tplv-o3syd03w52-origin-webp.webp?from=3478900499",
          "commission": {
            "rate": 1000,
            "amount": "121.23",
            "currency": "USD"
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
  "next_page_token": "aDU2dHIzMlFhME5CUzJKUDhDdVJhTDM1WmJkeFVTVW9LTkRaSnNaZCtuWjJXVU5CSDhlaA==",
  "sample_applications": [
    {
      "id": "8070590921506065183",
      "sample_product": {
        "id": "1729432087292775344",
        "sku_id": "1729480364147774364",
        "sku_sale_property_value_names": "red, large size"
      },
      "main_order_id": "13444222",
      "activity_id": "13456677",
      "status": "Pending",
      "creator_fulfillment": {
        "id": "123456",
        "expiration_time": 1726301400,
        "total_suspend_duration": 123,
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
          "url": "https://p19-pu-sign-useast8.tiktokcdn-us.com/tos-useast5-avt-0068-tx/982dd6b4e46a6a24203b00611a474cca~c5_1080x1080.webp",
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
          "https://example.com/music/cover/love_story_1.jpg"
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
          "time_range": {
            "start_time": 1704067200,
            "end_time": 1704067200
          },
          "metrics": {
            "anchor_display_rate": "0.64",
            "click_through_rate": "0.08",
            "order_count": 3,
            "item_sold_count": 3,
            "gmv": {
              "amount": "27.85",
              "currency": "USD"
            }
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
      "main_image_url": "https://example.com/images/products/1732333333333333629-main.jpg",
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
};
