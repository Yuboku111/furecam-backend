import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedFureCameraData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const shippingProfileService = container.resolve(Modules.FULFILLMENT);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  logger.info("Seeding FureCam product data...");

  // Get existing shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  });
  const shippingProfile = shippingProfiles[0];

  // Get existing sales channel
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  // Create or get FureCamera categories
  let categoryResult = [];
  
  try {
    const { result } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: [
          {
            name: "カメラ・ガジェット",
            is_active: true,
          },
          {
            name: "Y2Kレトロ",
            is_active: true,
          },
        ],
      },
    });
    categoryResult = result;
  } catch (error) {
    logger.info("Categories may already exist, using existing ones");
    // Get existing categories
    const productModuleService = container.resolve(Modules.PRODUCT);
    const categories = await productModuleService.listProductCategories({
      name: ["カメラ・ガジェット", "Y2Kレトロ"],
    });
    categoryResult = categories;
  }

  // Create FureCamera product
  const { result: productResult } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "FureCam - Y2K レトロビデオカメラ",
          category_ids: categoryResult.map(cat => cat.id),
          description: `【平成レトロ×ポケット動画】
          
懐かしの2000年代を手のひらに。FureCamは、Y2Kテイストのコンパクトなデジタルビデオカメラです。

✨ 特徴：
- 手のひらサイズのコンパクトボディ
- Y2Kレトロフィルター内蔵
- 簡単ワンタッチ録画
- USB-C充電対応
- microSD対応（最大128GB）

📦 同梱物：
- FureCam本体
- USB-C充電ケーブル
- ストラップ
- 限定ステッカーセット
- クイックスタートガイド

⚡ 限定10台のみの特別価格！
通常価格 ¥6,450 → 特別価格 ¥4,980

「ポケットに平成、写ルよりエモい。」`,
          handle: "furecamera-y2k-retro",
          weight: 150,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://placehold.co/600x400/F5F5F5/1a1a1a?text=FureCam+Front",
            },
            {
              url: "https://placehold.co/600x400/F0F0F0/1a1a1a?text=FureCam+Side",
            },
            {
              url: "https://placehold.co/600x400/FAFAFA/1a1a1a?text=FureCam+Package",
            },
          ],
          options: [
            {
              title: "カラー",
              values: ["パステルパープル", "ネオンピンク", "クリアブルー"],
            },
          ],
          variants: [
            {
              title: "パステルパープル",
              sku: "FURECAM-PURPLE",
              options: {
                カラー: "パステルパープル",
              },
              prices: [
                {
                  amount: 4980,
                  currency_code: "jpy",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
              manage_inventory: true,
            },
            {
              title: "ネオンピンク",
              sku: "FURECAM-PINK",
              options: {
                カラー: "ネオンピンク",
              },
              prices: [
                {
                  amount: 4980,
                  currency_code: "jpy",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
              manage_inventory: true,
            },
            {
              title: "クリアブルー",
              sku: "FURECAM-BLUE",
              options: {
                カラー: "クリアブルー",
              },
              prices: [
                {
                  amount: 4980,
                  currency_code: "jpy",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
              manage_inventory: true,
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  const product = productResult[0];
  logger.info(`Created FureCam product with ID: ${product.id}`);

  // Get stock location
  const [stockLocation] = await stockLocationModuleService.listStockLocations({});

  if (stockLocation && product.variants) {
    logger.info(`Using stock location: ${stockLocation.name}`);
    
    // Get inventory items for each variant
    for (const variant of product.variants) {
      try {
        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["inventory_item_id", "variant_id"],
          filters: {
            variant_id: variant.id,
          },
        });

        if (links && links[0]) {
          const inventoryLevel = {
            inventory_item_id: links[0].inventory_item_id,
            location_id: stockLocation.id,
            stocked_quantity: variant.options.カラー === "パステルパープル" ? 4 : 3, // Limited stock
          };

          await createInventoryLevelsWorkflow(container).run({
            input: [inventoryLevel],
          });
          
          logger.info(`Set inventory for variant ${variant.title}: ${inventoryLevel.stocked_quantity} units`);
        }
      } catch (error) {
        logger.warn(`Could not set inventory for variant ${variant.title}: ${error.message}`);
      }
    }
  }

  logger.info("Finished seeding FureCam product data.");
}