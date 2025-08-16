// pages/my-objects.tsx
import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import Nav from "../components/Nav";

type Obj = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  user_id: string;
  created_at?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function MyObjectsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Obj[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      setUser(u.user ?? null);
      if (!u.user) {
        setMsg("Nu ești autentificat.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("objects")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      if (error) setMsg(error.message);
      else setItems((data || []) as Obj[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Ștergi acest obiect?")) return;
    const { error } = await supabase.from("objects").delete().eq("id", id);
    if (error) return alert(error.message);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      <Nav />
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>Obiectele mele</h1>
        {msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}
        {loading && <p>Se încarcă…</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: 16,
          }}
        >
          {items.map((o) => (
            <div
              key={o.id}
              style={{
                border: "1px solid #1f2937",
                borderRadius: 16,
                background: "rgba(2,6,23,0.6)",
                overflow: "hidden",
              }}
            >
              <a href={`/objects/${o.id}`} style={{ textDecoration: "none", color: "white" }}>
                {o.image_url && (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
                  />
                )}
                <div style={{ padding: 12 }}>
                  <h3 style={{ margin: "4px 0 8px 0" }}>{o.title}</h3>
                  {o.category && (
                    <p style={{ margin: 0, color: "#94a3b8" }}>Categorie: {o.category}</p>
                  )}
                  {o.description && (
                    <p style={{ marginTop: 8, color: "#cbd5e1" }}>
                      {o.description.length > 140
                        ? o.description.slice(0, 140) + "…"
                        : o.description}
                    </p>
                  )}
                </div>
              </a>

              <div style={{ padding: 12 }}>
                <button
                  onClick={() => handleDelete(o.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #7f1d1d",
                    background: "#1f2937",
                    color: "#fecaca",
                    cursor: "pointer",
                  }}
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
