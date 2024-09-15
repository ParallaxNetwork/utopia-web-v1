import {createEnv} from "@t3-oss/env-nextjs";
import {z} from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL"
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string(),
    SMTP_TLS: z.string(),
    SMTP_USERNAME: z.string(),
    SMTP_PASSWORD: z.string(),
    DIGITAL_OCEAN_SPACES_BUCKET: z.string(),
    DIGITAL_OCEAN_SPACES_ORIGIN: z.string(),
    DIGITAL_OCEAN_SPACES_REGION: z.string(),
    DIGITAL_OCEAN_SPACES_ACCESS_KEY: z.string(),
    DIGITAL_OCEAN_SPACES_SECRET_KEY: z.string(),
    DIGITAL_OCEAN_SPACES_CDN: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_TLS: process.env.SMTP_TLS,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    DIGITAL_OCEAN_SPACES_BUCKET: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
    DIGITAL_OCEAN_SPACES_ORIGIN: process.env.DIGITAL_OCEAN_SPACES_ORIGIN,
    DIGITAL_OCEAN_SPACES_REGION: process.env.DIGITAL_OCEAN_SPACES_REGION,
    DIGITAL_OCEAN_SPACES_ACCESS_KEY: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    DIGITAL_OCEAN_SPACES_SECRET_KEY: process.env.DIGITAL_OCEAN_SPACES_SECRET_KEY,
    DIGITAL_OCEAN_SPACES_CDN: process.env.DIGITAL_OCEAN_SPACES_CDN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
