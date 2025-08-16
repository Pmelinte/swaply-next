// pages/me.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function MePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setLoading(false);
    };
    run();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: 640, width: "100%", padding: 24, border: "1px solid #1f2937", borderRadius: 16 }}>
        <h1 style={{ marginTop: 0 }}>Profil</h1>
        {loading ? (
          <p>Se încarcă…</p>
        ) : user ? (
          <>
            <p><b>Email:</b> {user.email}</p>
            <p><b>ID:</b> {user.id}</p>
            <p><b>Provider:</b> {user.identities?.map((i:any)=>i.provider).join(", ") || "n/a"}</p>
            <button onClick={logout} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "white", cursor: "pointer" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <p>Nu ești autentificat.</p>
            <a href="/login" style={{ color: "#93c5fd" }}>Mergi la login</a>
          </>
        )}
      </div>
    </main>
  );
}
