// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { validateEnv } from "../env";

export async function createClient() {
  const env = validateEnv();
  if (!env.ok) {
    throw new Error("Supabase env invalid: " + env.errors.join(", "));
  }

  // În Next 15 tipul poate fi Promise<ReadonlyRequestCookies> -> așteptăm explicit
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // În unele contexte strict-SSR, set/remove pot arunca — ignorăm
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // idem
          }
        },
      },
    }
  );

  return supabase;
}
