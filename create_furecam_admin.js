const dotenv = require("dotenv");
const { Medusa } = require("@medusajs/framework");

dotenv.config();

async function seed() {
  console.log("Creating FureCam admin user...");
  
  const { userService } = await Medusa({
    baseDir: process.cwd(),
    onApplicationStartup: async () => {
      const userModuleService = userService;
      
      try {
        // Check if user exists
        const [existingUser] = await userModuleService.listUsers({
          email: "furecam@admin.com",
        });
        
        if (existingUser) {
          console.log("Admin user already exists\!");
          return;
        }
        
        // Create new admin user
        await userModuleService.createUsers({
          email: "furecam@admin.com",
          first_name: "FureCam",
          last_name: "Admin",
        });
        
        console.log("Admin user created successfully\!");
        console.log("Email: furecam@admin.com");
        console.log("Please set password in admin panel");
        
      } catch (error) {
        console.error("Error creating admin user:", error);
      }
      
      process.exit();
    },
  });
}

seed();
