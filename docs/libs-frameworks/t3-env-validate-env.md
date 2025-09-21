Short answer: use **@t3-oss/env-core** with `clientPrefix: 'VITE_'` (it’s the framework-agnostic successor to “t3-env”) — it works great in Vite/TanStack Start. Optionally add **@julr/vite-plugin-validate-env** for fail-fast build-time checks. ([env.t3.gg][1])

---

### Recommended setup (TanStack Start + Vite)

**1) Install**

```bash
pnpm add @t3-oss/env-core zod
# (optional, build-time validation)
pnpm add -D @julr/vite-plugin-validate-env
```

**2) Split server/client env to avoid leaking names**

`src/env/server.ts`

```ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envServer = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string().url(),
    OPENAI_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
```

`src/env/client.ts`

```ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envClient = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_PUBLIC_API_URL: z.string().url(),
    VITE_ANALYTICS_ID: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
```

Now use `envServer` only in server code (e.g. server functions) and `envClient` in client code. TanStack Start server functions can read sensitive vars safely server-side; client vars must be `VITE_`-prefixed per Vite. ([tanstack.com][2])

**3) (Optional) Fail the build if env is wrong**

`vite.config.ts`

```ts
import { defineConfig } from "vite";
import { z } from "zod";
import { ValidateEnv } from "@julr/vite-plugin-validate-env";

export default defineConfig({
  plugins: [
    ValidateEnv({
      validator: "standard",
      schema: {
        VITE_PUBLIC_API_URL: z.string().url(),
        VITE_ANALYTICS_ID: z.string().optional(),
      },
    }),
  ],
});
```

This validates `import.meta.env` at dev/build time with zero runtime overhead. You can also augment `ImportMetaEnv` types via the plugin, if you like. ([GitHub][3])

---

### Why this is the best “t3-env equivalent”

* **Same DX**: Zod-based schema, typed access, runtime validation, and a recommended `emptyStringAsUndefined` flag to handle empty `.env` values properly. ([env.t3.gg][1])
* **Vite-correct**: Uses Vite’s `VITE_` client prefix and `import.meta.env` for client vars; secrets stay on the server. ([env.t3.gg][1])
* **Optional hardening**: Add the Vite plugin for **build-time** fail-fast validation and `import.meta.env` typing. ([GitHub][3])

If you want, I can adapt those snippets to your exact variables.

[1]: https://env.t3.gg/docs/core "Core ⋅ T3 Env"
[2]: https://tanstack.com/start/latest/docs/framework/react/server-functions?utm_source=chatgpt.com "Server Functions | TanStack Start React Docs"
[3]: https://github.com/Julien-R44/vite-plugin-validate-env "GitHub - Julien-R44/vite-plugin-validate-env: ✅ Vite plugin for validating your environment variables"
