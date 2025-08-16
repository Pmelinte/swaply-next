// pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

// Client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      detectSessionInUrl: false, // gestionăm manual
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Se finalizează autentificarea...");

  useEffect(() => {
    if (!router.isReady) return;

    const run = async () => {
      try {
        // 1. Extragem codul din URL
        const codeFromQuery =
          typeof router.query.code === "string" ? router.query.code : null;

        let code = codeFromQuery;

        // fallback din hash (#code=...) dacă vine așa
        if (!code && typeof window !== "undefined") {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const codeFromHash = hash.get("code");
          if (codeFromHash) code = codeFromHash;
        }

        if (!code) {
          setStatus("error");
          setMessage("Codul de autentificare lipsește din URL.");
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }

        // 2. Facem schimbul cod -> sesiune
        const { error } = await supabase.auth.exchangeCodeForSession({ code });

        if (error) {
          setStatus("error");
          setMessage(`Eroare la autentificare: ${error.message}`);
          setTimeout(() => router.replace("/login"), 1800);
          return;
        }

        // 3. Redirecționăm după login
        let redirectTo = "/";
        try {
          const stored = localStorage.getItem("postAuthRedirect");
          if (stored) {
            redirectTo = stored;
            localStorage.removeItem("postAuthRedirect");
          }
        } catch (_) {
          // localStorage indisponibil
        }

        setStatus("success");
        setMessage("Autentificare reușită. Redirecționăm...");
        router.replace(redirectTo);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          `Eroare neașteptată: ${err?.message || "necunoscută"}`
        );
        setTimeout(() => router.replace("/login"), 1800);
      }
    };

    run();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "1.5rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        {status === "loading" && <p>Se finalizează autentificarea...</p>}
        {status === "success" && <p style={{ color: "green" }}>{message}</p>}
        {status === "error" && <p style={{ color: "red" }}>{message}</p>}
      </div>
    </main>
  );
}
