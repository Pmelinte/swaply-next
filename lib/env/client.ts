"use client";

import { publicSchema } from "./schema";

// În client, Next înlocuiește la build variabilele NEXT_PUBLIC_*.
// Validăm la runtime ca să prindem lipsurile în dev/preview.
const raw = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

const parsed = publicSchema.safeParse(raw);
if (!parsed.success) {
  console.error("❌ ENV public invalid (client):", parsed.error.flatten().fieldErrors);
  throw new Error("ENV public invalid (client). Verifică NEXT_PUBLIC_*");
}

export const envClient = parsed.data;
