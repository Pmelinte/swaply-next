// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL trebuie să fie un URL valid",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY lipsește sau e prea scurt",
  }),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VERCEL: z.string().optional(),
}).passthrough();

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): { ok: true; data: Env } | { ok: false; errors: string[] } {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  const errors = parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
  return { ok: false, errors };
}
