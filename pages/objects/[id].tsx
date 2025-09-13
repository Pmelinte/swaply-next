// pages/objects/[id].tsx
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import RawSafeImage from "@/components/RawSafeImage";

type Obj = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string | null;
  // opțional: poți adăuga images: string[] dacă ai o coloană separată
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// aceeași validare ca în RawSafeImage, dar expusă aici pentru a filtra sursele
function isProbablyValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    const tld = (u.hostname.split(".").pop() || "").toLowerCase();
    if (/(invalid|example|test|localhost)$/i.test(tld)) return false;
    return true;
  } catch {
    return false;
  }
}

export default function ObjectDetailsPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [item, setItem] = useState<Obj | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("objects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (alive) setItem((data || null) as Obj | null);
      } catch (e: any) {
        if (alive) setErr(String(e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // compunem lista de surse posibile; momentan doar image_url
  const srcList = useMemo(() => {
    const list: string[] = [];
    if (item?.image_url && typeof item.image_url === "string") {
      list.push(item.image_url.trim());
    }
    // dacă pe viitor adaugi multiple imagini, fă push aici
    return list.filter(isProbablyValidImageUrl);
  }, [item]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/objects" className="text-sm text-blue-600 hover:underline">
        ← Înapoi la listă
      </Link>

      <div className="mt-4">
        {/* WRAPPER de imagine: aspect 16/9, fără tăierea fallback-ului */}
        <div className="relative aspect-[16/9] w-full rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center">
          {/* 
            IMPORTANT:
            - Nu folosim position:absolute pe imagine (evită tăierea fallback-ului).
            - RawSafeImage știe singur să facă object-fit: contain pentru fallback
              și object-fit: cover pentru URL-urile valide.
          */}
          <RawSafeImage
            srcList={srcList}
            alt={item?.title || "Obiect"}
            className="block w-full h-full"
          />
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="text-2xl font-semibold">{item?.title || "Fără titlu"}</h1>
          <p className="text-zinc-400">
            Categorie: <span className="text-zinc-200">{item?.category || "—"}</span>
          </p>
          {!!item?.created_at && (
            <p className="text-zinc-400">
              Creat:{" "}
              <span className="text-zinc-200">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </p>
          )}
          {item?.description && (
            <p className="text-zinc-300 leading-relaxed">{item.description}</p>
          )}
        </div>

        {loading && <p className="mt-6 text-zinc-400">Se încarcă…</p>}
        {err && (
          <pre className="mt-4 text-red-500 whitespace-pre-wrap">{err}</pre>
        )}
      </div>
    </div>
  );
}
