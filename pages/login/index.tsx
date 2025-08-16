// pages/login/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // gestionăm manual în /auth/callback
    },
  }
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // dacă e deja logat, plecăm de aici
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/");
      }
    };
    check();
  }, [router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    setLoadingEmail(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setMessage("Ți-am trimis un link de autentificare pe email. Verifică inbox-ul.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Nu am putut trimite linkul de autentificare.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogle = async () => {
    setMessage(null);
    setErrorMsg(null);
    setLoadingGoogle(true);
    try {
      localStorage.setItem("postAuthRedirect", "/");
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      // redirectul continuă în /auth/callback
    } catch (err: any) {
      setErrorMsg(err?.message || "Nu am putut porni autentificarea cu Google.");
      setLoadingGoogle(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          padding: "1rem 2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <a href="/" style={{ fontWeight: 700, fontSize: 18, color: "white" }}>
          Swaply
        </a>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a href="/objects" style={{ color: "#93c5fd" }}>Objects</a>
          <a href="/add" style={{ color: "#93c5fd" }}>Add</a>
          <a href="/my-objects" style={{ color: "#93c5fd" }}>My Objects</a>
          <a href="/users" style={{ color: "#93c5fd" }}>Users</a>
          <a href="/matches" style={{ color: "#93c5fd" }}>Matches</a>
          <a href="/login" style={{ color: "#bfdbfe", marginLeft: "auto" }}>Login</a>
        </div>
      </nav>

      <section style={{ flex: 1, display: "grid", placeItems: "center", padding: "2rem" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "rgba(2,6,23,0.6)",
            border: "1px solid #1f2937",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
          }}
        >
          <h1 style={{ fontSize: 36, margin: "0 0 12px" }}>Intră în cont</h1>
          <p style={{ color: "#94a3b8", marginTop: 0, marginBottom: 24 }}>
            Alege metoda preferată de autentificare.
          </p>

          <form onSubmit={handleMagicLink} style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 8, color: "#cbd5e1" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="email@exemplu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #334155",
                background: "#0b1220",
                color: "white",
                outline: "none",
                marginBottom: 12,
              }}
            />
            <button
              type="submit"
              disabled={loadingEmail}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
                opacity: loadingEmail ? 0.7 : 1,
              }}
            >
              {loadingEmail ? "Se trimite..." : "Primește link de login"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ height: 1, background: "#1f2937", flex: 1 }} />
            <span style={{ color: "#64748b", fontSize: 12 }}>sau</span>
            <div style={{ height: 1, background: "#1f2937", flex: 1 }} />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: loadingGoogle ? 0.7 : 1,
            }}
            aria-label="Continue with Google"
            title="Continue with Google"
          >
            <span aria-hidden style={{ width: 18, height: 18, display: "inline-block", background: "white", borderRadius: 3 }} />
            {loadingGoogle ? "Se deschide Google..." : "Continue with Google"}
          </button>

          {message && <p style={{ color: "#86efac", marginTop: 14 }}>{message}</p>}
          {errorMsg && <p style={{ color: "#fca5a5", marginTop: 14 }}>{errorMsg}</p>}
        </div>
      </section>
    </main>
  );
}
