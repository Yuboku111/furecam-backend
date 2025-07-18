import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function testSetup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve(Modules.PRODUCT);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const inventoryService = container.resolve(Modules.INVENTORY);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("🔍 Testing FureCam E-Commerce Setup...\n");

  try {
    // 1. Check products
    logger.info("1️⃣ Checking products...");
    const products = await productService.listProducts({
      handle: "furecamera-y2k-retro"
    });
    
    if (products.length > 0) {
      logger.info("✅ FureCam product found!");
      const product = products[0];
      logger.info(`   - Title: ${product.title}`);
      logger.info(`   - Handle: ${product.handle}`);
      logger.info(`   - Status: ${product.status}`);
      logger.info(`   - Variants: ${product.variants?.length || 0}`);
      
      // Check variants
      if (product.variants) {
        logger.info("\n   Variants:");
        for (const variant of product.variants) {
          logger.info(`   - ${variant.title}: ¥${variant.prices?.[0]?.amount || 'No price'}`);
        }
      }
    } else {
      logger.warn("❌ No FureCam product found!");
    }

    // 2. Check sales channels
    logger.info("\n2️⃣ Checking sales channels...");
    const salesChannels = await salesChannelService.listSalesChannels({});
    if (salesChannels.length > 0) {
      logger.info("✅ Sales channels found:");
      salesChannels.forEach(sc => {
        logger.info(`   - ${sc.name} (${sc.id})`);
      });
    } else {
      logger.warn("❌ No sales channels found!");
    }

    // 3. Check inventory
    logger.info("\n3️⃣ Checking inventory levels...");
    if (products.length > 0 && products[0].variants) {
      for (const variant of products[0].variants) {
        try {
          const { data: links } = await query.graph({
            entity: "product_variant_inventory_item",
            fields: ["inventory_item_id", "variant_id"],
            filters: {
              variant_id: variant.id,
            },
          });

          if (links && links[0]) {
            const { data: inventoryLevels } = await query.graph({
              entity: "inventory_level",
              fields: ["stocked_quantity", "reserved_quantity", "available_quantity"],
              filters: {
                inventory_item_id: links[0].inventory_item_id,
              },
            });

            if (inventoryLevels && inventoryLevels[0]) {
              logger.info(`   ${variant.title}:`);
              logger.info(`     - Stocked: ${inventoryLevels[0].stocked_quantity}`);
              logger.info(`     - Available: ${inventoryLevels[0].available_quantity}`);
            }
          }
        } catch (error) {
          logger.warn(`   Could not fetch inventory for ${variant.title}`);
        }
      }
    }

    // 4. Admin user info
    const adminUrl = process.env.ADMIN_URL || "http://localhost:9000/admin";
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@medusa-test.com";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "supersecret";
    
    logger.info("\n4️⃣ Admin access information:");
    logger.info(`   URL: ${adminUrl}`);
    logger.info(`   Email: ${adminEmail}`);
    logger.info(`   Password: ${adminPassword}`);

    // 5. Frontend URLs
    const frontendUrl = process.env.STOREFRONT_URL || "http://localhost:8001";
    
    logger.info("\n5️⃣ Frontend URLs:");
    logger.info(`   Homepage: ${frontendUrl}`);
    logger.info(`   Store: ${frontendUrl}/store`);
    logger.info(`   Cart: ${frontendUrl}/cart`);
    logger.info(`   Account: ${frontendUrl}/account`);

    logger.info("\n✅ Setup test completed!");
    logger.info("🚀 Your e-commerce site is ready to go!");
    logger.info("\n⚠️  Next steps:");
    logger.info("   1. Update product images in admin panel");
    logger.info("   2. Configure payment provider (Stripe)");
    logger.info("   3. Set up shipping rates");
    logger.info("   4. Test the checkout process");

  } catch (error) {
    logger.error(`❌ Error during setup test: ${error.message}`);
  }
}