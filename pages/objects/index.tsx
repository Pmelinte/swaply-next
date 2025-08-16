// pages/objects/index.tsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Obj = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  created_at?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function ObjectsIndex() {
  const [items, setItems] = useState<Obj[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase
        .from("objects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) setMsg(error.message);
      else setItems((data as Obj[]) || []);
      setLoading(false);
    };
    run();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      <nav style={{ padding: "1rem 2rem", display: "flex", gap: 16, alignItems: "center" }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 18, color: "white" }}>Swaply</a>
        <a href="/add" style={{ color: "#93c5fd" }}>Add</a>
        <a href="/my-objects" style={{ color: "#93c5fd" }}>My Objects</a>
      </nav>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "1rem 2rem" }}>
        <h1 style={{ marginTop: 0 }}>Toate obiectele</h1>
        {loading && <p>Se încarcă…</p>}
        {msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}
        {!loading && !items.length && <p>Încă nu există obiecte.</p>}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16
        }}>
          {items.map((o) => (
            <article key={o.id} style={{
              border: "1px solid #1f2937",
              borderRadius: 16,
              padding: 12,
              background: "rgba(2,6,23,0.6)"
            }}>
              <a href={`/objects/${o.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                {o.image_url && (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 8 }}
                  />
                )}
                <h3 style={{ margin: "6px 0" }}>{o.title}</h3>
                {o.category && <p style={{ color: "#94a3b8", margin: "4px 0" }}>Categorie: {o.category}</p>}
                {o.description && <p style={{ color: "#cbd5e1" }}>{o.description}</p>}
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
