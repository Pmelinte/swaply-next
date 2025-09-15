"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function getSupabaseBrowser() {
  // folosește automat NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createClientComponentClient();
}
