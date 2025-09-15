// components/LogoutButton.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function LogoutButton() {
  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <form action={logout}>
      <button type="submit">Logout</button>
    </form>
  );
}
