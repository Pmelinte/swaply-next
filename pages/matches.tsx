// pages/matches.tsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Nav from "../components/Nav";

type Match = {
  id: string;
  object_id: string | null;
  other_object_id: string | null;
  from_user_id: string | null;
  to_user_id: string | null;
  status: string | null;
  created_at: string | null;
};

type Obj = { id: string; title: string | null };

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

export default function MatchesPage() {
  const [rows, setRows] = useState<Match[]>([]);
  const [objects, setObjects] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      // 1) citim matches
      const { data: mData, error: mErr } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });

      if (mErr) {
        setMsg(mErr.message);
        setLoading(false);
        return;
      }

      const matches = (mData || []) as Match[];
      setRows(matches);

      // 2) aducem titlurile obiectelor pentru afisare frumoasa
      const ids = Array.from(
        new Set(
          matches
            .flatMap((r) => [r.object_id, r.other_object_id])
            .filter((x): x is string => !!x)
        )
      );

      if (ids.length > 0) {
        const { data: oData, error: oErr } = await supabase
          .from("objects")
          .select("id,title")
          .in("id", ids);

        if (!oErr && oData) {
          const map: Record<string, string> = {};
          (oData as Obj[]).forEach((o) => {
            map[o.id] = o.title || o.id;
          });
          setObjects(map);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  const fmt = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleString() : "—";

  const titleFor = (id: string | null) =>
    (id && objects[id]) || (id ?? "—");

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      <Nav />
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>Matches (brut)</h1>
        <p style={{ color: "#94a3b8", marginTop: -8 }}>
          Stocare flexibilă pentru potriviri / intenții.
        </p>

        {msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}
        {loading && <p>Se încarcă…</p>}

        {rows.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Nu există potriviri încă.</p>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #1f2937" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(2,6,23,0.6)" }}>
                  <th style={th}>#</th>
                  <th style={th}>Object</th>
                  <th style={th}>Other</th>
                  <th style={th}>From</th>
                  <th style={th}>To</th>
                  <th style={th}>Status</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #1f2937" }}>
                    <td style={td}>{i + 1}</td>
                    <td style={td}>{titleFor(r.object_id)}</td>
                    <td style={td}>{titleFor(r.other_object_id)}</td>
                    <td style={td}>{r.from_user_id || "—"}</td>
                    <td style={td}>{r.to_user_id || "—"}</td>
                    <td style={td}>{r.status || "—"}</td>
                    <td style={td}>{fmt(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  color: "#cbd5e1",
  fontWeight: 700,
  fontSize: 14,
  borderBottom: "1px solid #1f2937",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  color: "#e2e8f0",
  fontSize: 14,
};
