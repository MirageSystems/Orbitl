import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CROSSMINT_API_KEY: z.string().min(1, "Crossmint API key is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Environment = z.infer<typeof envSchema>;

function validateEnv(): Environment {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_CROSSMINT_API_KEY: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    throw new Error("Invalid environment configuration");
  }
}

export const env = validateEnv();