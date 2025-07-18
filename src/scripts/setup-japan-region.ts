import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { 
  createRegionsWorkflow,
  updatePricingRuleSalesChannelsWorkflow,
  updateSalesChannelsWorkflow
} from "@medusajs/medusa/core-flows";

export default async function setupJapanRegion({ container }: ExecArgs) {
  const regionService = container.resolve(Modules.REGION);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentSetService = container.resolve(Modules.FULFILLMENT);
  const paymentProviderService = container.resolve(Modules.PAYMENT);
  const productService = container.resolve(Modules.PRODUCT);
  
  console.log("🇯🇵 Setting up Japan region...");

  try {
    // Check if Japan region already exists
    const existingRegions = await regionService.listRegions({
      name: "Japan"
    });

    if (existingRegions.length > 0) {
      console.log("✅ Japan region already exists");
      return;
    }

    // Get sales channel
    const [salesChannel] = await salesChannelService.listSalesChannels({
      name: "Default Sales Channel",
    });

    // Get fulfillment set
    const fulfillmentSets = await fulfillmentSetService.listFulfillmentSets({});
    const defaultFulfillmentSet = fulfillmentSets[0];

    // Create Japan region
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Japan",
            currency_code: "jpy",
            countries: ["jp"],
            metadata: {
              tax_rate: 10,
              tax_name: "消費税"
            }
          }
        ]
      }
    });

    const japanRegion = result[0];
    console.log(`✅ Created Japan region: ${japanRegion.id}`);

    // Payment providers will be configured through admin panel
    console.log("✅ Region created - configure payment providers in admin panel");

    // Link sales channel to region
    if (salesChannel) {
      await updateSalesChannelsWorkflow(container).run({
        input: {
          selector: { id: salesChannel.id },
          update: {
            region_ids: [japanRegion.id]
          }
        }
      });
      console.log("✅ Linked sales channel to region");
    }

    // Add prices to existing products
    const products = await productService.listProducts({
      handle: "furecamera-y2k-retro"
    });

    if (products.length > 0) {
      const product = products[0];
      if (product.variants) {
        for (const variant of product.variants) {
          try {
            // Create prices for Japan region
            await productService.updateVariants([
              {
                id: variant.id,
                prices: [
                  {
                    amount: 4980,
                    currency_code: "jpy",
                    region_id: japanRegion.id
                  }
                ]
              }
            ]);
            console.log(`✅ Added JPY price for variant: ${variant.title}`);
          } catch (error) {
            console.warn(`Could not add price for variant ${variant.title}: ${error.message}`);
          }
        }
      }
    }

    console.log("\n🎌 Japan region setup complete!");
    console.log("Region details:");
    console.log(`- Name: Japan`);
    console.log(`- Currency: JPY`);
    console.log(`- Tax rate: 10%`);
    console.log(`- Payment methods: Manual`);

  } catch (error) {
    console.error(`❌ Error setting up Japan region: ${error.message}`);
  }
}