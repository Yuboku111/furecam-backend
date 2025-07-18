import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import bcrypt from "bcryptjs";

export default async function resetAdminPassword({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModuleService = container.resolve(Modules.USER);

  // Get configuration from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@furecamera.com";
  const newPassword = process.env.ADMIN_PASSWORD || "supersecret123";

  // Validate required environment variables
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    logger.warn("Warning: Using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for production use.");
  }

  logger.info("Resetting admin password...");

  try {
    // Find admin user
    const users = await userModuleService.listUsers({
      email: adminEmail,
    });

    if (users.length === 0) {
      logger.error(`Admin user not found with email: ${adminEmail}`);
      return;
    }

    const adminUser = users[0];
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await userModuleService.updateUsers({
      id: adminUser.id,
      password_hash: hashedPassword,
    });

    logger.info("✅ Password reset successfully!");
    logger.info("========================================");
    logger.info(`Email: ${adminEmail}`);
    logger.info(`New Password: ${newPassword}`);
    logger.info("========================================");
  } catch (error) {
    logger.error(`Failed to reset password: ${error.message}`);
  }
}