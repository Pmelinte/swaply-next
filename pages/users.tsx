// pages/users.tsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "../components/Nav";

type DbUser = {
  id: string;
  email: string | null;
  display_name?: string | null;
  name?: string | null;
  created_at?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

export default function UsersPage() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);
      const { data, error } = await supabase
        .from("users") // <- tabela public.users (nu auth.users)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setMsg(error.message);
      else setUsers((data || []) as DbUser[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      <Nav />
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>Users</h1>
        {msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}
        {loading && <p>Se încarcă…</p>}

        <div style={{ marginTop: 16 }}>
          {users.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>Nu există înregistrări în acest moment.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {users.map((u) => (
                <li key={u.id} style={{ padding: "10px 0", borderBottom: "1px solid #1f2937" }}>
                  <div style={{ fontWeight: 700 }}>
                    {u.display_name || u.name || "—"}
                  </div>
                  <div style={{ color: "#cbd5e1" }}>{u.email || "—"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
