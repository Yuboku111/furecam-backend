import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function createAdmin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  // Get configuration from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@furecamera.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "supersecret123";
  const authUrl = process.env.AUTH_URL || "http://localhost:9000";
  
  // Validate required environment variables
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    logger.warn("Warning: Using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for production use.");
  }
  
  try {
    const { MedusaRequest } = await import("@medusajs/framework/http");
    
    // Create a mock request object
    const mockRequest = {
      body: {
        email: adminEmail,
        password: adminPassword,
      },
    };

    const response = await fetch(`${authUrl}/auth/user/emailpass/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    if (response.ok) {
      logger.info("Admin user created successfully!");
      logger.info(`Email: ${adminEmail}`);
      logger.info(`Password: ${adminPassword}`);
    } else {
      const error = await response.text();
      logger.error(`Failed to create admin user: ${error}`);
    }
  } catch (error) {
    logger.error(`Error creating admin user: ${error.message}`);
  }
}