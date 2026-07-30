# TikTok Shop — Affiliate Creator API (Referência completa)

> **O que é este documento.** Mapa completo de **todos os endpoints da API do TikTok Shop que
> operam no contexto de _creator_** (afiliado) — os que exigem um **access token de creator**
> (`user_type = 1`), e **não** um token de seller. Cobre request (path / header / query / body) e
> response de cada endpoint, com escopos, exemplos e códigos de erro.
>
> **Fonte:** documentação oficial do TikTok Shop Partner Center
> (`partner.tiktokshop.com/docv2`, API Reference). Extraído de forma programática da API interna
> de docs (`/api/v1/document/api_meta`, `locale=en-US`) — as descrições dos parâmetros estão em
> inglês, exatamente como na doc oficial. Script de reprodução em `scratchpad/creator-api/`.
>
> **Cobertura:** 36 endpoints. Varredura feita sobre os **327 endpoints** do catálogo
> inteiro, filtrando por token de creator — nada de creator ficou de fora. (Dois falsos-positivos
> de escopo _seller_ foram excluídos: `confirm-package-shipment`, `product-auditing-research`.)

---

## ⚠️ Antes de construir: 2 pontos de atenção

1. **Disponibilidade regional.** O overview oficial diz que as Affiliate APIs **não** existem em
   **UK/EU**, e a elegibilidade de creator afiliado é descrita como **US / UK / SEA** (os exemplos
   da doc vêm em `IDR`/`SGD`). O programa de afiliados existe forte na **TikTok Shop Brasil** na
   prática, então o texto provavelmente está desatualizado — mas **confirme no seu Partner Center**
   que o app tem o produto _Affiliate Creator_ liberado para a região **BR** antes de investir.
2. **Autorização é separada do seller.** Creator ≠ seller. É outro fluxo de OAuth, com **token de
   creator** (`user_type = 1`) e **escopos `creator.*`** próprios. Provável que você precise
   adicionar esses pacotes de escopo ao app (ou registrar um app dedicado). A assinatura HMAC é a
   mesma do TikTally de hoje (dá pra reusar `supabase/functions/_shared/tiktokSign.ts`).

---

## Modelo de autenticação

| Aspecto | Seller (TikTally hoje) | **Creator (este doc)** |
|---|---|---|
| Access token | `user_type = 0` | **`user_type = 1`** (token de creator) |
| `shop_cipher` na query | **Obrigatório** | **Não usa** (nenhum dos 36 endpoints) |
| Escopos | `seller.*`, `data.shop_analytics.*` | **`creator.*`** |
| Base URL | `https://open-api.tiktokglobalshop.com` | igual |
| Assinatura | HMAC-SHA256 (`sign`) | igual |
| Header do token | `x-tts-access-token` | igual |

Fluxo: o **creator autoriza o app** → você troca o code por um **creator access_token**
(`user_type = 1`) via _Get Access Token_ → usa esse token no header `x-tts-access-token`. O token
identifica o creator; por isso os endpoints **não** pedem `shop_cipher`.

## Escopos (pacotes de autorização)

Os 36 endpoints usam os escopos abaixo. **`creator.video.write` (Content Posting) é
um escopo sensível** — permite publicar conteúdo na conta do creator, então costuma exigir revisão
extra na aprovação do app.

| Escopo (`scope_key`) | Pacote | Descrição |
|---|---|---|
| `creator.affiliate.info` | Affiliate Information | The application will be able to access your TikTok Shop Affiliate information, including creator profile, live room metrics, and products added/sold. |
| `creator.affiliate.share_link.read` | Read Affiliate Share Link | The application will be able to generate commissionable and trackable share links on behalf of creators. Orders placed through these links will be attributed to the respective creators, who will receive commission earnings accordingly. Also allows the application to retrieve affiliate orders that include the corresponding tracking parameters for accurate attribution and performance analysis. |
| `creator.affiliate_collaboration.read` | Read Creator Affiliate Collaborations | The application will be able to get details regarding your collaborations, including searching collaborations, tracking collaboration performance, receiving collaboration detaiIs and updates, and querying sample applications and related fulfillment details. |
| `creator.data.live.read.public` | Live Data | The application will be able to access your Live performance and engagement data such as GMV generated, items sold, engagement trends. |
| `creator.showcase.read` | Read Showcase Products | The application will be able to access up to 2000 products in the creators showcase. |
| `creator.showcase.write` | Manage Showcase Products | The application will be able to manage the creator's products within the livestream such as adding, removing, pinning, and unpinning. |
| `creator.video.write` | Content Posting | You will be able to post shoppable content to the creator's TikTok account. If this content violates any TikTok Shop terms or policies, TikTok Shop may take enforcement action against the creator's account or the content. |
| `seller.customer_service` | Customer Service | The Partner will be able to receive and reply to Instant Messages from buyers. |

> `seller.customer_service` aparece apenas em `Upload File Init`, que é um endpoint **compartilhado**
> (init de upload de arquivo usado tanto por Customer Service quanto por Content Posting); no fluxo
> de creator ele é acionado pelo escopo `creator.video.write`.

## Parâmetros comuns (valem para TODOS os endpoints)

Para não repetir 36×, os parâmetros de _boilerplate_ ficam documentados aqui. Nas seções de cada
endpoint, as tabelas de header/query listam **só o que é específico** daquele endpoint.

**Headers (sempre):**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `content-type` | string | Sim | `application/json` |
| `x-tts-access-token` | string | Sim | Creator access_token (`user_type = 1`). |

**Query (sempre):**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `app_key` | string | Sim | App key do seu app. |
| `sign` | string | Sim | Assinatura HMAC-SHA256 da requisição. |
| `timestamp` | int | Sim | Unix timestamp (UTC+00:00). |
| `currency` | string | Não | `USD` ou `LOCAL` (default `LOCAL`) — presente em endpoints com valores monetários. |

## Convenções deste documento

- **Aninhamento de campos:** nas tabelas de _body_ e _response_, a profundidade de um campo aninhado
  é indicada por indentação e `↳`. Ex.: `data` → `↳ avatar` → `↳↳ width`. (Na API interna isso vem
  como prefixo `^`.)
- **Método HTTP:** derivado do endpoint (`1=POST`, `2=GET`, `4=DELETE`).
- **Versão:** o número no fim do slug/path (ex.: `202508`) é a versão da API — parte do path.
- Exemplos de request/response ficam em blocos recolhíveis (`<details>`).

---

## Referência rápida

| # | Endpoint | Método | Path | Escopo |
|---|---|---|---|---|
| 1 | Get Creator Profile | `GET` | `/affiliate_creator/202508/profiles` | `creator.affiliate.info`, `creator.video.write` |
| 2 | Get Showcase Products | `GET` | `/affiliate_creator/202405/showcases/products` | `creator.showcase.read`, `creator.video.write` |
| 3 | Add Showcase Products | `POST` | `/affiliate_creator/202405/showcases/products/add` | `creator.showcase.write`, `creator.video.write` |
| 4 | Remove Showcase Products | `DELETE` | `/affiliate_creator/202409/showcases/products` | `creator.showcase.write` |
| 5 | Top Showcase Products | `POST` | `/affiliate_creator/202409/showcases/products/top` | `creator.showcase.write` |
| 6 | Search Creator Affiliate Orders | `POST` | `/affiliate_creator/202410/orders/search` | `creator.affiliate_collaboration.read` |
| 7 | Creator Search Affiliate Trace Orders | `POST` | `/affiliate_creator/202505/orders/trace/search` | `creator.affiliate.share_link.read` |
| 8 | Creator Search Open Collaboration Product | `POST` | `/affiliate_creator/202405/open_collaborations/products/search` | `creator.affiliate_collaboration.read` |
| 9 | Get Open Collaboration Product List By Product Ids | `POST` | `/affiliate_creator/202509/open_collaborations/products` | `creator.affiliate_collaboration.read` |
| 10 | Search Creator Target Collaborations | `POST` | `/affiliate_creator/202405/target_collaborations/search` | `creator.affiliate_collaboration.read` |
| 11 | Get Creator Applicable Sample Label | `GET` | `/affiliate_creator/202412/samples/labels` | `creator.affiliate_collaboration.read` |
| 12 | Search Creator Sample Applications | `POST` | `/affiliate_creator/202412/sample_applications/search` | `creator.affiliate_collaboration.read` |
| 13 | Get Creator Sample Application Detail | `POST` | `/affiliate_creator/202412/sample_applications/single_query` | `creator.affiliate_collaboration.read` |
| 14 | Creator Search Sample Application Fulfillments | `POST` | `/affiliate_creator/202409/sample_applications/fulfillments/search` | `creator.affiliate_collaboration.read` |
| 15 | Creator Generate General Link | `POST` | `/affiliate_creator/202505/affiliate_sharing_links/general_publishers/generate_batch` | `creator.affiliate.share_link.read` |
| 16 | Creator Generate Publisher Link | `POST` | `/affiliate_creator/202504/affiliate_sharing_links/publisher/{publisher_id}/generate_batch` | `creator.affiliate.share_link.read` |
| 17 | Get Shop Products | `GET` | `/affiliate_creator/202509/shop_products` | `creator.video.write` |
| 18 | Search Music | `GET` | `/affiliate_creator/202602/music/search` | `creator.video.write` |
| 19 | Upload File Init | `POST` | `/open/202512/file/init` | `seller.customer_service`, `creator.video.write` |
| 20 | Upload Shoppable Video File | `POST` | `/affiliate_creator/202505/videos/video_files` | `creator.video.write` |
| 21 | Upload Shoppable Photo File | `POST` | `/affiliate_creator/202511/photos/photo_files` | `creator.video.write` |
| 22 | Precheck Video Content | `POST` | `/affiliate_creator/202511/videos/precheck_task` | `creator.video.write` |
| 23 | Get Shoppable Video Precheck Result | `GET` | `/affiliate_creator/202601/videos/precheck_tasks/{task_id}` | `creator.video.write` |
| 24 | Post Shoppable Video | `POST` | `/affiliate_creator/202607/videos` | `creator.video.write` |
| 25 | Post Shoppable Photos | `POST` | `/affiliate_creator/202607/photos` | `creator.video.write` |
| 26 | Get Shoppable Video Status | `GET` | `/affiliate_creator/202509/videos/{video_id}/status` | `creator.video.write` |
| 27 | Get Video Performances | `GET` | `/analytics/202403/videos/performances` | `creator.video.write` |
| 28 | Get Live Room Core Stats | `GET` | `/analytics/202502/live_rooms/{live_room_id}/core_stats` | `creator.data.live.read.public` |
| 29 | Get Live Room GMV Trend | `GET` | `/analytics/202502/live_rooms/{live_room_id}/gmv_trend_performances` | `creator.data.live.read.public` |
| 30 | Get Live Room View Trends | `GET` | `/analytics/202502/live_rooms/{live_room_id}/view_trend_performances` | `creator.data.live.read.public` |
| 31 | Get Live Room Traffic Performance | `GET` | `/analytics/202502/live_rooms/{live_room_id}/traffic_performances` | `creator.data.live.read.public` |
| 32 | Get Live Room Interactive Trends | `GET` | `/analytics/202502/live_rooms/{live_room_id}/interactive_trend_performances` | `creator.data.live.read.public` |
| 33 | Get Live Room Product Stats | `GET` | `/analytics/202502/live_rooms/{live_room_id}/product_stats` | `creator.data.live.read.public` |
| 34 | Get Live Room User Portraits | `GET` | `/analytics/202502/live_rooms/{live_room_id}/user_portraits` | `creator.data.live.read.public` |
| 35 | Get Toko Product Mappers | `GET` | `/affiliate_creator/202606/toko_product_mappers` | — |
| 36 | Toko Product Mapper V2 | `POST` | `/affiliate_creator/202607/map_toko_product` | `creator.affiliate.share_link.read` |

---

## Índice

