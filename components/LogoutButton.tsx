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

  // ținem butonul pe aceeași linie cu link-urile din nav
  return (
    <form action={logout} style={{ display: "inline" }}>
      <button
        type="submit"
        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}
      >
        Logout
      </button>
    </form>
  );
}
