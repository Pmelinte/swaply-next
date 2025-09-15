// app/login/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect("/login?error=" + encodeURIComponent(error.message));
    }
    redirect("/");
  }

  return (
    <form action={login} className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Autentificare</h1>

      <label className="block">
        <span className="block">Email</span>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          className="border px-2 py-1 block"
          required
        />
      </label>

      <label className="block">
        <span className="block">Parolă</span>
        <input
          name="password"
          type="password"
          className="border px-2 py-1 block"
          required
        />
      </label>

      <button type="submit" className="border px-3 py-1">Intră</button>
    </form>
  );
}
