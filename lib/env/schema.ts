import { z } from "zod";

export const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL trebuie să fie URL valid"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL trebuie să fie URL valid"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Lipsește NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, "Lipsește NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1, "Lipsește NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"),
});

export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
