import { ExecArgs } from "@medusajs/framework/types";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function fixProductPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT);
  const regionService = container.resolve(Modules.REGION);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  
  logger.info("💰 Fixing product prices for Japan region...");

  try {
    // Get Japan region
    const japanRegions = await regionService.listRegions({
      name: "Japan"
    });

    if (japanRegions.length === 0) {
      logger.error("❌ Japan region not found!");
      return;
    }

    const japanRegion = japanRegions[0];
    logger.info(`Found Japan region: ${japanRegion.id}`);

    // Get FureCam product
    const products = await productService.listProducts({
      handle: "furecamera-y2k-retro"
    });

    if (products.length === 0) {
      logger.error("❌ FureCam product not found!");
      return;
    }

    const product = products[0];
    logger.info(`Found product: ${product.title}`);

    // Update product variants with prices
    if (product.variants) {
      const variantUpdates = product.variants.map(variant => ({
        id: variant.id,
        prices: [
          {
            amount: 4980,
            currency_code: "jpy",
            rules: {}
          }
        ]
      }));

      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: product.id },
          update: {
            variants: variantUpdates
          }
        }
      });

      logger.info(`✅ Updated prices for ${product.variants.length} variants`);
    }

    logger.info("\n💴 Product prices fixed!");
    logger.info("All variants now have JPY pricing: ¥4,980");

  } catch (error) {
    logger.error(`❌ Error fixing product prices: ${error.message}`);
  }
}