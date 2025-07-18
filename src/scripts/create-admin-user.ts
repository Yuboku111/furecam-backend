import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createUsersWorkflow } from "@medusajs/medusa/core-flows";

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModuleService = container.resolve(Modules.USER);

  // Get configuration from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@furecamera.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "supersecret123";
  const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const adminLastName = process.env.ADMIN_LAST_NAME || "User";

  // Validate required environment variables
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    logger.warn("Warning: Using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for production use.");
  }

  logger.info("Creating admin user...");

  try {
    // Check if user already exists
    const existingUsers = await userModuleService.listUsers({
      email: adminEmail,
    });

    if (existingUsers.length > 0) {
      logger.info("Admin user already exists!");
      return;
    }

    // Create admin user
    const { result } = await createUsersWorkflow(container).run({
      input: {
        users: [
          {
            email: adminEmail,
            password: adminPassword,
            first_name: adminFirstName,
            last_name: adminLastName,
          },
        ],
      },
    });

    logger.info("✅ Admin user created successfully!");
    logger.info("========================================");
    logger.info(`Email: ${adminEmail}`);
    logger.info(`Password: ${adminPassword}`);
    logger.info("========================================");
  } catch (error) {
    logger.error(`Failed to create admin user: ${error.message}`);
  }
}