# Custom CLI Script

A custom CLI script is a function to execute through Medusa's CLI tool. This is useful when creating custom Medusa tooling to run as a CLI tool.

> Learn more about custom CLI scripts in [this documentation](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts).

## How to Create a Custom CLI Script?

To create a custom CLI script, create a TypeScript or JavaScript file under the `src/scripts` directory. The file must default export a function.

For example, create the file `src/scripts/my-script.ts` with the following content:

```ts title="src/scripts/my-script.ts"
import { 
  ExecArgs,
} from "@medusajs/framework/types"

export default async function myScript ({
  container
}: ExecArgs) {
  const productModuleService = container.resolve("product")

  const [, count] = await productModuleService.listAndCountProducts()

  console.log(`You have ${count} product(s)`)
}
```

The function receives as a parameter an object having a `container` property, which is an instance of the Medusa Container. Use it to resolve resources in your Medusa application.

---

## How to Run Custom CLI Script?

To run the custom CLI script, run the `exec` command:

```bash
npx medusa exec ./src/scripts/my-script.ts
```

---

## Custom CLI Script Arguments

Your script can accept arguments from the command line. Arguments are passed to the function's object parameter in the `args` property.

For example:

```ts
import { ExecArgs } from "@medusajs/framework/types"

export default async function myScript ({
  args
}: ExecArgs) {
  console.log(`The arguments you passed: ${args}`)
}
```

Then, pass the arguments in the `exec` command after the file path:

```bash
npx medusa exec ./src/scripts/my-script.ts arg1 arg2
```

---

## Environment Variables for Admin Scripts

The following scripts use environment variables to avoid hardcoding sensitive values:

### Admin User Management Scripts

These scripts help manage admin users in the system:

- `create-admin.ts` - Creates a new admin user
- `reset-admin-password.ts` - Resets an existing admin user's password
- `create-default-admin.ts` - Creates default admin users for development/testing
- `test-setup.ts` - Tests the setup and displays configuration URLs

### Required Environment Variables

Add these to your `.env` file:

```bash
# Admin User Configuration
ADMIN_EMAIL=admin@furecamera.com
ADMIN_PASSWORD=your-secure-password-here

# Default Admin Configuration (for create-default-admin.ts)
DEFAULT_ADMIN_EMAIL=admin@medusa-test.com
DEFAULT_ADMIN_PASSWORD=your-secure-password-here
FALLBACK_ADMIN_EMAIL=admin@furecamera.com

# Service URLs
AUTH_URL=http://localhost:9000
ADMIN_URL=http://localhost:7001
STOREFRONT_URL=http://localhost:8000
```

### Usage Examples

```bash
# Create an admin user with environment variables
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=mypassword npx medusa exec ./src/scripts/create-admin.ts

# Reset admin password
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=newpassword npx medusa exec ./src/scripts/reset-admin-password.ts

# Create default admin users
npx medusa exec ./src/scripts/create-default-admin.ts

# Run setup test
npx medusa exec ./src/scripts/test-setup.ts
```

**Note**: If environment variables are not set, the scripts will use default values and display a warning message.