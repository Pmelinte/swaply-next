"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function MyObjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return <main className="p-6">Se încarcă…</main>;

  if (!user) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Obiectele mele</h1>
        <p className="mt-2">Trebuie să fii autentificat.</p>
        <a className="underline" href="/login">Mergi la login</a>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Obiectele mele</h1>
      <p className="mt-2 text-gray-600">Aici vor apărea obiectele tale. (placeholder)</p>
    </main>
  );
}
