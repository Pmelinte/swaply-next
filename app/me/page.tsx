"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function MePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) setErr(error.message);
      setUser(data?.user ?? null);
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold">Profil</h1>

      {loading && <p>Se încarcă…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && user && (
        <div className="mt-3 space-y-2">
          <div><span className="font-medium">Email:</span> {user.email}</div>
          <button onClick={logout} className="rounded-xl border px-4 py-2">Logout</button>
        </div>
      )}

      {!loading && !user && (
        <div className="mt-3">
          <p>Nu ești autentificat.</p>
          <a href="/login" className="underline">Mergi la login</a>
        </div>
      )}
    </main>
  );
}
