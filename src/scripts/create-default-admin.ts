import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function createDefaultAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  // Get configuration from environment variables
  const primaryEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@medusa-test.com";
  const fallbackEmail = process.env.FALLBACK_ADMIN_EMAIL || "admin@furecamera.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "supersecret";
  const authUrl = process.env.AUTH_URL || "http://localhost:9000";
  
  // Validate environment variables
  if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD) {
    logger.warn("Warning: Using default admin credentials. Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD environment variables for production use.");
  }
  
  try {
    // Create default admin user using the auth endpoint
    const response = await fetch(`${authUrl}/auth/user/emailpass/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: primaryEmail,
        password: adminPassword,
      }),
    });

    if (response.ok) {
      logger.info("✅ Default admin user created successfully!");
      logger.info("========================================");
      logger.info(`Email: ${primaryEmail}`);
      logger.info(`Password: ${adminPassword}`);
      logger.info("========================================");
    } else {
      const text = await response.text();
      if (text.includes("already exists")) {
        logger.info("Admin user already exists. Trying alternative email...");
        
        // Try with fallback email
        const response2 = await fetch(`${authUrl}/auth/user/emailpass/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: fallbackEmail,
            password: adminPassword,
          }),
        });
        
        if (response2.ok) {
          logger.info("✅ Alternative admin user created!");
          logger.info("========================================");
          logger.info(`Email: ${fallbackEmail}`);
          logger.info(`Password: ${adminPassword}`);
          logger.info("========================================");
        } else {
          logger.info("Both email addresses already registered.");
          logger.info("Try logging in with:");
          logger.info(`- ${primaryEmail} / ${adminPassword}`);
          logger.info(`- ${fallbackEmail} / ${adminPassword}`);
        }
      } else {
        logger.error(`Failed to create admin user: ${text}`);
      }
    }
  } catch (error) {
    logger.error(`Error creating admin user: ${error.message}`);
  }
}