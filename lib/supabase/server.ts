import { createClient } from "@supabase/supabase-js";

/**
 * Client server-side folosit DOAR pentru citiri publice (RLS trebuie să permită read).
 * Nu atașăm sesiunea aici — pentru asta am configurație separat pe callback.
 */
export function getSupabaseServerAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
