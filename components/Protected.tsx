// components/Protected.tsx
import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function Protected({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const next = encodeURIComponent(router.asPath || "/");
        router.replace(`/login?next=${next}`);
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    run();
  }, [router]);

  if (loading) {
    return (
      <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "white" }}>
        <p>Verificăm sesiunea...</p>
      </main>
    );
  }

  return <>{children}</>;
}
