"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return <button className="btn" onClick={signOut}>Logout</button>;
}
