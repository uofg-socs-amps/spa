import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    SERVER_URL: z.string(),
    // optional
    DEV_ENV: z.string().optional(),

    DEV_ID: z.string(),
    DEV_NAME: z.string(),
    DEV_EMAIL: z.string(),
  },
  runtimeEnv: process.env,
});
