// components/Nav.tsx
import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav
      style={{
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 18, color: "white" }}>
          Swaply
        </a>
        <a href="/objects" style={{ color: "#93c5fd" }}>Objects</a>
        <a href="/add" style={{ color: "#93c5fd" }}>Add</a>
        <a href="/my-objects" style={{ color: "#93c5fd" }}>My Objects</a>
        <a href="/users" style={{ color: "#93c5fd" }}>Users</a>
        <a href="/matches" style={{ color: "#93c5fd" }}>Matches</a>
      </div>

      {user ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#cbd5e1" }}>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <a
          href="/login"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Login
        </a>
      )}
    </nav>
  );
}
