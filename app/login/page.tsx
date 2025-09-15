"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      if (error) {
        setErr(error.message);
      } else {
        setMsg("Autentificat! Te duc acasă…");
        setTimeout(() => {
          window.location.href = "/";
        }, 600);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Eroare necunoscută.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
        <h1 className="text-2xl font-bold">Autentificare</h1>

        {err && <div className="text-sm rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{err}</div>}
        {msg && <div className="text-sm rounded-md border border-green-200 bg-green-50 p-3 text-green-700">{msg}</div>}

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Parolă</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-xl border px-4 py-2 font-medium disabled:opacity-60">
          {loading ? "Se conectează…" : "Intră"}
        </button>

        <p className="text-xs text-gray-500">
          Nu ai cont? <a href="/signup" className="underline">Creează unul</a>.
        </p>
      </form>
    </main>
  );
}