- **Perfil & Vitrine (Showcase)**
  - `GET` [Get Creator Profile](#1-get-creator-profile)
  - `GET` [Get Showcase Products](#2-get-showcase-products)
  - `POST` [Add Showcase Products](#3-add-showcase-products)
  - `DELETE` [Remove Showcase Products](#4-remove-showcase-products)
  - `POST` [Top Showcase Products](#5-top-showcase-products)

- **Ganhos & Rastreio de vendas**
  - `POST` [Search Creator Affiliate Orders](#6-search-creator-affiliate-orders)
  - `POST` [Creator Search Affiliate Trace Orders](#7-creator-search-affiliate-trace-orders)

- **Descoberta & Colaborações**
  - `POST` [Creator Search Open Collaboration Product](#8-creator-search-open-collaboration-product)
  - `POST` [Get Open Collaboration Product List By Product Ids](#9-get-open-collaboration-product-list-by-product-ids)
  - `POST` [Search Creator Target Collaborations](#10-search-creator-target-collaborations)

- **Amostras grátis (Samples)**
  - `GET` [Get Creator Applicable Sample Label](#11-get-creator-applicable-sample-label)
  - `POST` [Search Creator Sample Applications](#12-search-creator-sample-applications)
  - `POST` [Get Creator Sample Application Detail](#13-get-creator-sample-application-detail)
  - `POST` [Creator Search Sample Application Fulfillments](#14-creator-search-sample-application-fulfillments)

- **Links de afiliado**
  - `POST` [Creator Generate General Link](#15-creator-generate-general-link)
  - `POST` [Creator Generate Publisher Link](#16-creator-generate-publisher-link)

- **Estúdio de conteúdo shoppable**
  - `GET` [Get Shop Products](#17-get-shop-products)
  - `GET` [Search Music](#18-search-music)
  - `POST` [Upload File Init](#19-upload-file-init)
  - `POST` [Upload Shoppable Video File](#20-upload-shoppable-video-file)
  - `POST` [Upload Shoppable Photo File](#21-upload-shoppable-photo-file)
  - `POST` [Precheck Video Content](#22-precheck-video-content)
  - `GET` [Get Shoppable Video Precheck Result](#23-get-shoppable-video-precheck-result)
  - `POST` [Post Shoppable Video](#24-post-shoppable-video)
  - `POST` [Post Shoppable Photos](#25-post-shoppable-photos)
  - `GET` [Get Shoppable Video Status](#26-get-shoppable-video-status)

- **Analytics de conteúdo (creator scope)**
  - `GET` [Get Video Performances](#27-get-video-performances)
  - `GET` [Get Live Room Core Stats](#28-get-live-room-core-stats)
  - `GET` [Get Live Room GMV Trend](#29-get-live-room-gmv-trend)
  - `GET` [Get Live Room View Trends](#30-get-live-room-view-trends)
  - `GET` [Get Live Room Traffic Performance](#31-get-live-room-traffic-performance)
  - `GET` [Get Live Room Interactive Trends](#32-get-live-room-interactive-trends)
  - `GET` [Get Live Room Product Stats](#33-get-live-room-product-stats)
  - `GET` [Get Live Room User Portraits](#34-get-live-room-user-portraits)

- **Toko Product Mapper (Indonésia/Tokopedia)**
  - `GET` [Get Toko Product Mappers](#35-get-toko-product-mappers)
  - `POST` [Toko Product Mapper V2](#36-toko-product-mapper-v2)

---

## Perfil & Vitrine (Showcase)

### 1. Get Creator Profile

`GET` `/affiliate_creator/202508/profiles`

| | |
|---|---|
| **Versão** | `202508` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.affiliate.info`, `creator.video.write` |
| **Pacote(s) de auth** | Affiliate Information, Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-creator-profile-202508` |

**Descrição:** This API gets the creator profile information.

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `avatar` | `object` | Data associated with the TikTok creator's profile avatar. |
|   ↳ `width` | `int` | The avatar image width in pixels. |
|   ↳ `height` | `int` | The avatar image height in pixels. |
|   ↳ `url` | `string` | The URL for the TikTok creator's avatar image file. |
|  ↳ `username` | `string` | The TikTok user name. |
|  ↳ `selection_region` | `string` | The regions in which the creator is eligible to promote products in showcases, videos, and live streams. |
|  ↳ `register_region` | `string` | The region in which the creator's TikTok account is registered. |
|  ↳ `seller_type` | `string` | If the creator is also also has a TikTok Shop seller account, the seller type of the creator. This is an enumerated type with values:<br>- CROSS_BORDER<br>- LOCAL |
|  ↳ `permissions` | `[]string` | A list of product promotion permissions for the creator. The list can include zero or more of the following permissions:<br>- LIVE_STREAM_PERMISSION<br>- SELF_SALE_PERMISSION<br>- ADD_AFFILIATE_PERMISSION<br>- PHOTO_SHOPPABLE_PERMISSION_PRODUCT<br>- PHOTO_SHOPPABLE_PERMISSION_SHOP |
|  ↳ `user_type` | `string` | The creator's user type. This is an enumerated type with values:<br>- TIKTOK_SHOP_OFFICIAL_ACCOUNT<br>- TIKTOK_MARKETING_ACCOUNT<br>- TIKTOK_SHOP_CREATOR |
|  ↳ `creator_user_open_id` | `string` | Creator Open ID. [More details](https://partner.tiktokshop.com/docv2/page/3obfokj6) |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `16015006` | There is no selection region in this creator now. please contact the creator and ensure he has ec permission now. |
| `16015007` | no sale region error; detail: creator has no sale region. |
| `16501011` | user has no permission to access this api. please check the creator auth info. |
| `16504002` | query creator info failed.Please check creator ec permission is avaliable now |
| `36009002` | Too many requests. You've made too many requests in a short period of time. |

[↑ Voltar ao índice](#índice)

---

### 2. Get Showcase Products

`GET` `/affiliate_creator/202405/showcases/products`

| | |
|---|---|
| **Versão** | `202405` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.showcase.read`, `creator.video.write` |
| **Pacote(s) de auth** | Read Showcase Products, Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-showcase-products-202405` |

**Descrição:** This API lists the products in the creator's showcase, paginated by specified page size and iterated through pages by page token for up to 2000 products in the showcase. This API is generally used when a creator would like to view the products in the showcase.  The platform will return the product details in the showcase, as well as the products in the livebag if the creator is live streaming.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page_size` | `int` | Sim | The number of results to be returned per page. Valid range: [1-20]. |
| `page_token` | `string` | — | An opaque token used to retrieve the next page of a paginated result set. Retrieve this value from the result of the next_page_token from a previous response. It is not needed for the first page. |
| `origin` | `string` | Sim | Set to `LIVE` to indicate the request originates from a Live room. Set to `SHOWCASE` to indicate that the request originates from the Showcase. |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `products` | `[]object` | A list of products. |
|   ↳ `id` | `string` | The product's product ID |
|   ↳ `shop` | `object` | Data and metadata associated with the Seller's TikTok Shop. |
|    ↳ `name` | `string` | The TikTok Shop name. |
|   ↳ `addition` | `object` | An object including data about product images. |
|    ↳ `customized_main_images` | `[]object` | A list of product images. |
|     ↳ `width` | `int` | The image width in pixels. |
|     ↳ `heigth` | `int` | The image height in pixels. |
|     ↳ `url` | `string` | The product's TikTok Shop image URL. |
|   ↳ `price` | `object` | An object including data about the product price. |
|    ↳ `original_price` | `object` | The original price of the product. |
|     ↳ `minimum_amount` | `string` | The lowest original price for the product. |
|     ↳ `maximum_amount` | `string` | The highest original price for the product. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `seller_discount_price` | `object` | An object including data about the product discount price. |
|     ↳ `minimum_amount` | `string` | The lowest discount price. |
|     ↳ `maximum_amount` | `string` | The highest discount price.  |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `platform_discount_price` | `object` | An object including data about the product platform discount price. |
|     ↳ `minimum_amount` | `string` | The lowest product platform discount price. |
|     ↳ `maximum_amount` | `string` | The highest product platform discount price. |
|     ↳ `currency` | `string` | The currency code. |
|   ↳ `title` | `string` | The product's display title. |
|   ↳ `main_images` | `[]object` | A list of product images. |
|    ↳ `width` | `int` | The image width in pixels. |
|    ↳ `heigth` | `int` | The image height in pixels. |
|    ↳ `url` | `string` | The product's TikTok Shop image URL. |
|   ↳ `status` | `object` | An object including product status information. |
|    ↳ `inventory_status` | `string` | The product inventory status. This an enumerated type with values:<br>- IN_STOCK<br>- SOLD_OUT |
|    ↳ `review_status` | `string` | The product review status. This is an enumerated type with values:<br>- APPROVED<br>- CHANGES_UNDER_REVIEW<br>- UNAVAILABLE<br>- ZERO_COMMISSION |
|    ↳ `is_hidden` | `bool` | Set to `false` if the product is visible in the showcase. Set to `true` if the product is hidden from the showcase. |
|    ↳ `added_status` | `string` | The product showcase status. This is an enumerated type with values:<br>- NOT_ADDED<br>- ADDED<br>- REJECTED |
|   ↳ `source` | `string` | The product source. This is an enumerated type with values:<br>- THIRD_PARTY<br>- AFFILIATE<br>- TIKTOK_STORE |
|   ↳ `detail_link` | `string` | The product detail page URL. |
|   ↳ `third_party_link` | `string` | The off-TikTok Shop product detail page URL. |
|   ↳ `sale_regions` | `[]string` | A list of regions in which the product is offered for sale. |
|   ↳ `commission` | `object` | An object including data about commissions associated with the product. |
|    ↳ `rate` | `int` | The commission rate in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. The range of this value is [100, 8000]. |
|    ↳ `reward_rate` | `int` | The reward commission rate in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`.  |
|   ↳ `collaboration` | `object` | An object including data about open or target collaboration for the product. |
|    ↳ `id` | `string` | The open or target collaboration identifier. |
|    ↳ `type` | `string` | The collaboration type. This an enumerated type with values:<br>1 - Open Collaboration<br>2 - Target Collaboration<br>5 - Partner Campaign<br>11 - Flat Fee<br>12 - Collaboration Plus<br>13 - Affiliate Promotion |
|    ↳ `partner` | `object` | The partner information. |
|     ↳ `id` | `string` | The partner identifier. |
|     ↳ `name` | `string` | The partner name. |
|  ↳ `next_page_token` | `string` | An opaque token used to retrieve the next page of a paginated result set. |
|  ↳ `total_count` | `int` | Total count of products in the response. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `18001405` | This creator account has no selection region.   |
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

### 3. Add Showcase Products

`POST` `/affiliate_creator/202405/showcases/products/add`

| | |
|---|---|
| **Versão** | `202405` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.showcase.write`, `creator.video.write` |
| **Pacote(s) de auth** | Manage Showcase Products, Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `add-showcase-products-202405` |

**Descrição:** This API adds the products to the creator's showcase. The platform will return the add status of the products, and error code and error message if the deletion fails.

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `add_type` | `string` | Sim | Specifies how products are added to the showcase. This an enumerated type with values:<br>- PRODUCT_ID<br>- PRODUCT_LINK  |
| `product_ids` | `[]string` | — | A list of product identifiers included if `add_type` is set to `PRODUCT_ID`. The products associated with the identifiers are added to the showcase. Maximum length of the list is 20 product identifiers. |
| `product_link` | `string` | — | A list of product URLs included if `add_type` is set to `PRODUCT_LINK`. The products associated with the URLs are added to the showcase. Maximum length of the list is 20 product URLs. |

<details><summary>Exemplo de request body</summary>

```json
{
  "add_type": "PRODUCT_ID",
  "product_ids": [
    "12390753231",
    "7102893481290"
  ],
  "product_link": "https://www.example.com/api/v1/share/AImHx6DlXqP1"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `errors` | `[]object` | A list of product showcase addition errors.  |
|   ↳ `code` | `int` | The error code. |
|   ↳ `message` | `string` | A human-readable error message. |
|   ↳ `detail` | `object` | Additional detail about the product showcase addition error. |
|    ↳ `product_id` | `string` | The product identifier. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "errors": [
      {
        "code": 16001001,
        "message": "Encounter network error, please try again.",
        "detail": {
          "product_id": "12390753231"
        }
      }
    ]
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 4. Remove Showcase Products

`DELETE` `/affiliate_creator/202409/showcases/products`

| | |
|---|---|
| **Versão** | `202409` |
| **Método HTTP** | DELETE |
| **Escopo(s)** | `creator.showcase.write` |
| **Pacote(s) de auth** | Manage Showcase Products |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `remove-showcase-products-202409` |

**Descrição:** This API removes the products in the creator's showcase.

The platform will return error code and error message if the deletion fails.

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `product_ids` | `[]string` | Sim | The product IDs to remove from the creator's showcase. The maximum number of products to delete at once is 200. |

<details><summary>Exemplo de request body</summary>

```json
{
  "product_ids": [
    "12390753231",
    "7102893481290"
  ]
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `code` | `int` | The success or failure status code returned in API response. |
|  ↳ `message` | `string` | The success or failure messages are returned in API response. Reasons of failure will be described in the message. |
|  ↳ `request_id` | `string` | Every request generates a unique request_id for logging purposes. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "code": 0,
    "message": "Success",
    "request_id": "202203070749000101890810281E8C70B7"
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `16015001` | Invalid parameter, the product Ids are not correct. Please ensure the products are in the showcase right now. |
| `16015027` | System error |

[↑ Voltar ao índice](#índice)

---

### 5. Top Showcase Products

`POST` `/affiliate_creator/202409/showcases/products/top`

| | |
|---|---|
| **Versão** | `202409` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.showcase.write` |
| **Pacote(s) de auth** | Manage Showcase Products |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `top-showcase-products-202409` |

**Descrição:** Use this API to move products to the top in a creator's showcase.

The platform will return the error code and error message if the pinning operation fails.

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `product_ids` | `[]string` | Sim | The product IDs to move to the top in a creator's showcase. If multiple products are provided, they will display according to the order passed in this parameter. |

<details><summary>Exemplo de request body</summary>

```json
{
  "product_ids": [
    "12390753231",
    "7102893481290"
  ]
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `code` | `int` | The success or failure status code returned in API response. |
|  ↳ `message` | `string` | The success or failure messages are returned in API response. Reasons of failure will be described in the message. |
|  ↳ `request_id` | `string` | Every request generates a unique request_id for logging purposes. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "code": 0,
    "message": "Success",
    "request_id": "202203070749000101890810281E8C70B7"
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `16015001` | Invalid parameter, the product Ids are not correct. Please ensure the products are in the showcase right now. |
| `16015027` | System error |

[↑ Voltar ao índice](#índice)

---

## Ganhos & Rastreio de vendas

### 6. Search Creator Affiliate Orders

`POST` `/affiliate_creator/202410/orders/search`

| | |
|---|---|
| **Versão** | `202410` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `search-creator-affiliate-orders-202410` |

**Descrição:** Search Creator Affiliate Orders

This API allows the partner to retrieve a list of affiliate orders generated by a creator, returning the order ID and the product ID. Using this, the partner can track their affiliate-conversions on behalf of a creator, using the order ID.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page_token` | `string` | — | An opaque token used to retrieve the next page of a paginated result set. Retrieve this value from the result of the `next_page_token` from a previous response. It is not needed for the first page. |
| `page_size` | `int` | Sim | The number of results to be returned per page. Default: 20<br>Valid Range: [1-100] |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `create_time_ge` | `int` | — | Filter orders to show only those that are created on or after the specified date and time. Unix timestamp.<br>Note:<br>`create_time_ge` and `create_time_lt` together constitute the creation time filter condition.<br>- If `create_time_ge` is filled but `create_time_lt` is empty, `create_time_lt` will default to the current time.<br>- If `create_time_lt` is filled but `create_time_ge` is empty, `create_time_ge` will default to the earliest shop time. |
| `create_time_lt` | `int` | — | Filter orders to show only those that are created before the specified date and time. Unix timestamp.<br>Refer to notes in `create_time_ge` for more usage information. |

<details><summary>Exemplo de request body</summary>

```json
{
  "create_time_ge": 1719807456,
  "create_time_lt": 1728443155
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `orders` | `[]object` | The order resource. |
|   ↳ `id` | `string` | The order identifier. |
|   ↳ `create_time` | `int` | Time and date of order created, UTC+0 timing |
|   ↳ `delivery_time` | `int` | Time and date order delivered, UTC+0 timing |
|   ↳ `status` | `string` | The current status of the order. Possible options are:<br>- UNSPECIFIED: The status of the order is undefined. It might be updated later.<br>- AWAITING PAYMENT：The order hasn't been paid yet, only estimated commission is available<br>- To-SETTLE：The order is waiting for settlement, only estimated commission is available<br>- SETTLED: The commission of the order is already settled.<br>- REFUNDED: The order has been returned/refunded/canceled by the buyer, and no commission will be settled.<br>- FROZEN: Possible fraud has been detected regarding the order. The commission will be unfrozen after the fraud is resolved. |
|   ↳ `skus` | `[]object` | A list of SKUs associated with the order. |
|    ↳ `id` | `string` | The SKU identifier. |
|    ↳ `campaign_id` | `string` | The campaign identifier associated with the order. |
|    ↳ `open_collaboration_id` | `string` | The open collaboration identifier associated with the order. |
|    ↳ `target_collaboration_id` | `string` | The target collaboration identifier associated with the order. |
|    ↳ `product_name` | `string` | The product name in the TikTok Shop. |
|    ↳ `product_id` | `string` | The product identifier. |
|    ↳ `price` | `object` | An object representing the localized price of the product. |
|     ↳ `amount` | `string` | The value of the price associated with the product. |
|     ↳ `currency` | `string` | The currency code of the price associated with the product. |
|    ↳ `shop_name` | `string` | The name of the TIkTok Shop in which the product is offered for sale. |
|    ↳ `content_type` | `string` | The content format of the creator content through which the order was created.<br>Possible values:<br>- SHOP<br>- VIDEO<br>- LIVE<br>- PRE_LIVE<br>- PROMOTION_PAGE<br>- LINKSHARE |
|    ↳ `content_id` | `string` | The content identifier for the creator content through which the order was created. |
|    ↳ `quantity` | `int` | The total number of SKUs per order, calculated by aggregating the number of ordered product SKUs associated with the order. |
|    ↳ `commission_rate` | `int` | The total commission rate of this SKU, equal to the sum of standard commission rate + shop ads commission rate + bonus rate + reward rate. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `commission_tier_setting` | `string` | Between Seller & Creator percentagecommission. When tiering commission model applied, will return each tier's commission rate seller set. |
|    ↳ `commission_model` | `string` | Determine order commission be calculated based on fixed commission model or tiering<br>model |
|    ↳ `commission_bonus_rate` | `int` | The commission bonus rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `estimated_commission_base` | `object` | An object representing the estimated base commission at the time of order creation. |
|     ↳ `amount` | `string` | The estimated commission base amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `standard_commission_rate` | `int` | The standard affiliate commission rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `shop_ads_commission_rate` | `int` | The commission rate received by a creator for a sale associated with a specific piece of content. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `estimated_bonus_commission` | `object` | An object representing the estimated bonus commission, calculated by multiplying the estimated commission base by the commission bonus rate. |
|     ↳ `amount` | `string` | The estimated bonus commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `estimated_standard_commission` | `object` | An object representing the estimated shop ads commission, calculated by multiplying the estimated commission base by the standard_commission_rate |
|     ↳ `amount` | `string` | The estimated standard commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `estimated_shop_ads_commission` | `object` | An object representing the estimated shop ads commission, calculated by multiplying the estimated commission base by the shop_ads_commission_rate |
|     ↳ `amount` | `string` | The estimated shop ads commission rate. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `estimated_commission` | `object` | The estimated creator commission, calculated by multiplying the product sales price by the total number of products at the time of order creation. |
|     ↳ `amount` | `string` | The estimated commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_commission` | `object` | Represents the final earnings of this sku, calculated by multiplying the actual commission base by the total commission rate, and then deducting the taxes or revenue sharing with the agency amount. |
|     ↳ `amount` | `string` | The actual commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_bonus_commission` | `object` | An object representing the actual bonus commission, calculated by multiplying the actual commission base by the commission bonus rate. |
|     ↳ `amount` | `string` | The actual bonus commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_commission_base` | `object` | An object representing the actual commission base, calculated by multiplying the product sale price by the number of products sold, subtracting returned and refunded orders. |
|     ↳ `amount` | `string` | The value of the actual commission base. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_standard_commission` | `object` | An object representing the actual standard affiliate commission, calculated by multiplying the commission base by the standard_commission_rate. |
|     ↳ `amount` | `string` | The actual standard commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_shop_ads_commission` | `object` | An object representing the actual shop ads commission, calculated by multiplying the commission base by the shop_ads_commission_rate. |
|     ↳ `amount` | `string` | The actual shop ads commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `returned_quantity` | `int` | The total number of returned SKUs associated with the order. |
|    ↳ `refunded_quantity` | `int` | The total number of refunded SKUs associated with the order. |
|    ↳ `tag` | `string` | A field for storing user-defined metadata for tracking purposes. |
|    ↳ `creator_commission_reward_rate` | `int` | The commission reward rate affiliate partners allocate to creators |
|    ↳ `estimated_creator_commission_reward_fee` | `object` | Estimated creator commission reward fee. |
|     ↳ `amount` | `string` | The estimated fee creators receive from affiliate partners through commission rewards |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_creator_commission_reward_fee` | `object` | Actual creator commission reward fee. |
|     ↳ `amount` | `string` | The actual fee creators receive from affiliate partners through commission rewards |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `isr` | `object` | Only for Mexico creator, platform collected related revenue taxes on behalf of government based on regulation. |
|     ↳ `amount` | `string` | The actual isr amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `iva` | `object` | Only for Mexico creator, platform collected related revenue taxes on behalf of government based on regulation. |
|     ↳ `amount` | `string` | The actual iva amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `pit` | `object` | Only for VN/TH/PH/ID creators, sellers collect related withholding taxes based on regulation. |
|     ↳ `amount` | `string` | The actual pit amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `shared_with_partner` | `object` | The parts of after-taxes creator revenue which need to be shared with CAP based on the fee agreement |
|     ↳ `amount` | `string` | The actual shared with partner amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `trace_info` | `object` | Extra information for tracing purposes. |
|     ↳ `id` | `string` | When `trace.type==GENERAL`, the value is {eid} you provided in `sharing_link`; when `trace.type==SPECIFIC`, the value is the same as `publisher_id`. |
|     ↳ `type` | `string` | For the orders coming from the sharing links for specific publishers, the value is `SPECIFIC`; for the orders coming from the general sharing links, the value is `GENERAL`. |
|    ↳ `last_update_time` | `int` | The time when the record was last updated. |
|  ↳ `next_page_token` | `string` | An opaque token used to retrieve the next page of a paginated result set. |
|  ↳ `total_count` | `int` | Total count of orders in the response. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 7. Creator Search Affiliate Trace Orders

`POST` `/affiliate_creator/202505/orders/trace/search`

| | |
|---|---|
| **Versão** | `202505` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate.share_link.read` |
| **Pacote(s) de auth** | Read Affiliate Share Link |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `creator-search-affiliate-trace-orders-202505` |

**Descrição:** This API allows the partner to retrieve a list of affiliate orders generated by a creator, returning the order ID and the product ID. Using this, the partner can track their affiliate-conversions on behalf of a creator, using the order ID.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page_token` | `string` | — | An opaque token used to retrieve the next page of a paginated result set. Retrieve this value from the result of the next_page_token from a previous response. It is not needed for the first page. |
| `page_size` | `int` | Sim | The number of results to be returned per page. Default: 20<br>Valid Range: [1-100] |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `time_ge` | `int` | Sim | Filter orders to include only those with the specified `time_type` timestamp greater than or equal to time_ge and less than time_lt. Unix timestamp.<br>Note:<br>`time_ge` and `time_lt` together constitute the creation time filter condition. |
| `time_lt` | `int` | Sim | Filter orders to include only those with the specified `time_type` timestamp greater than or equal to time_ge and less than time_lt.Unix timestamp. |
| `time_type` | `string` | — | Specifies the type of timestamp to filter the orders by. The query time range (time_ge and time_lt) will be applied to the selected time type.<br>Possible values:<br>- PAY_TIME: Filter based on the order payment time.<br>- DELIVERY_TIME: Filter based on the order delivery/shipment time.<br>- SETTLE_TIME: Filter based on the order settlement time.<br>- CREATE_TIME (default): Filter based on the order creation time. |

<details><summary>Exemplo de request body</summary>

```json
{
  "time_ge": 1719807456000,
  "time_lt": 1728443155000,
  "time_type": "PAY_TIME"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `orders` | `[]object` | The order resource. |
|   ↳ `id` | `int` | The order identifier. |
|   ↳ `status` | `string` | The current status of the order. Possible options are:<br>- UNSPECIFIED: The status of the order is undefined. It might be updated later.<br>- ORDERED: The order has been placed, but the commission has not been settled. But an estimated commission is available.<br>- SETTLED: The commission of the order is already settled.<br>- REFUNDED: The order has been returned/refunded/canceled by the buyer, and no commission will be settled.<br>- FROZEN: Possible fraud has been detected regarding the order. The commission will be unfrozen after the fraud is resolved.<br>- DEDUCTED: Additional deduction from your balance account. |
|   ↳ `skus` | `[]object` | A list of SKUs associated with the order. |
|    ↳ `id` | `string` | The SKU identifier. |
|    ↳ `product_id` | `string` | The product identifier. |
|    ↳ `price` | `object` | An object representing the localized price of the product. |
|     ↳ `amount` | `string` | The value of the price associated with the product.  |
|     ↳ `currency` | `string` | The currency code of the price associated with the product. |
|    ↳ `quantity` | `int` | The total number of SKUs per order, calculated by aggregating the number of ordered product SKUs associated with the order. |
|    ↳ `commission_rate` | `int` | The commission rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `estimated_commission_base` | `object` | An object representing the estimated base commission at the time of order creation. |
|     ↳ `amount` | `string` | The estimated commission base amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_commission` | `object` | An object representing the actual base commission, calculated by multiplying the actual commission base by the commission rate. |
|     ↳ `amount` | `string` | The actual commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `shop_ads_commission_rate` | `int` | The commission rate received by a creator for a sale associated with a specific piece of content. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `commission_bonus_rate` | `int` | The commission bonus rate associated with the collaboration. Expressed in units of hundredths of a percent formatted as a string. The percent sign % is not included in the string. For example, 3000 represents a 30% commission. |
|    ↳ `product_name` | `string` | The product name in the TikTok Shop. |
|    ↳ `shop_name` | `string` | The name of the TIkTok Shop in which the product is offered for sale. |
|    ↳ `returned_quantity` | `int` | The total number of returned SKUs associated with the order. |
|    ↳ `refunded_quantity` | `int` | The total number of refunded SKUs associated with the order. |
|    ↳ `campaign_id` | `string` | The campaign identifier associated with the order. |
|    ↳ `actual_commission_base` | `object` | An object representing the actual commission base, calculated by multiplying the product sale price by the number of products sold, subtracting returned and refunded orders. |
|     ↳ `amount` | `string` | The value of the actual commission base. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_shop_ads_commission` | `object` | An object representing the actual shop ads commission, calculated by multiplying the commission base by the shop_ads_commission_rate. |
|     ↳ `amount` | `string` | The actual shop ads commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `estimated_shop_ads_commission` | `object` | An object representing the estimated shop ads commission, calculated by multiplying the estimated commission base by the shop_ads_commission_rate |
|     ↳ `amount` | `string` | The estimated shop ads commission rate. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `estimated_bonus_commission` | `object` | An object representing the estimated bonus commission, calculated by multiplying the estimated commission base by the commission bonus rate. |
|     ↳ `amount` | `string` | The estimated bonus commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `delivery_time` | `int` | Time and date order delivered, UTC+0 timing |
|    ↳ `creator_commission_reward_rate` | `int` | The commission reward rate affiliate partners allocate to creators |
|    ↳ `estimated_creator_commission_reward_fee` | `object` | Estimated creator commission reward fee. |
|     ↳ `amount` | `string` | The estimated fee creators receive from affiliate partners through commission rewards |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_creator_commission_reward_fee` | `object` | Actual creator commission reward fee. |
|     ↳ `amount` | `string` | The actual fee creators receive from affiliate partners through commission rewards |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `content_type` | `string` | The content format of the creator content through which the order was created.<br>Possible values:<br>- SHOP<br>- VIDEO<br>- LIVE<br>- PRE_LIVE<br>- PROMOTION_PAGE<br>- LINKSHARE |
|    ↳ `content_id` | `string` | The content identifier for the creator content through which the order was created. |
|    ↳ `trace` | `object` | Extra information for tracing purposes. |
|     ↳ `id` | `string` | When `trace.type==GENERAL`, the value is {eid} you provided in `sharing_link`; when `trace.type==SPECIFIC`, the value is the same as `publisher_id`. |
|     ↳ `type` | `string` | For the orders coming from the sharing links for specific publishers, the value is `SPECIFIC`; for the orders coming from the general sharing links, the value is `GENERAL`. |
|    ↳ `estimated_commission` | `object` | The estimated creator commission, calculated by multiplying the product sales price by the total number of products at the time of order creation. |
|     ↳ `amount` | `string` | The estimated commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|    ↳ `actual_bonus_commission` | `object` | An object representing the actual bonus commission, calculated by multiplying the actual commission base by the commission bonus rate. |
|     ↳ `amount` | `string` | The actual bonus commission amount. |
|     ↳ `currency` | `string` | The currency code. |
|   ↳ `create_time` | `int` | Time and date of order created, UTC+0 timing |
|   ↳ `delivery_time` | `int` | Time and date order delivered, UTC+0 timing |
|  ↳ `next_page_token` | `string` | An opaque token used to retrieve the next page of a paginated result set.<br> |
|  ↳ `total_count` | `int` | Total count of orders in the response.<br> |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

## Descoberta & Colaborações

### 8. Creator Search Open Collaboration Product

`POST` `/affiliate_creator/202405/open_collaborations/products/search`

| | |
|---|---|
| **Versão** | `202405` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `creator-search-open-collaboration-product-202405` |

**Descrição:** This API is used to search the information of products with open collaboration by category, commission rate, and keywords. It will return all products on the TikTok Shop Affiliate Product Marketplace that are in an open collaboration.

Creators can only search for open collaboration within the regions they are registered in the affiliate.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page_token` | `string` | — | Pagination offset determines where you begin to search for. It's empty when raise your first request. |
| `page_size` | `int` | Sim | The value of "page_size" must be greater than 0 and less than or equal to 20. |
| `sort_field` | `string` | — | The returned results are sorted by the specified field. <br><br>Possible values:<br>- commission_rate<br>- product_sales_price<br>- commission<br>- units_sold<br><br>Specify the sort order using the `sort_order` parameter.<br><br> |
| `sort_order` | `string` | — | The sort order for the objects in the response. Default: ASC<br>Possible values:<br>- ASC: Ascending order<br>- DESC: Descending order |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `title_keywords` | `[]string` | — | A list of product keywords for searching. Product titles, or names, are loosely matched. Keywords in the list form a query and the resulting set of matching product names is based on the conjunctive operator `AND` between each keyword. For example, the keyword list `["Men", "Fashion"]` creates a query `"Men" AND "Fashion"` and the resulting set of matching product names contains the loosely matched conjuction of "Men" and "Fashion" such as "Male Fashionable". Maximum length of the list is 20 keywords. Maximum keyword string length is 255 characters. |
| `sales_price_range` | `object` | — | Restricts the products in the search results to those with prices greater than or equal to the expressed minimum price and less than the expressed maximum price. |
|  ↳ `amount_ge` | `string` | — | The product price must be greater than this value in order to be included in the search results. The value must be greater than `0`. |
|  ↳ `amount_lt` | `string` | — | The product price must be greater than this value in order to be included in the search results. The value must be greater than `0`. No upper bound is set if this property is not included. |
| `category` | `object` | — | Restricts the products in the search results to those that are associated with the expressed product category.  |
|  ↳ `id` | `string` | — | The category identifier. Note that only first-level categories are supported. |
| `commission_rate_range` | `object` | — | The commission rate of the searched product needs to be limited within this range. |
|  ↳ `rate_ge` | `int` | — | The commission rate must be greater than this value in order to be included in the search results. The commission rate is expressed in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. This value must a minimum of `1000`.  |
|  ↳ `rate_lt` | `int` | — | The commission rate must be less than this value in order to be included in the search results. The commission rate is expressed in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. This value must a minimum of `1000`.  |

<details><summary>Exemplo de request body</summary>

```json
{
  "title_keywords": [
    "Men",
    "Fashion",
    " Sports Short"
  ],
  "sales_price_range": {
    "amount_ge": "12.44",
    "amount_lt": "100"
  },
  "category": {
    "id": "341234"
  },
  "commission_rate_range": {
    "rate_ge": 100,
    "rate_lt": 8000
  }
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `products` | `[]object` | A list of products. |
|   ↳ `shop` | `object` | Data and metadata associated with the Seller's TikTok Shop. |
|    ↳ `name` | `string` | The TikTok Shop name. |
|   ↳ `id` | `string` | The product identifier. |
|   ↳ `has_inventory` | `bool` | Set to `true` if there are more than zero units of the product in inventory. Set to `false` if there are zero units in inventory. |
|   ↳ `units_sold` | `int` | Total number of units sold. Units are indexed to SKU. Note that if the creator has not given permission for precise data sharing, this property will not be present. |
|   ↳ `title` | `string` | The product name. |
|   ↳ `sale_region` | `string` | The region where the product is offered for sale. |
|   ↳ `main_image_url` | `string` | The product image URL. |
|   ↳ `detail_link` | `string` | The URL for the product's detail page. |
|   ↳ `original_price` | `object` | The original price of the product. |
|    ↳ `currency` | `string` | The currency code. |
|    ↳ `minimum_amount` | `string` | The lowest original price of all SKUs of the product. |
|    ↳ `maximum_amount` | `string` | The highest original price of all SKUs of the product. |
|   ↳ `category_chains` | `[]object` | A list of categories associated with the product. Maximum length of the list is `3` categories. |
|    ↳ `id` | `string` | The category identifier. |
|    ↳ `local_name` | `string` | The name of the product in the category. |
|    ↳ `is_leaf` | `bool` | Set to `true` if this category is a leaf node. Set to `false` if not. |
|    ↳ `parent_id` | `string` | The category identifier of the parent category. |
|   ↳ `commission` | `object` | Metadata and data associated with the commission rates for the product. |
|    ↳ `rate` | `int` | The commission rate in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`. This value must a minimum of `1000`.  The range of this value is [100, 8000]. |
|    ↳ `currency` | `string` | The currency code. |
|    ↳ `amount` | `string` | The commission amount. |
|   ↳ `sales_price` | `object` | Metadata and data associated with the sale price of the product |
|    ↳ `currency` | `string` | The currency code. |
|    ↳ `minimum_amount` | `string` | The lowest promotion price of all SKUs of this product. |
|    ↳ `maximum_amount` | `string` | The highest promotion price of all SKUs of this product. |
|  ↳ `next_page_token` | `string` | An opaque token used to retrieve the next page of a paginated result set. |
|  ↳ `total_count` | `int` | Total count of products meeting the search criteria expressed in the request body. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 9. Get Open Collaboration Product List By Product Ids

`POST` `/affiliate_creator/202509/open_collaborations/products`

| | |
|---|---|
| **Versão** | `202509` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-open-collaboration-product-list-by-product-ids-202509` |

**Descrição:** Get Product OpenCollaboration Product List By Product Ids

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `product_ids` | `[]string` | — | product id list |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `products` | `[]object` | These are the searched products. |
|   ↳ `shop` | `object` | The product's shop information. |
|    ↳ `name` | `string` | The name of the shop to which the product belongs. |
|   ↳ `id` | `string` | Product's unique id. |
|   ↳ `has_inventory` | `bool` | Whether this product has inventory. |
|   ↳ `units_sold` | `int` | The total sales of this product. |
|   ↳ `title` | `string` | Product's name. |
|   ↳ `sale_region` | `string` | The region represents the areas where the product can be sold. |
|   ↳ `main_image_url` | `string` | The product image url. |
|   ↳ `detail_link` | `string` | Product's detail link which is used to get product details on mobile clients. |
|   ↳ `original_price` | `object` | The product's original price |
|    ↳ `currency` | `string` | The currency in the sale region. |
|    ↳ `minimum_amount` | `string` | The minimum original price of all skus of this product. |
|    ↳ `maximum_amount` | `string` | The maximum original price of all skus of this product. |
|   ↳ `category_chains` | `[]object` | The categories of this product.<br>Return to the top three categories at most |
|    ↳ `id` | `string` | The current category id of this product. |
|    ↳ `local_name` | `string` | The current level category name of this product. |
|    ↳ `is_leaf` | `bool` | Indicate whether current node is leaf node |
|    ↳ `parent_id` | `string` | The category id of its parent category |
|   ↳ `commission` | `object` | The commission of this product. |
|    ↳ `rate` | `int` | - The commission rate for this product is set by merchants for creators public promotion.<br>- The range of this value is [100, 8000].<br>- This value equals actual commission rate multi 10000. For example: 3000 means the actual commission rate is 30.00%, and 3555 means 35.55% |
|    ↳ `currency` | `string` | Currency symbol |
|    ↳ `amount` | `string` | The commission for this product is calculated by multiplying the promotional price with the commission rate for each promotional order.<br>The currency symbol is same as the currency symbol in price |
|   ↳ `sales_price` | `object` | Sales price information of the product |
|    ↳ `currency` | `string` | Currency symbol for sales area |
|    ↳ `minimum_amount` | `string` | The  minimum promotion price of all skus of this product. |
|    ↳ `maximum_amount` | `string` | The maximum promotion price of all skus of this product. |
|   ↳ `shop_ads_commission` | `object` | The ads commission rate applies only to orders generated from ads. If a creator’s video is used as an ad without this rate being set, the resulting orders will instead earn either:<br>- The Shop Ads commission you configured in open collaboration, or<br>- The standard commission defined in this invitation. |
|    ↳ `rate` | `int` | - The commission rate for this product is set by merchants for creators public promotion.<br>- The range of this value is [100, 8000].<br>- This value equals actual commission rate multi 10000. For example: 3000 means the actual commission rate is 30.00%, and 3555 means 35.55% |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 10. Search Creator Target Collaborations

`POST` `/affiliate_creator/202405/target_collaborations/search`

| | |
|---|---|
| **Versão** | `202405` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `search-creator-target-collaborations-202405` |

**Descrição:** This API is used to search for creator's target collaborations and the products within these target collaborations.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page_token` | `string` | — | An opaque token used to retrieve the next page of a paginated result set. Retrieve this value from the result of the next_page_token from a previous response. It is not needed for the first page. |
| `page_size` | `int` | Sim | The number of results to be returned per page. Valid range: [0-100]. |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `shop_id` | `string` | Sim | The TikTok Shop identifier. |
| `keyword_type` | `string` | — | Target collaborations in the response are restricted to the the expressed type. This is an enumerated wtype with values:<br>- TARGET_COLLABORATIONS_ID<br>- TARGET_COLLABORATIONS_NAME<br><br>`TARGET_COLLABORATIONS_ID` returns target collaborations with state set to `LIVE`, `EXPIRED`, `DELETED`, and `ENDED`. <br><br>`TARGET_COLLABORATIONS_NAME` returns target collaborations with state set to `LIVE` only. |
| `keyword` | `string` | — | Target collaborations in the response are restricted to the expressed name.  |

<details><summary>Exemplo de request body</summary>

```json
{
  "shop_id": "789078671231",
  "keyword_type": "TARGET_COLLABORATIONS_ID",
  "keyword": "12312312"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `total_count` | `int` | The total number of target collaboration groups in the response. |
|  ↳ `next_page_token` | `string` | An opaque token used to retrieve the next page of a paginated result set. |
|  ↳ `target_collaborations` | `[]object` | A list of target collaboration objects. |
|   ↳ `id` | `string` | The target collaboration identifier. |
|   ↳ `name` | `string` | The target collaboration name. |
|   ↳ `status` | `string` | The target collaboration state. This is an enumerated type with values:<br>- LIVE<br>- EXPIRED<br>- DELETED<br>- ENDED |
|   ↳ `products` | `[]object` | A list of products associated with the target collaboration. |
|    ↳ `id` | `string` | The product identifier. |
|    ↳ `title` | `string` | The product name. |
|    ↳ `main_image_url` | `string` | The product image URL in the TikTok Shop. |
|    ↳ `commission` | `object` | Metadata and data associated with the target collaboration. |
|     ↳ `rate` | `int` | The commission rate for the target collaboration in hundredths of a percent. For example, `3587` is a commission rate of `35.87%`.  |
|     ↳ `amount` | `string` | The total amount paid in commission paid for this this product. |
|     ↳ `currency` | `string` | The currency code. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

## Amostras grátis (Samples)

### 11. Get Creator Applicable Sample Label

`GET` `/affiliate_creator/202412/samples/labels`

| | |
|---|---|
| **Versão** | `202412` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-creator-applicable-sample-label-202412` |

**Descrição:** Check if a creator can apply for a sample of a specific product.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `product_id` | `string` | Sim | The TikTok Shop product identifier. |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `label` | `object` | Creator applicable sample label information. |
|   ↳ `can_apply` | `bool` | Creator can apply this application or not. |
|   ↳ `status` | `string` | Status to describe if the creator has already applied this product as a free sample.<br>- TO_APPLY: creator has not applied this product as a free sample.<br>- ONGOING: creator applied this product as a free sample while he/she has not finished sample fulfillment.<br>- COMPLETE: creator applied this product as a free sample and finished sample fulfillment. |
|   ↳ `application_id` | `string` | Sample Application ID. only appear when the creator has already applied this product. |
|   ↳ `reach_limit` | `bool` | If the creator has reached the sample application upper limit. |
|   ↳ `sample_product` | `object` | The sample product information. |
|    ↳ `sample_sku_list` | `[]object` | The sample product SKU information. |
|     ↳ `id` | `string` | The SKU identifier. |
|     ↳ `sale_property_value_ids` | `string` | The combination of SKU properties for this SKU. |
|     ↳ `price` | `object` | SKU price information. |
|      ↳ `amount` | `string` | The price amount. |
|      ↳ `currency` | `string` | The price currency code. |
|     ↳ `sale_properties` | `[]object` | The SKU property information. |
|      ↳ `id` | `string` | A SKU property identifier, short for "Stock Keeping Unit Property ID", is a specific identification code assigned to a particular property or characteristic of a SKU.(i.e: "100000" means "color") |
|      ↳ `name` | `string` | The SKU property name. |
|      ↳ `value_id` | `string` | The SKU property value identifier is an identification code related to the specific values of the properties of a Stock Keeping Unit (SKU).<br>When a SKU has certain properties like color, size, etc., each possible value for those properties has its own unique SKU property value identifier. For instance, if the property is "color" and the possible values are "red", "blue", "green", then "red" would have its own SKU property vvalue identifier, "blue" would have another one, and so on. |
|      ↳ `value_name` | `string` | The SKU property value name. |
|     ↳ `is_available` | `bool` | If this SKU is available. |
|     ↳ `unavailable_reason` | `string` | The reason why the SKU is unavailable: <br>- IS_PREORDER : this product is a preorder product which does not support free sample<br>- IS_GIFT: this product is a gift product which does not support free sample<br>- OUT_OF_STOCK: product sold out<br>- EXCEED_CB_PRICE_THRESHOLD: <br>- ALREADY_APPLYED: creator has already applied this SKU. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

### 12. Search Creator Sample Applications

`POST` `/affiliate_creator/202412/sample_applications/search`

| | |
|---|---|
| **Versão** | `202412` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `search-creator-sample-applications-202412` |

**Descrição:** Get sample application list of creator.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `page_token` | `string` | — | Pagination offset determines where you begin to search for. It's empty when raise your first request. |
| `page_size` | `int` | — | The value of "page_size" must be greater than 0 and less than or equal to 50.<br>Default 20 |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `application_statuses` | `[]string` | — | The status of sample applications.<br>The possible enumerated values are:<br>- PENDING: The sample application is waiting for the seller's review.<br>- AWAITING_SHIPMENT: The application is approved, and the seller needs to ship the sample.<br>- SHIPPED: The sample has been shipped by the seller and is waiting for the creator to receive the package.<br>- CONTENT_PENDING: The creator has received the sample package and is expected to create content.<br>- REJECT_CANCELLED: The sample application has been rejected by the seller.<br>- OVERDUE_CANCELLED: The sample application has expired due to being overdue.<br>- UNFULFILL_CANCELLED: The creator did not fulfill the commitment to create content within the agreed timeframe.<br>- DEL_OPEN_COLLAB: Open collaboration has been deleted.<br>- SELLER_NOT_SHIP_CANCELLED: The seller did not ship the sample within the required timeframe.<br>- WITHDRAW_CANCELLED: The creator withdrew the sample application before the seller approved it.<br>- UNFULFILLABLE_CANCELLED: The application was cancelled due to reasons beyond the creator's control, making it impossible to create content.<br>- OPS_CANCELLED: The application was manually cancelled by operations staff.<br>- OPS_FAILED: The application was marked as failed by operations staff.<br>- OPS_ COMPLETED: The application was manually marked as completed by operations staff.<br>- COMPLETED: The application is complete, and the creator has posted the content.<br>This field allows for tracking the status of a sample application throughout its lifecycle, providing visibility into each stage of the process for sellers and creators. |

<details><summary>Exemplo de request body</summary>

```json
{
  "application_statuses": [
    "PENDING",
    "AWAITING_SHIPMENT"
  ]
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `next_page_token` | `string` | Page token to query next page orders, last page is empty string. |
|  ↳ `sample_applications` | `[]object` | The sample application information. |
|   ↳ `id` | `string` | The unique id of sample application. |
|   ↳ `sample_product` | `object` | The sample product information. |
|    ↳ `id` | `string` | The product identifier. |
|    ↳ `sku_id` | `string` | The SKU identifier. |
|    ↳ `sku_sale_property_value_names` | `[]string` | The SKU property value name. |
|   ↳ `main_order_id` | `string` | The sample order is generated after the sample application is approved by seller. |
|   ↳ `activity_id` | `string` | The sample activity identifier id(only for sample activity). |
|   ↳ `status` | `string` | The status of sample applications.<br>The possible enumerated values are:<br>- PENDING: The sample application is waiting for the seller's review.<br>- AWAITING_SHIPMENT: The application is approved, and the seller needs to ship the sample.<br>- SHIPPED: The sample has been shipped by the seller and is waiting for the creator to receive the package.<br>- REJECT_CANCELLED: The sample application has been rejected by the seller.<br>- OVERDUE_CANCELLED: The sample application has expired due to being overdue.<br>- UNFULFILL_CANCELLED: The creator did not fulfill the commitment to create content within the agreed timeframe.<br>- FULFILLMENT_SUSPEND: the application fulfillment was paused due to the product status being unpromotable.<br>- DEL_OPEN_COLLAB: Open collaboration has been deleted.<br>- SELLER_NOT_SHIP_CANCELLED: The seller did not ship the sample within the required timeframe.<br>- WITHDRAW_CANCELLED: The creator withdrew the sample application before the seller approved it.<br>- UNFULFILLABLE_CANCELLED: The application was cancelled due to reasons beyond the creator's control, making it impossible to create content.<br>- OPS_CANCELLED: The application was manually cancelled by operations staff.<br>- OPS_FAILED: The application was marked as failed by operations staff.<br>- OPS_ COMPLETED: The application was manually marked as completed by operations staff.<br>- COMPLETED: The application is complete, and the creator has posted the content.<br>- TO_BE_POST: the creator has not posted videos/lives for this sample<br>- POST_IN_REVIEW: the creator has posted videos/lives which have not satisfied fulfillment rules.<br>- POST_FAILED: the creator has posted videos/lives and deleted them before completing sample fulfillment.<br>- CANCELED: this application(order) has been canceled.<br>This field allows tracking the status of a sample application throughout its lifecycle, providing visibility into each stage of the process for sellers and creators. |
|   ↳ `creator_fulfillment` | `object` |  Fulfillment info for this sample application. |
|    ↳ `id` | `string` | Fulfillment ID. |
|    ↳ `expiration_time` | `int` | Fulfillment deadline timestamp, in seconds. |
|    ↳ `total_suspend_duration` | `int` | Total suspension duration for fulfillment, in seconds. |
|    ↳ `status` | `string` | Fulfillment status, It indicates the current status of the fulfillment process. The possible values are:<br>- PENDING: The creator is yet to fulfill the content creation obligation.<br>- ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.<br>- SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.<br>- FAILED: Fulfillment failed; the content did not meet the required standards.<br>- OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.<br>- SUSPEND: Fulfillment has been suspended.<br>- CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.<br>- EXEMPTED: The creator has been exempted from the fulfillment obligation. |
|    ↳ `bound_product_status` | `string` | Represents the marketing status of a product associated with a fulfillment order. It indicates whether the product is available for marketing and fulfillment. The possible values are:<br>- UNKNOWN: The marketing status of the product is unknown.<br>- LIVE: The product is available and can be used for fulfillment.<br>- OUT_OF_STOCK: The product is out of stock and cannot be fulfilled.<br>- SELLER_DEACTIVATE: The product has been deactivated by the seller.<br>- PLATFORM_DEACTIVATE: The product has been deactivated by the platform.<br>- NO_PLAN: There is no valid plan available for the creator to market the product.<br>- PERMANENT_DELETED: The product has been permanently deleted and is no longer available.<br>This field helps sellers and creators understand the current status of products associated with fulfillment orders, ensuring that all parties are aware of the availability and marketing status of the products involved in sample applications and collaborations. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 13. Get Creator Sample Application Detail

`POST` `/affiliate_creator/202412/sample_applications/single_query`

| | |
|---|---|
| **Versão** | `202412` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-creator-sample-application-detail-202412` |

**Descrição:** Get the sample detail of specified sample application.

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `product_id` | `string` | Sim | The product identifier. |
| `application_id` | `string` | — | Free sample application ID, required when application type is "FREE_SAMPLE". |
| `application_type` | `string` | Sim | The type of creator sample application.<br>- FREE_SAMPLE : free sample supplied by seller which creator can apply for by themselves from product detail page.<br>- SAMPLE_COUPON: creator claimed sample coupon (a type of coupon) and used it to place orders at a discount price.<br>- SAMPLE_CAMPAIGN: activity organized by the platform. Creators can participate in this activity to obtain sample products provided by the platform for free.<br> |
| `main_order_id` | `string` | — | The real main order identifier, required when application  is "SAMPLE_COUPON"  or "SAMPLE_CAMPAIGN" or "REFUNDABLE_SAMPLE". |

<details><summary>Exemplo de request body</summary>

```json
{
  "product_id": "1729480364147774364",
  "application_id": "8070590921506065183",
  "application_type": "FREE_SAMPLE",
  "main_order_id": "579622078763731743"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `sample_application` | `object` | The sample application information. |
|   ↳ `id` | `string` | Sample application identifier. |
|   ↳ `create_time` | `int` | Sample application create time in seconds. |
|   ↳ `sample_product` | `object` | The sample product information. |
|    ↳ `id` | `string` | The product identifier. |
|    ↳ `sku_id` | `string` | The SKU identifier. |
|    ↳ `sku_sale_property_value_names` | `[]string` | Sku property name list for this sku id. |
|   ↳ `main_order_id` | `string` | The sample order is generated after the sample application is approved by seller. |
|   ↳ `activity_id` | `string` | The sample activity identifier id( only for sample campaign). |
|   ↳ `type` | `string` | The type of creator sample application.<br>- FREE_SAMPLE : free sample supplied by seller which creator can apply by themselves from pdp page.<br>- SAMPLE_COUPON: creator claimed sample coupon (a type of coupon) and used it to purchase orders at a discount price.<br>- SAMPLE_CAMPAIGN: activity organized by the platform. Creators can participate in this activity to obtain sample products provided by the platform for free. |
|   ↳ `status` | `string` | The status of sample applications.<br>The possible enumerated values are:<br>- PENDING: The sample application is waiting for the seller's review.<br>- AWAITING_SHIPMENT: The application is approved, and the seller needs to ship the sample.<br>- SHIPPED: The sample has been shipped by the seller and is waiting for the creator to receive the package.<br>- CONTENT_PENDING: The creator has received the sample package and is expected to create content.<br>- REJECT_CANCELLED: The sample application has been rejected by the seller.<br>- OVERDUE_CANCELLED: The sample application has expired due to being overdue.<br>- UNFULFILL_CANCELLED: The creator did not fulfill the commitment to create content within the agreed timeframe.<br>- SELLER_NOT_SHIP_CANCELLED: The seller did not ship the sample within the required timeframe.<br>- WITHDRAW_CANCELLED: The creator withdrew the sample application before the seller approved it.<br>- UNFULFILLABLE_CANCELLED: The application was cancelled due to reasons beyond the creator's control, making it impossible to create content.<br>- OPS_CANCELLED: The application was manually cancelled by operations staff.<br>- OPS_FAILED: The application was marked as failed by operations staff.<br>- OPS_ COMPLETED: The application was manually marked as completed by operations staff.<br>- COMPLETED: The application is complete, and the creator has posted the content.<br>This field allows for tracking the status of a sample application throughout its lifecycle, providing visibility into each stage of the process for sellers and creators. |
|   ↳ `creator_fulfillment` | `object` | Fulfillment info for this sample application. |
|    ↳ `id` | `string` | Fulfillment identifier. |
|    ↳ `expiration_time` | `int` | Fulfillment deadline timestamp, in seconds. |
|    ↳ `total_suspend_duration` | `int` | Total suspension duration for fulfillment, in seconds. |
|    ↳ `status` | `string` | Fulfillment status, It indicates the current status of the fulfillment process. The possible values are:<br>- PENDING: The creator is yet to fulfill the content creation obligation.<br>- ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.<br>- SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.<br>- FAILED: Fulfillment failed; the content did not meet the required standards.<br>- OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.<br>- SUSPEND: Fulfillment has been suspended.<br>- CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.<br>- EXEMPTED: The creator has been exempted from the fulfillment obligation. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

### 14. Creator Search Sample Application Fulfillments

`POST` `/affiliate_creator/202409/sample_applications/fulfillments/search`

| | |
|---|---|
| **Versão** | `202409` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate_collaboration.read` |
| **Pacote(s) de auth** | Read Creator Affiliate Collaborations |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `creator-search-sample-application-fulfillments-202409` |

**Descrição:** You, the creator, can use this API to query the fulfillment status for the received sample applications.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `sort_order` | `string` | — | The sort order for the field specified in the sort_field parameter. <br>Default: ASC<br>Possible values:<br>ASC: Ascending order<br>DESC: Descending order |
| `sort_field` | `string` | — | Some sorting fields are as follows:<br>- expired_time: sort by left time to fulfill.<br>- create_time: sort by fulfillment content create time.<br>Default value  is expired_time. |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `fulfillment_statuses` | `[]string` | Sim | A list of fulfillment statuses. The response is filtered to include sample fulfillments with the fulfillment_status field set to one of the specified values.  The possible values are:<br>- PENDING: The creator has not yet fulfilled the content creation obligation.<br>- ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.<br>- SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.<br>- FAILED: Fulfillment failed; the content did not meet the required standards.<br>- OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.<br>- SUSPEND: Fulfillment has been suspended.<br>- CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.<br>- EXEMPTED: The creator is exempt from the fulfillment obligation. |

<details><summary>Exemplo de request body</summary>

```json
{
  "fulfillment_statuses": [
    "PENDING",
    "ONGOING"
  ]
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `fulfillments` | `[]object` | Creator fulfillment contents. |
|   ↳ `id` | `string` | The fulfillment identifier. |
|   ↳ `shop_id` | `string` | The TikTok Shop identifier. |
|   ↳ `application_id` | `string` | The sample application identifier. |
|   ↳ `sample_application_type` | `string` | The type of the sample application. This is an enumerated type with values:<br>- FREE_SAMPLE<br>- SAMPLE_COUPON<br>- SAMPLE_CAMPAIGN<br>- PLATFORM_FREE_SAMPLE |
|   ↳ `product_id` | `string` | The product identifier. |
|   ↳ `expiration_time` | `int` | Fulfillment deadline timestamp.<br>Usually the value is  `{you_receiving_sample_time} + 14Days`. But if you apply for fulfillment suspension, the value is `{you_receiving_sample_time} + 14Days + total_suspend_duration`. |
|   ↳ `total_suspend_duration` | `int` | The duration you applied for fulfillment suspension in seconds. |
|   ↳ `status` | `string` | The fulfillment status.This is an enumerated type with values:<br>- PENDING: The creator has not yet fulfilled the content creation obligation.<br>- ONGOING: Fulfillment is in progress; content has been created and is being evaluated against criteria.<br>- SUCCEED: Fulfillment has been successfully completed; the content meets the required standards.<br>- FAILED: Fulfillment failed; the content did not meet the required standards.<br>- OVERDUE: Fulfillment is overdue; the creator did not meet the deadline.SUSPEND: Fulfillment has been suspended.<br>- CANCELLED: Fulfillment has been cancelled, either by the creator or due to operational reasons.<br>- EXEMPTED: The creator is exempt from the fulfillment obligation. |
|   ↳ `bound_product_status` | `string` | The marketing status of the product associated with the fulfillment order. This is an enumerated type with values:<br>- UNKNOWN: The marketing status of the product is unknown.<br>- LIVE: The product is available for fulfillment.<br>- OUT_OF_STOCK: The product is out of stock and cannot be fulfilled.<br>- SELLER_DEACTIVATE: The product has been deactivated by the seller.<br>- PLATFORM_DEACTIVATE: The product has been deactivated by the platform.<br>- NO_PLAN: There is no valid plan available for the creator to market the product.<br>- PERMANENT_DELETED: The product has been permanently deleted and is no longer available. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

## Links de afiliado

### 15. Creator Generate General Link

`POST` `/affiliate_creator/202505/affiliate_sharing_links/general_publishers/generate_batch`

| | |
|---|---|
| **Versão** | `202505` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate.share_link.read` |
| **Pacote(s) de auth** | Read Affiliate Share Link |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `creator-generate-general-link-202505` |

**Descrição:** You can use this API to generate material sharing links for your publishers. After that, you can encapsulate the sharing link with additional information like publisher ID. Right now, the material type must be `PRODUCT`.

Please ensure that the material is included in the campaign by using [Generate Multi Affiliate Partner Campaign Product Links].

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `material` | `object` | Sim | The entities for which the sharing links are generated. |
|  ↳ `ids` | `[]string` | Sim | The list of material IDs. The max length is 50. |
|  ↳ `type` | `string` | Sim | Right now, the only possible value is `PRODUCT`.<br>When `material_ids==PRODUCT`, use pids for material IDs.<br> |
|  ↳ `promotion_campaign_schema` | `string` | — | When type is set to CAMPAIGN, this field is required. This schema is associated with the Campaign page. |
| `campaign_id` | `string` | — | If a creator adds products from a campaign, please include the campaign ID. The campaign ID can be found in the Affiliate Center or retrieved using the Get Affiliate Partner Campaign List API. |
| `link_type` | `string` | — | Default value is empty. <br>- For Tokopedia agencies, you may pass `TOKO` to return the Tokopedia product URL.<br>Otherwise, the TikTok Shop product URL will be returned. |

<details><summary>Exemplo de request body</summary>

```json
{
  "material": {
    "ids": [
      "7362840009596339971",
      "7362840009596339923"
    ],
    "type": "PRODUCT",
    "promotion_campaign_schema": "https://www.tiktok.com/t/ZSxRC4FEL/"
  },
  "campaign_id": "7332840009596339923",
  "link_type": "TOKO"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `sharing_links` | `[]object` | The successfully generated sharing links. |
|   ↳ `material_id` | `string` | Material ID. |
|   ↳ `sharing_link` | `string` | This is the product promotion link that agencies can share with collaborated creators. Creators can copy/paste this link into the web browser. <br>After you have the links, add the following request parameters and their corresponding values to the end of the link URL. When a user places an order using this link, the resulting e-commerce order will carry these parameters as part of its information:<br>- event_id: Unique event id for each click<br>- publisher_id: The unique publish_id assigned by CJ<br>Nice to have<br>- publisher_name: From CJ publisher profile.<br>- device_type: 1-mobile, 2-desktop.<br>- device_id: The clicks from the same device id can be aggregated as UV.<br>- referrer_src: The URL of the webpage that a user came from before landing on the current share link. |
|   ↳ `deep_link` | `string` | A product promotion deep link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).<br>To enable attribution, append the following query parameteReplace the `o_event_id` value in the `deeplink` URL with a developer-generated unique ID (one per click). Do not perform any URL encoding or decoding on the link. If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking. |
|   ↳ `one_link` | `string` | A product promotion one-link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).<br>To enable attribution, append the following query parameteReplace the `o_event_id` value in the `deeplink` URL with a developer-generated unique ID (one per click). Do not perform any URL encoding or decoding on the link. If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking.<br>If the user does not have TikTok installed on their phone, they will be redirected to the app store to install TikTok. |
|  ↳ `failed_materials` | `[]object` | The list of materials which failed to generate sharing links for. |
|   ↳ `material_id` | `string` | Material ID. |
|   ↳ `fail_reason` | `string` | Fail reason. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 16. Creator Generate Publisher Link

`POST` `/affiliate_creator/202504/affiliate_sharing_links/publisher/{publisher_id}/generate_batch`

| | |
|---|---|
| **Versão** | `202504` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate.share_link.read` |
| **Pacote(s) de auth** | Read Affiliate Share Link |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `creator-generate-publisher-link-202504` |

**Descrição:** You can use this API to generate material sharing links for a specific publisher. After that, you can share the link with the publisher. Right now, the material type must be `PRODUCT`.

Please ensure that the material is included in the campaign by using [Generate Multi Affiliate Partner Campaign Product Links](generate-multi-affiliate-partner-campaign-product-links).

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `publisher_id` | `string` | Sim | The publisher id in partner's system |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `material` | `object` | Sim | The entities for which the sharing links are generated. |
|  ↳ `ids` | `[]string` | Sim | The list of material IDs. The max length is 50. |
|  ↳ `type` | `string` | Sim | Right now, the only possible value is `PRODUCT` or `CAMPAIGN`.<br>When `material_ids==PRODUCT`, use pids for material IDs. |
|  ↳ `promotion_campaign_schema` | `string` | — | When `type` is set to `CAMPAIGN`, this field is required. This schema is associated with the Campaign page. |
| `campaign_id` | `string` | — | If a creator adds products from a campaign, please include the campaign ID. The campaign ID can be found in the Affiliate Center or retrieved using the Get Affiliate Partner Campaign List API. |
| `link_type` | `string` | — | Default value is empty. <br>- For Tokopedia agencies, you may pass `TOKO` to return the Tokopedia product URL.<br>Otherwise, the TikTok Shop product URL will be returned. |

<details><summary>Exemplo de request body</summary>

```json
{
  "material": {
    "ids": [
      "7362840009596339971",
      "7362840009596339923"
    ],
    "type": "PRODUCT",
    "promotion_campaign_schema": "https://www.tiktok.com/t/ZSxRC4FEL/"
  },
  "campaign_id": "7432840009596339923",
  "link_type": "TOKO "
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `sharing_links` | `[]object` | Generated affiliate links for each publisher<br> |
|   ↳ `material_id` | `int` | Material ID. |
|   ↳ `sharing_link` | `string` | This is the product promotion link that agencies can share with collaborated publishers. The publishers can post this link at their will. |
|   ↳ `deep_link` | `string` | A product promotion deep link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).<br>If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking. |
|   ↳ `one_link` | `string` | A product promotion one-link that opens the corresponding TikTok Shop product detail page. Agencies can share this link with collaborated creators, and creators can copy/paste it into a web browser (or share it to users).<br>If a user places an order via this link, the resulting e-commerce order will carry these parameter values for tracking.<br>If the user does not have TikTok installed on their phone, they will be redirected to the app store to install TikTok. |
|  ↳ `failed_materials` | `[]object` | The list of materials which failed to generate sharing links for. |
|   ↳ `material_id` | `string` | Material ID. |
|   ↳ `fail_reason` | `string` | Fail reason. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

## Estúdio de conteúdo shoppable

### 17. Get Shop Products

`GET` `/affiliate_creator/202509/shop_products`

| | |
|---|---|
| **Versão** | `202509` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-shop-products-202509` |

**Descrição:** Developer can utilize this API to search and retrieve products information of shop which is bound by a specific creator with specific keywords.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `title_keyword` | `string` | — | The title keyword of the product you wish to search by. |
| `sort_field` | `string` | — | Sort fields include PRODUCT_ID, PRICE and SALE. If sort_field is empty or invalid, PRODUCT_ID will be set as default. |
| `sort_order` | `string` | — | Sort orders include DESC and ASC. If sort order is empty or invalid, DESC will be set as default. |
| `page_size` | `int` | Sim | Pagination count determines how many products you'll get after sending the request. 20 is a recommended number.<br>Valid Range: [1-100] |
| `page_token` | `string` | — | The pagination offset that determines where you begin your search. If you are making your first request, this will be empty. |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `products` | `[]object` | The searched product list. It will be empty when there are no search results. |
|   ↳ `id` | `string` | TikTok product ID. |
|   ↳ `title` | `string` | Product name. |
|   ↳ `price` | `object` | Product price shown with two decimal places and currency. |
|    ↳ `amount` | `string` | Product price with two decimal places. |
|    ↳ `currency` | `string` | Product price currency, based on region where creators can sell. |
|   ↳ `added_status` | `string` | Showcase add status with possible values:<br>- ADDABLE<br>- ADDED<br>- REJECTED |
|   ↳ `brand_name` | `string` | The brand name a seller has set for a product. |
|   ↳ `images` | `[]object` | Images of a product. |
|    ↳ `url` | `string` | The URL of the product image. |
|    ↳ `width` | `int` | The width of the product image. |
|    ↳ `height` | `int` | The height of the product image. |
|   ↳ `sales_count` | `int` | The number of products that have been sold. |
|  ↳ `total_count` | `int` | The total number of products that meet the query conditions. |
|  ↳ `next_page_token` | `string` | The pagination token is a cursor used for pagination. The token is returned in the previous pagination query to determine the current position. It will be empty when there aren't any products to search for. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 18. Search Music

`GET` `/affiliate_creator/202602/music/search`

| | |
|---|---|
| **Versão** | `202602` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `search-music-202602` |

**Descrição:** Use this api to get music info.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `keyword` | `string` | Sim | Search keyword |
| `search_id` | `string` | — | For the first page, leave search_id empty, the response will return a search_id. Starting from page 2 (i.e., when page_token > 0), include that same search_id in every request to continue paging; otherwise, pagination may fail. |
| `page_token` | `string` | — | First page: leave empty. <br>Next page: copy the next_page_token from the previous response and fill it here |
| `page_size` | `string` | — | Page size |
| `region` | `string` | — | Region code (ISO 3166-1 alpha-2) |
| `language` | `string` | — | Language tag (BCP-47) |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `music` | `[]object` | Music list |
|   ↳ `id` | `string` | Music id |
|   ↳ `title` | `string` | Music title |
|   ↳ `author` | `string` | Artist name |
|   ↳ `cover_thumb` | `object` | Cover image |
|    ↳ `url_list` | `[]string` | Cover image URL list |
|   ↳ `duration` | `string` | Duration in seconds |
|   ↳ `play_url` | `object` | Play URL |
|    ↳ `url_list` | `[]string` | URL list |
|  ↳ `next_page_token` | `string` | use this as the next request’s page_token, only meaningful when has_more=true. |
|  ↳ `has_more` | `bool` | Whether there is another page. |
|  ↳ `search_id` | `string` | Use the same search_id for all subsequent pages of the same search. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

### 19. Upload File Init

`POST` `/open/202512/file/init`

| | |
|---|---|
| **Versão** | `202512` |
| **Método HTTP** | POST |
| **Escopo(s)** | `seller.customer_service`, `creator.video.write` |
| **Pacote(s) de auth** | Customer Service, Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `upload-file-init-202512` |

**Descrição:** To upload a large file to TikTok Shop, such as a video, first use this API to initialize the upload session. Then upload the file to the returned upload URL; files smaller than 5 MB must be uploaded as a single, non-chunked request. After the upload step returns a ResourceId, pass that ResourceId to the API for the target path.



For more details, see https://partner.tiktokshop.com/docv2/page/wfi3nz36.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `shop_cipher` | `string` | — | Use this property to pass shop information in requesting the API. Failure in passing the correct value when requesting the API for cross-border shops will return incorrect response. <br>Get by API [Get Authorization Shop](https://partner.tiktokshop.com/docv2/page/6507ead7b99d5302be949ba9?external_id=6507ead7b99d5302be949ba9) |
| `category_asset_cipher` | `string` | — | Use this property to pass shop information in requesting the API. Failure in passing the correct value when requesting the API for cross-border shops will return The partner identifier used in API requests. <br>Retrieve this value by using the [Get Authorized Category Assets API](https://partner.tiktokshop.com/docv2/page/666012dd609d4402cc3be995).  |

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `file_name` | `string` | Sim | The name of the file to upload for this upload session. |
| `file_type` | `string` | Sim | The type of file to upload. Currently, only video is supported. |
| `file_size` | `int` | Sim | file size, bytes |
| `total_chunk_count` | `int` | Sim | The total number of chunks. |
| `target_path` | `string` | Sim | After the video is uploaded, use this interface to bind the video resource to the specific material  |

<details><summary>Exemplo de request body</summary>

```json
{
  "file_name": "video_20251201.mp4",
  "file_type": "video",
  "file_size": 1024,
  "total_chunk_count": 1,
  "target_path": "[POST]/affiliate_seller/202501/images/upload"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `upload_url` | `string` | The URL provided by platform where the file can be uploaded. |
|  ↳ `upload_token` | `string` | The upload token used when uploading the file to the returned upload URL. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "upload_url": "https://open-api.tiktokglobalshop.com/file/202512/upload",
    "upload_token": "example_upload_token_4f7a9c2e8b1d"
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 20. Upload Shoppable Video File

`POST` `/affiliate_creator/202505/videos/video_files`

| | |
|---|---|
| **Versão** | `202505` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `upload-shoppable-video-file-202505` |

**Descrição:** Use this API to upload the video before posting to TikTok

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `data` | `file` | Sim | The local file to be uploaded.<br>Note：<br>- Supported formats: MP4, MOV, MKV, WMV, WEBM, AVI, 3GP, FLV, MPEG<br>- Max video size: 100 MB<br>- Video aspect ratio: 9:16 to 16:9<br>Recommendations for product videos:<br>- Resolution: 720p or higher<br>- Duration: > 30 seconds |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `video_file` | `object` | Video file information. |
|   ↳ `id` | `string` | The id from of the uploaded video file. |
|   ↳ `md5` | `string` | Upload file md5 checksum |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "video_file": {
      "id": "123123123123",
      "md5": "D41D8CD98F00B204E9800998ECF8427E"
    }
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 21. Upload Shoppable Photo File

`POST` `/affiliate_creator/202511/photos/photo_files`

| | |
|---|---|
| **Versão** | `202511` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `upload-shoppable-photo-file-202511` |

**Descrição:** Use this API to upload the photos before photo posting. It returns the photo_file_uri for each uploaded image

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `data` | `file` | Sim | The local file to be uploaded.<br>The local image file to be uploaded.<br><br>Note:<br>- Supported formats: JPG, JPEG, PNG, WEBP, HEIC, BMP<br>- Max size: 10MB<br><br>- aspect ratio: 9:16 to 16:9 |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `photo_file` | `object` | Photo Info |
|   ↳ `photo_uri` | `string` | In [Post Shoppable Photos], use this photo URI to fill photo_file_uris field |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "photo_file": {
      "photo_uri": "skldjfskdlfjlskdfs000023423s"
    }
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

### 22. Precheck Video Content

`POST` `/affiliate_creator/202511/videos/precheck_task`

| | |
|---|---|
| **Versão** | `202511` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `precheck-video-content-202511` |

**Descrição:** Use this API to pre-check if there's any violation in the video and the shoppable content anchor

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `video_info` | `object` | Sim | Video information |
|  ↳ `file_id` | `string` | Sim | Video file_id from [Upload Shoppable Video File](https://api/affiliate_creator/202505/videos/video_files) |
| `product_link_info` | `object` | Sim | Product link information |
|  ↳ `product_id` | `string` | Sim | Use product_id to bind the product with the video.<br>The product_id from [Get Shop Products](https://api/affiliate_creator/202509/shop_products) or [Get Showcase Products](https://api/affiliate_creator/202405/showcases/products) |
|  ↳ `title` | `string` | Sim | The title to be shown on the product anchor. Anchor title should be shorter than 30 characters. |

<details><summary>Exemplo de request body</summary>

```json
{
  "video_info": {
    "file_id": "v12d00gd0024d3nfqr7og65"
  },
  "product_link_info": {
    "product_id": "17294069642063424",
    "title": "Sample product anchor title"
  }
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `precheck` | `object` | Video content pre-check task result |
|   ↳ `task_id` | `string` | pre-check task id |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "precheck": {
      "task_id": "1123123123"
    }
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `16011007` | Product link title should be no longer than 30 characters. |
| `16011009` | Product link title contains offensive language. |
| `16011069` | Product link title contains punctuation or emoji. |
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |
| `170001002` | Creator TikTok Shop permission check failed. |
| `170001005` | Creator terms of service not signed. Please contact TikTok for more details. |
| `170001006` | GKA terms not signed. Please try again after signing GKA term. |
| `170001007` | Creator did not sign the EU data share agreement. |
| `170001008` | Creator Age verification failed. Please verify age first. |
| `170001009` | The product belongs to unsupported category. |
| `170001010` | The commission plan gets failed or rejected. |
| `170001011` | The product doesn't exist. |
| `170001012` | The product is not available. |
| `170001013` | Showcase SPU exceeds limit. |
| `170001014` | Blocked by spam check. |
| `170001015` | Blocked by TikTok Shop risk control. |
| `170001018` | Get creator pay account error. Please verify the pay account first. |
| `170001019` | The user has exceeded allocated daily quota for precheck resource |

[↑ Voltar ao índice](#índice)

---

### 23. Get Shoppable Video Precheck Result

`GET` `/affiliate_creator/202601/videos/precheck_tasks/{task_id}`

| | |
|---|---|
| **Versão** | `202601` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-shoppable-video-precheck-result-202601` |

**Descrição:** Use this API to get video pre-check result

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `task_id` | `string` | Sim | task id from [Precheck Video Content](https://partner.tiktokshop.com/docv2/page/precheck-video-content-202511) |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `precheck_task` | `object` | Video pre-check task |
|   ↳ `id` | `string` | The id of the video pre-check task. |
|   ↳ `violation_check_result` | `object` | violation check details |
|    ↳ `status` | `string` | SUCCESS: The precheck task passed violation checks<br>FAIL: The precheck task has failed due to violations. Check the 'issues' field for details.<br>PROCESSING: The precheck violation task is still in progress |
|    ↳ `issues` | `[]object` | A list of policy violation details returned when violation check fails |
|     ↳ `risk` | `string` | Policy violation |
|     ↳ `suggestions` | `string` | Detailed guidance to resolve the detected violation. |
|   ↳ `good_quality_check_result` | `object` | good qualtiy check details |
|    ↳ `status` | `string` | SUCCESS: The precheck task passed all good quality checks<br>FAIL: The precheck task failed good quality checks. Check the 'issues' field for details.<br>PROCESSING: The good qualtify check is still in progress |
|    ↳ `issues` | `[]object` | A list of quality issues and improvement suggestions when the good quality check fails. |
|     ↳ `code` | `string` | Quality finding |
|     ↳ `suggestions` | `string` | Recommended improvements based on the quality finding. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |

[↑ Voltar ao índice](#índice)

---

### 24. Post Shoppable Video

`POST` `/affiliate_creator/202607/videos`

| | |
|---|---|
| **Versão** | `202607` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `post-shoppable-video-202607` |

**Descrição:** Use this API to post the shoppable video.

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `video_info` | `object` | Sim | Video information |
|  ↳ `file_id` | `string` | Sim | Video file_id from [Upload Shoppable Video File] |
|  ↳ `title` | `string` | Sim | The video caption. <br>The maximum length is 4000 in UTF-16 runes.<br>If not specified, the ticket post will not have any captions. |
|  ↳ `cover_uri` | `string` | — | Video cover image URI, which is returned after uploading the image via the Upload Shoppable Photo File API. |
|  ↳ `cover_timestamp_ms` | `int` | — | The input parameter is a timestamp, which specifies a particular moment in the video. The frame at that timestamp will be used as the video cover. If cover_uri and cover_timestamp_ms are both not provided, the cover will default to the first frame of the uploaded video. Only one of cover_uri or cover_timestamp_ms can be provided. If both parameters are passed, cover_uri will take precedence. |
|  ↳ `music_id` | `string` | — | The music ID for the video BGM. If not provided, no music will be associated with the video. The music ID must be obtained via Search Music Library. |
|  ↳ `is_ai_generated` | `bool` | — | Field to indicate whether the content was AI generated. Marking this field as true will display a tag indicating this post as an AI generated post. |
| `product_link_info` | `object` | Sim | Product link information |
|  ↳ `product_id` | `string` | Sim | Use product_id to bind the product with the video.<br>The product_id from [Get Shop Products] or [Get Showcase Products] |
|  ↳ `title` | `string` | Sim | The title to be shown on the product anchor. Anchor title should be shorter than 30 characters. |

<details><summary>Exemplo de request body</summary>

```json
{
  "video_info": {
    "file_id": "v12d00gd0024d3nfqr7og65",
    "title": "Sample video title",
    "cover_uri": "v12d00gd0024d3nfqr7og65oooiuuyy",
    "cover_timestamp_ms": 1000,
    "music_id": "717294069642063456",
    "is_ai_generated": false
  },
  "product_link_info": {
    "product_id": "17294069642063424",
    "title": "Sample product anchor title"
  }
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `video` | `object` | Published video information |
|   ↳ `id` | `string` | The video id, use this id to query video publish status. |
|  ↳ `quota` | `string` | Content posting quota for the creator. Returned on successful publish; included in the error message on failure; omitted if no quota restriction applies. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "video": {
      "id": "7548431509997292816"
    },
    "quota": "3/day"
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `16011007` | Product link title should be no longer than 30 characters. |
| `16011009` | Product link title contains offensive language. |
| `16011069` | Product link title contains punctuation or emoji. |
| `38007001` | System Error |
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |
| `170001002` | Creator TikTok Shop permission check failed. |
| `170001003` | Creator Tiktok Shop permission temporarily banned. |
| `170001004` | Creator TikTok Shop permission is permanently banned. |
| `170001005` | Creator terms of service not signed. Please contact TikTok for more details. |
| `170001006` | GKA terms not signed. Please try again after signing GKA term. |
| `170001007` | Creator did not sign the EU data share agreement. |
| `170001008` | Creator Age verification failed. Please verify age first. |
| `170001009` | The product belongs to unsupported category. |
| `170001010` | The commission plan gets failed or rejected. |
| `170001011` | The product doesn't exist. |
| `170001012` | The product is not available. |
| `170001013` | Showcase SPU exceeds limit. |
| `170001014` | Blocked by spam check. |
| `170001015` | Blocked by TikTok Shop risk control. |
| `170001018` | Get creator pay account error. Please verify the pay account first. |
| `170001020` | You have exceeded the frequency to post EC short videos. Please take a rest. |
| `170001024` | cover_timestamp_ms must be a non-negative integer within the video duration. |
| `170001025` | cover_timestamp_ms exceeds the video duration. |
| `170001030` | Creator account banned. Please contact TikTok agent for your account. |
| `170001031` | Creator forbidden to post content. |
| `170001040` | Please use valid video file id to post TikTok Shop short video. |
| `170001050` | Getting errors during video posting workflow. Please try again or contact TikTok. |
| `170001060` | Posting quota exceeded: the creator is under violation control, resulting in a reduced posting limit. |
| `170001061` | Posting quota exceeded: creator is in the newbie period. |
| `170001062` | Posting quota exceeded: platform-level posting limit reached. |

[↑ Voltar ao índice](#índice)

---

### 25. Post Shoppable Photos

`POST` `/affiliate_creator/202607/photos`

| | |
|---|---|
| **Versão** | `202607` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `post-shoppable-photos-202607` |

**Descrição:** Use this API to post the shoppable photos with uris and metadata.

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `photos_info` | `[]object` | Sim | Photo Info Metadata |
|  ↳ `photo_file_uris` | `string` | Sim | Photo file uris, not a file upload. Use [Upload Shoppable Photo File] to upload the image and obtain the photo_file_uri, then pass that URI in this field |
| `music_id` | `string` | — | Music ID |
| `title` | `string` | — | Post title:The maximum length is 5000 in UTF-16 runes. If not specified, the ticket post will not have any captions.   - You can add relevant hashtags to increase discoverability. The format is simply # followed by the topic name. Multiple hashtags are supported,e.g.,#humor#BFCM |
| `link_info` | `object` | — | Photo anchor and linking metadata |
|  ↳ `post_type` | `string` | Sim | 1-LINK_TO_PRODUCT, 2-LINK_TO_SHOP, 3-LINK_TO_ONE_PIC_ONE_PRODUCT |
|  ↳ `shop_info` | `object` | — | Shop Info |
|   ↳ `shop_id` | `string` | — | Shop ID |
|   ↳ `group_type` | `string` | — | 1 for shop_home_page, 2 for category, 3 for collection |
|   ↳ `group_id` | `string` | — | Category ID/Collection ID. Use [Get Shop Category And Collection] to retrieve a valid category_id or collection_id, then set it in this field |
|  ↳ `links` | `[]object` | — | Photo Anchor List |
|   ↳ `product_id` | `string` | — | Product ID |
|   ↳ `link_title` | `string` | — | Photo Anchor Title:The title to be shown on the product anchor. Anchor title should be shorter than 30 characters |

<details><summary>Exemplo de request body</summary>

```json
{
  "photos_info": [
    {
      "photo_file_uris": "[\"skldjf...\"]"
    }
  ],
  "music_id": "7577090708998212365",
  "title": "Post title",
  "link_info": {
    "post_type": "1",
    "shop_info": {
      "shop_id": "7494831143334152261",
      "group_type": "1",
      "group_id": "6"
    },
    "links": [
      {
        "product_id": "74998589993939330",
        "link_title": "product A"
      }
    ]
  }
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `photo` | `object` | Post shoppable photos response  |
|   ↳ `photo_post_id` | `string` | Photo post ID |
|  ↳ `quota` | `string` | Content posting quota for the creator. Returned on successful publish; included in the error message on failure; omitted if no quota restriction applies. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "photo": {
      "photo_post_id": "34234234234324342"
    },
    "quota": "3/day"
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `16011007` | Product link title should be no longer than 30 characters. |
| `16011009` | Product link title contains offensive language. |
| `16011069` | Product link title contains punctuation or emoji. |
| `38007001` | System Error |
| `36009003` | Internal error. Please try again. If the issue persists after multiple attempts, please contact platform support. |
| `170001002` | Creator TikTok Shop permission check failed. |
| `170001003` | Creator Tiktok Shop permission temporarily banned. |
| `170001004` | Creator TikTok Shop permission is permanently banned. |
| `170001005` | Creator terms of service not signed. Please contact TikTok for more details. |
| `170001006` | GKA terms not signed. Please try again after signing GKA term. |
| `170001007` | Creator did not sign the EU data share agreement. |
| `170001008` | Creator Age verification failed. Please verify age first. |
| `170001009` | The product belongs to unsupported category. |
| `170001010` | The commission plan gets failed or rejected. |
| `170001011` | The product doesn't exist. |
| `170001012` | The product is not available. |
| `170001013` | Showcase SPU exceeds limit. |
| `170001014` | Blocked by spam check. |
| `170001015` | Blocked by TikTok Shop risk control. |
| `170001018` | Get creator pay account error. Please verify the pay account first. |
| `170001020` | You have exceeded the frequency to post EC short videos. Please take a rest. |
| `170001030` | Creator account banned. Please contact TikTok agent for your account. |
| `170001031` | Creator forbidden to post content. |
| `170001040` | Please use valid video file id to post TikTok Shop short video. |
| `170001050` | Getting errors during video posting workflow. Please try again or contact TikTok. |
| `170001060` | Posting quota exceeded: the creator is under violation control, resulting in a reduced posting limit. |
| `170001061` | Posting quota exceeded: creator is in the newbie period. |
| `170001062` | Posting quota exceeded: platform-level posting limit reached. |

[↑ Voltar ao índice](#índice)

---

### 26. Get Shoppable Video Status

`GET` `/affiliate_creator/202509/videos/{video_id}/status`

| | |
|---|---|
| **Versão** | `202509` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-shoppable-video-status-202509` |

**Descrição:** Use this API to get shoppable video posting results.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `video_id` | `string` | Sim | The video id from [Publish Shoppable Video] |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `video` | `object` | returned video info |
|   ↳ `id` | `string` | Video id |
|   ↳ `post_status` | `string` | Video posting status, possible values:<br>- SUCCESS<br>- FAIL<br>- PROCESSING |
|   ↳ `post_time` | `int` | Returned if the video has been successfully posted, i.e. `posting_status = SUCCESS`.<br>Represented in seconds. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
    "video": {
      "id": "7493990579714164574",
      "post_status": "FAIL",
      "post_time": 1685548800
    }
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `38007001` | System Error |
| `170001016` | The video does not belong to the creator or the video is not photo post. Please check valid video status. |

[↑ Voltar ao índice](#índice)

---

## Analytics de conteúdo (creator scope)

### 27. Get Video Performances

`GET` `/analytics/202403/videos/performances`

| | |
|---|---|
| **Versão** | `202403` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.video.write` |
| **Pacote(s) de auth** | Content Posting |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-video-performances-202403` |

**Descrição:** Use this US-creator-only API to retrieve TikTok e-commerce video metrics, including anchor_display_rate, click_through_rate, orders, items_sold, and GMV, for the requested videos.

**Query parameters** (além de `app_key`, `sign`, `timestamp`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `video_ids` | `string` | Sim | Collection of video IDs for retrieving the e-commerce metrics. Callers must ensure that all video IDs share the same author ID. Limit collection size 100. Use "," to separate array elements when send in the query. |
| `start_time_ge` | `int` | Sim | Start date for the metrics, set with a one-day delay from today due to latency in the data pipeline. The start_time parameter must be within the last 180 days from the current date. Only date value is processed, hour/mininute/second values will be ignored. <br>For example, if the start_time value is: 1703507696 ("26-12-2023 04:34:56"), backend service will only consider the part "26-12-2023" when doing the query because by default, in offline data analytics, there is no hour/min/sec data level.  |
| `end_time_le` | `int` | Sim | End date for the metrics, set with a one-day delay from today due to latency in the data pipeline. Only date value is processed, hour/mininute/second values will be ignored.  |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `videos` | `[]object` | Contains a list of video objects. The inner list of objects will be organized in ascending order based on the video_id field. |
|   ↳ `id` | `string` | Each video ID in the request parameter corresponds to array of daily metrics. |
|   ↳ `performances` | `[]object` | The list of objects within will be arranged in ascending order based on the start_time field. |
|    ↳ `time_range` | `object` | Time range object |
|     ↳ `start_time` | `int` | Date of the metrics. |
|     ↳ `end_time` | `int` | Date of the metrics. |
|    ↳ `metrics` | `object` | Metrics object. |
|     ↳ `anchor_display_rate` | `string` | Display rate for anchors, specified with two decimal numbers. |
|     ↳ `click_through_rate` | `string` | Click through rate, specified with two decimal numbers. |
|     ↳ `order_count` | `int` | Number of orders in this date. |
|     ↳ `item_sold_count` | `int` | Number of sold items in this date. |
|     ↳ `gmv` | `object` | GMV object |
|      ↳ `amount` | `string` | GMV value for this date, specified with two decimal numbers. |
|      ↳ `currency` | `string` | Currency of GMV value, three-letter code, ISO 4217 |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 28. Get Live Room Core Stats

`GET` `/analytics/202502/live_rooms/{live_room_id}/core_stats`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-core-stats-202502` |

**Descrição:** Returns core stats for the specified live room, including GMV, order counts, buyer counts, product click counts, and view counts.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | the live stream room id |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `stats` | `object` | The stats of the live room |
|   ↳ `sales` | `int` | The number of product units sold from the livestream |
|   ↳ `local_gmv` | `object` | Revenue |
|    ↳ `amount` | `string` | The amount of GMV |
|    ↳ `currency` | `string` | Currency Code |
|   ↳ `created_order_count` | `int` | The number of SKU orders created by users from the livestream |
|   ↳ `current_visitor_count` | `int` | Viewers |
|   ↳ `paid_order_count` | `int` | The number of SKU orders created and paid by users from the livestream |
|   ↳ `local_unit_price` | `object` | The average price of the units sold |
|    ↳ `amount` | `string` | The amount of unit price |
|    ↳ `currency` | `string` | Currency Code |
|   ↳ `product_reach_count` | `int` | The number of product clicks from the livestream, including product list and product card clicks |
|   ↳ `watch_pv` | `int` | The number of views of the livestream |
|   ↳ `click_through_rate` | `string` | Click through rate，product clicks / views |
|   ↳ `accumulated_new_follower_count` | `int` | The number of times users clicked to follow the creator |
|   ↳ `buyer_count` | `int` | The number of unique users who paid for orders made from livestream, including returned/refunded orders |
|   ↳ `accumulated_comment_count` | `int` | The cumulative number of times users left comments on the livestream |
|   ↳ `product_view_count` | `int` | The number of impressions of all livestream products, including product list and product card impressions |
|   ↳ `click_order_rate` | `string` | Click to order，paid sku orders/ product clicks |
|   ↳ `avg_watching_duration` | `int` | The average length of time each unique viewer watches the livestream. |
|   ↳ `accumulated_sharing_count` | `int` | The cumulative number of times users shared the livestream |
|   ↳ `peak_concurrent_user_count` | `int` | The peak number of concurrent viewers of the livestream |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

### 29. Get Live Room GMV Trend

`GET` `/analytics/202502/live_rooms/{live_room_id}/gmv_trend_performances`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-gmv-trend-202502` |

**Descrição:** Returns GMV trend performance points for the specified live room, including GMV and created-order trend values.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | live stream room id |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `gmv_trend_performances` | `[]object` | The trend of GMV chart<br> |
|   ↳ `stats_type` | `string` | The stats_type describes the type of trend value. Possible values: TREND_GMV (GMV of the live streaming room), TREND_CREATED_ORDER (created orders in the live streaming room). |
|   ↳ `data_points` | `[]object` | The data point of GMV trend<br> |
|    ↳ `order_count` | `int` | If stats_type is TREND_CREATED_ORDER, it will return the  order count in current timestamp |
|    ↳ `timestamp` | `int` | timestamp |
|    ↳ `gmv` | `object` | If stats_type is TREND_GMV, it will return the value of GMV in the current timestamp |
|     ↳ `currency` | `string` | Currency Code |
|     ↳ `amount` | `string` | The amount of GMV |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

### 30. Get Live Room View Trends

`GET` `/analytics/202502/live_rooms/{live_room_id}/view_trend_performances`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-view-trends-202502` |

**Descrição:** Returns viewer count trend data points for the specified live room, grouped by online, entering, and leaving viewers.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | The ID of the live stream room whose viewer trend data is requested. |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `view_trend_performances` | `[]object` | Viewer count trends of the live streaming room |
|   ↳ `stats_type` | `string` | The viewer trend category.<br>TREND_ONLINE_VIEWER: Viewers who are watching the live streaming room.<br>TREND_ENTER_VIEWER: Viewers who enter the live streaming room.<br>TREND_LEFT_VIEWER: Viewers who left the live streaming room. |
|   ↳ `data_points` | `[]object` | The data point of view trend |
|    ↳ `value` | `string` | The viewer count for the corresponding trend category at this data point. |
|    ↳ `timestamp` | `int` | Unix timestamp GMT (UTC+00:00). This timestamp is used across all API requests. Developers can use this convert to local time. |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

### 31. Get Live Room Traffic Performance

`GET` `/analytics/202502/live_rooms/{live_room_id}/traffic_performances`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-traffic-performance-202502` |

**Descrição:** Returns traffic performance for the specified live room, including source and sub-source watch counts for distribution analysis.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | live stream room id |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `traffic_performances` | `[]object` | The traffic performances within the livestream room |
|   ↳ `source` | `object` | The source of traffic performances within the live room |
|    ↳ `name` | `string` | The name of the live source |
|    ↳ `watch_pv` | `int` | Watch page value, e.g. Watch count |
|   ↳ `sub_sources` | `[]object` | The sub source of the source<br> |
|    ↳ `name` | `string` | The name of the live sub source |
|    ↳ `watch_pv` | `int` | Watch page value, e.g. Watch count |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

### 32. Get Live Room Interactive Trends

`GET` `/analytics/202502/live_rooms/{live_room_id}/interactive_trend_performances`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-interactive-trends-202502` |

**Descrição:** Returns interactive trend performance points for the specified live room, including watch, comment, and share counts.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | live stream room id |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `interactive_trend_performances` | `[]object` | The trend data of living room |
|   ↳ `stats_type` | `string` | The stats_type describes the type of interactive trend value. Possible values: WATCH_PV (watch count of the live streaming room), COMMENT_PV (comment count of the live streaming room), SHARE_PV (share count of the live streaming room). |
|   ↳ `data_points` | `[]object` | The data point of interactive trend |
|    ↳ `value` | `string` | The value of the interaction information within the livestream room |
|    ↳ `timestamp` | `int` | The time of the data points |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

### 33. Get Live Room Product Stats

`GET` `/analytics/202502/live_rooms/{live_room_id}/product_stats`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-product-stats-202502` |

**Descrição:** Returns the product list for the specified live room, including product IDs, names, GMV, unit price, inventory counts, and click counts.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | live stream room id |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `product_stats` | `[]object` | The stats of the live streaming room, e.g. GMV |
|   ↳ `main_image_url` | `string` | The main image of product URL |
|   ↳ `product_id` | `string` | Unique ID for each product |
|   ↳ `is_live` | `bool` | If the item is currently on sale in the livestream room |
|   ↳ `click_through_rate` | `string` | The ratio of product clicks to product impressions |
|   ↳ `sellable_region` | `string` | The region where products sells |
|   ↳ `created_order_count` | `int` | The number of orders created for this product by users from the livestream |
|   ↳ `exposure_count` | `int` | The number of impressions of this product, including in the product list and product cards |
|   ↳ `total_click_count` | `int` | The total number of times the product was clicked from this livestream, including from the product list and product card |
|   ↳ `local_gmv` | `object` | The revenue of products using local currency |
|    ↳ `amount` | `string` | The amount of GMV |
|    ↳ `currency` | `string` | Currency Code |
|   ↳ `product_name` | `string` | The display name of the product in the live room product stats list. |
|   ↳ `local_unit_price` | `object` | The average price of the units sold using local currency |
|    ↳ `amount` | `string` | The amount of unit price |
|    ↳ `currency` | `string` | Currency Code |
|   ↳ `paid_order_count` | `int` | The number of SKU orders created and paid by users for this product from the livestream room |
|   ↳ `inventory_left_count` | `int` | The remaining inventory of the product |
|   ↳ `inventory_consumption_count` | `int` | The number of product units sold |
|   ↳ `created_order_user_count` | `int` | Number of unique users who created orders for this product |
|   ↳ `paid_user_count` | `int` | Number of unique users who paid orders for this product |
|   ↳ `click_order_rate` | `string` | Product paid SKU orders/Product clicks |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

### 34. Get Live Room User Portraits

`GET` `/analytics/202502/live_rooms/{live_room_id}/user_portraits`

| | |
|---|---|
| **Versão** | `202502` |
| **Método HTTP** | GET |
| **Escopo(s)** | `creator.data.live.read.public` |
| **Pacote(s) de auth** | Live Data |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-live-room-user-portraits-202502` |

**Descrição:** Returns user portrait indicators for the specified live room, including age, gender, fan, advertisement, and region distributions.

**Path parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `live_room_id` | `string` | Sim | The ID of the live stream room whose user portrait indicators are requested. |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `all_ads_gender_indicators` | `[]object` | Gender indicators for advertisement |
|   ↳ `type` | `string` | The stats_type describes the type of value below.<br><br>USER_PORTRAIT_GENDER_UNKNOWN: The user portrait of the unknown gender<br><br>USER_PORTRAIT_GENDER_M: The user portrait of the man<br><br>USER_PORTRAIT_GENDER_F: The user portrait of the female |
|   ↳ `value` | `string` | The number of type |
|  ↳ `all_fan_indicators` | `[]object` | Fans indicators |
|   ↳ `type` | `string` | The stats_type describes the type of value below.<br><br>USER_PORTRAIT_FOLLOWER: The user portrait of the follower<br><br>USER_PORTRAIT_NON_FOLLOWER: The user portrait of the non follower |
|   ↳ `value` | `string` | The number of type |
|  ↳ `all_ads_age_indicators` | `[]object` | Age indicators for advertisement |
|   ↳ `type` | `string` | The type of age indicator.<br>USER_PORTRAIT_AGE_LESS_THAN_15: Users whose age is less than 15.<br>USER_PORTRAIT_AGE_MORE_THAN_34: Users whose age is more than 34.<br>USER_PORTRAIT_AGE_MORE_THAN_55: Users whose age is more than 55.<br>USER_PORTRAIT_AGE_13_TO_17: Users whose age is between 13 and 17.<br>USER_PORTRAIT_AGE_15_TO_17: Users whose age is between 15 and 17.<br>USER_PORTRAIT_AGE_18_TO_24: Users whose age is between 18 and 24.<br>USER_PORTRAIT_AGE_25_TO_34: Users whose age is between 25 and 34.<br>USER_PORTRAIT_AGE_35_TO_44: Users whose age is between 35 and 44.<br>USER_PORTRAIT_AGE_45_TO_54: Users whose age is between 45 and 54. |
|   ↳ `value` | `string` | The value for the corresponding age indicator. |
|  ↳ `region_indicators` | `[]object` | Country-level user portrait indicators for the live room. |
|   ↳ `value` | `string` | The share rate of region, times 10,000 |
|   ↳ `type` | `string` | The country of indicators<br> |
|  ↳ `paid_ads_age_indicators` | `[]object` | Paid advertisement age indicators for advertisement |
|   ↳ `type` | `string` | The type of paid advertisement age indicator.<br>USER_PORTRAIT_AGE_LESS_THAN_15: Users whose age is less than 15.<br>USER_PORTRAIT_AGE_MORE_THAN_34: Users whose age is more than 34.<br>USER_PORTRAIT_AGE_MORE_THAN_55: Users whose age is more than 55.<br>USER_PORTRAIT_AGE_13_TO_17: Users whose age is between 13 and 17.<br>USER_PORTRAIT_AGE_15_TO_17: Users whose age is between 15 and 17.<br>USER_PORTRAIT_AGE_18_TO_24: Users whose age is between 18 and 24.<br>USER_PORTRAIT_AGE_25_TO_34: Users whose age is between 25 and 34.<br>USER_PORTRAIT_AGE_35_TO_44: Users whose age is between 35 and 44.<br>USER_PORTRAIT_AGE_45_TO_54: Users whose age is between 45 and 54. |
|   ↳ `value` | `string` | The number of type |
|  ↳ `paid_ads_gender_indicators` | `[]object` | Paid advertisement gender indicators for advertisement |
|   ↳ `type` | `string` | The stats_type describes the type of value below.<br><br>USER_PORTRAIT_GENDER_UNKNOWN: The user portrait of the unknown gender<br><br>USER_PORTRAIT_GENDER_M: The user portrait of the man<br><br>USER_PORTRAIT_GENDER_F: The user portrait of the female |
|   ↳ `value` | `string` | The number of type |
|  ↳ `paid_fan_indicators` | `[]object` | Paid fans indicators |
|   ↳ `type` | `string` | The stats_type describes the type of value below.<br><br>USER_PORTRAIT_FOLLOWER: The user portrait of the follower<br><br>USER_PORTRAIT_NON_FOLLOWER: The user portrait of the non follower |
|   ↳ `value` | `string` | The number of type |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

**Códigos de erro específicos**

| Código | Mensagem |
|---|---|
| `66009302` | Invalid param. Please check room id. |
| `66009315` | No permission for the action. |

[↑ Voltar ao índice](#índice)

---

## Toko Product Mapper (Indonésia/Tokopedia)

### 35. Get Toko Product Mappers

`GET` `/affiliate_creator/202606/toko_product_mappers`

| | |
|---|---|
| **Versão** | `202606` |
| **Método HTTP** | GET |
| **Escopo(s)** | — |
| **Pacote(s) de auth** | — |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `get-toko-product-mappers-202606` |

**Descrição:** This API for provide TikTok Shop format product id information by using Tokopedia format product id

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `toko_pids` | `[]int` | — | list product id in toko format |

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `error` | `object` | error information |
|   ↳ `code` | `int` | error code message |
|   ↳ `message` | `string` | error detail information |
|  ↳ `product` | `[]object` | list of product data |
|   ↳ `toko_pid` | `int` | product id in tokopedia format |
|   ↳ `tts_pid` | `int` | product id in tts format |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

### 36. Toko Product Mapper V2

`POST` `/affiliate_creator/202607/map_toko_product`

| | |
|---|---|
| **Versão** | `202607` |
| **Método HTTP** | POST |
| **Escopo(s)** | `creator.affiliate.share_link.read` |
| **Pacote(s) de auth** | Read Affiliate Share Link |
| **Precisa `shop_cipher`?** | Não (token de creator, `user_type=1`) |
| **Slug (doc)** | `toko-product-mapper-v2-202607` |

**Descrição:** This API for provide TikTok Shop format product id information by using Tokopedia format product id

**Body parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `toko_pids` | `[]int` | — | list product id in toko format |

<details><summary>Exemplo de request body</summary>

```json
{
  "toko_pids": "123456"
}
```

</details>

**Response**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `code` | `int` | The success or failure status code returned in API response. |
| `message` | `string` | The success or failure messages returned in API response. Reasons of failure will be described in the message. |
| `request_id` | `string` | Request log |
| `data` | `object` | Specific return information |
|  ↳ `error` | `object` | error information |
|   ↳ `code` | `int` | error code message |
|   ↳ `message` | `string` | error detail information |
|  ↳ `product` | `[]object` | list of product data |
|   ↳ `toko_pid` | `int` | product id in tokopedia format |
|   ↳ `tts_pid` | `int` | product id in tts format |

<details><summary>Exemplo de resposta</summary>

```json
{
  "code": 0,
  "data": {
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
  },
  "message": "Success",
  "request_id": "202203070749000101890810281E8C70B7"
}
```

</details>

[↑ Voltar ao índice](#índice)

---

## Apêndice

### A. Como isso encaixa no TikTally

A stack do TikTally (edge functions Supabase + `_shared/tiktokSign.ts` + service→hook→page em
React) reaproveita quase inteira. A diferença central é o **token de creator** (`user_type = 1`,
sem `shop_cipher`) e o **fluxo de OAuth de creator**. O padrão de página Analytics que você já tem
(`analytics-*` edge fns, ofuscadas) serve de molde direto para os endpoints de _Analytics de creator_
listados aqui — inclusive `get-video-performances-202403`, que já é creator-scope.

### B. Endpoints compartilhados / dual-scope

- **`Upload File Init` (`/open/202512/file/init`)** — escopo `seller.customer_service` **e**
  `creator.video.write`. Usado por Customer Service (seller) e por Content Posting (creator).
  Incluído aqui por ser parte do pipeline de publicação de conteúdo shoppable.

### C. Falsos-positivos excluídos

Na varredura por `user_type = 1`, dois endpoints apareceram por aceitarem token de creator em algum
cenário, mas o escopo é **seller** e não pertencem ao contexto de afiliado-creator:
`confirm-package-shipment-202309` (`seller.fulfillment.basic`) e
`product-auditing-research-202601` (`seller.product.basic`).

### D. Reprodutibilidade

Gerado a partir de `partner.tiktokshop.com/api/v1/document/api_meta?src_document_id=<slug>&locale=en-US`
(API pública de docs). Scripts em `scratchpad/creator-api/` (`gen.py` + `assemble.py`). Para
atualizar quando a TikTok publicar novas versões, rebaixe os `api_meta` e rode de novo.
