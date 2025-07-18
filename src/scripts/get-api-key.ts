import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function getApiKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const apiKeyModuleService = container.resolve(Modules.API_KEY);

  logger.info("Getting publishable API key...");

  const apiKeys = await apiKeyModuleService.listApiKeys({
    type: "publishable",
  });

  if (apiKeys.length > 0) {
    const key = apiKeys[0];
    logger.info(`\n========================================`);
    logger.info(`Publishable API Key: ${key.token}`);
    logger.info(`Title: ${key.title}`);
    logger.info(`========================================\n`);
  } else {
    logger.warn("No publishable API key found. Please create one in the admin panel.");
  }
}