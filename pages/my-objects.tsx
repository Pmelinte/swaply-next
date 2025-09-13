// pages/my-objects.tsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ObjectCard from "@/components/ObjectCard";

type Obj = Record<string, any>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyObjectsPage() {
  const [items, setItems] = useState<Obj[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        // Luăm toate, ordonate descrescător
        const { data, error } = await supabase
          .from("objects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        if (alive) setItems((data || []) as Obj[]);
      } catch (e: any) {
        if (alive) setErr(String(e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const containerStyle: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "24px 16px" };
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Obiectele mele</h1>
      <p style={{ fontSize: 12, color: "#8b8f99", marginBottom: 12 }}>count = {items.length}</p>

      {loading && <p>Se încarcă…</p>}
      {err && <pre style={{ color: "#ef4444", whiteSpace: "pre-wrap" }}>{err}</pre>}

      <div style={gridStyle}>
        {items.map((obj) => (
          <ObjectCard key={obj.id ?? JSON.stringify(obj)} obj={obj} />
        ))}
      </div>
    </div>
  );
}
