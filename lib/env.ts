import { z } from "zod";

// Configuration constants
export const CROSSMINT_API_URL = 'https://staging.crossmint.com/api/2025-06-09';

const envSchema = z.object({
  NEXT_PUBLIC_CROSSMINT_API_KEY: z.string().min(1, "Crossmint API key is required"),
  CROSSMINT_SERVER_API_KEY: z.string().min(1, "Server Crossmint API key is required").optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Environment = z.infer<typeof envSchema>;

function validateEnv(): Environment {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_CROSSMINT_API_KEY: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY,
      CROSSMINT_SERVER_API_KEY: process.env.CROSSMINT_SERVER_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    throw new Error("Invalid environment configuration");
  }
}

export const env = validateEnv();