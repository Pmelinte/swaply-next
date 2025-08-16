// pages/objects/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import Nav from "../../components/Nav";

type Obj = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  user_id: string;           // proprietarul obiectului (UUID din auth.users)
  created_at?: string;
};

type MyObjLite = { id: number; title: string | null };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function ObjectDetails() {
  const router = useRouter();
  const id = useMemo(() => Number(router.query.id as string), [router.query.id]);

  const [item, setItem] = useState<Obj | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // edit fields (păstrăm editarea ca înainte)
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // propose swap
  const [myObjects, setMyObjects] = useState<MyObjLite[]>([]);
  const [selectedMyId, setSelectedMyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    const run = async () => {
      setMsg(null);
      setLoading(true);

      const [{ data: auth }, { data, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("objects").select("*").eq("id", id).maybeSingle(),
      ]);

      if (auth.user) setMe(auth.user.id);

      if (error) setMsg(error.message);
      else if (!data) setMsg("Obiectul nu a fost găsit sau nu ai permisiune să-l vezi.");
      else {
        const o = data as Obj;
        setItem(o);
        setTitle(o.title || "");
        setCategory(o.category || "");
        setDescription(o.description || "");
      }
      setLoading(false);
    };
    run();
  }, [id]);

  // după ce știm „me”, încărcăm obiectele mele pentru dropdown
  useEffect(() => {
    if (!me) return;
    const loadMine = async () => {
      const { data, error } = await supabase
        .from("objects")
        .select("id,title")
        .eq("user_id", me)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const arr = data as MyObjLite[];
        setMyObjects(arr);
        if (arr.length) setSelectedMyId(arr[0].id);
      }
    };
    loadMine();
  }, [me]);

  const iOwnIt = !!(item && me && item.user_id === me);

  const uploadToCloudinary = async (f: File) => {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
    const form = new FormData();
    form.append("file", f);
    form.append("upload_preset", preset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload eșuat către Cloudinary.");
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setMsg(null);
    try {
      let image_url = item.image_url;
      if (file) image_url = await uploadToCloudinary(file);

      const { error } = await supabase
        .from("objects")
        .update({ title, category, description, image_url })
        .eq("id", item.id);

      if (error) throw error;
      setItem({ ...item, title, category, description, image_url });
      setEditMode(false);
      setMsg("Salvat.");
    } catch (err: any) {
      setMsg(err?.message || "Nu am putut salva.");
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    const ok = confirm("Ștergi acest obiect?");
    if (!ok) return;
    const { error } = await supabase.from("objects").delete().eq("id", item.id);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/my-objects");
  };

  const proposeSwap = async () => {
    if (!item || !me) return;
    if (iOwnIt) {
      setMsg("Nu poți propune schimb pe propriul obiect.");
      return;
    }
    if (!selectedMyId) {
      setMsg("Alege un obiect din lista ta.");
      return;
    }
    setMsg(null);
    setProposing(true);
    try {
      // INSERT respectând politicile: from_user_id trebuie să fie auth.uid()
      const { error } = await supabase.from("matches").insert({
        object1_id: selectedMyId,  // obiectul meu
        object2_id: item.id,       // obiectul celuilalt
        from_user_id: me,
        to_user_id: item.user_id,
        status: "pending",
      });
      if (error) throw error;
      setMsg("Propunere trimisă. Vezi la pagina Matches.");
      // optional redirect după 1s
      // setTimeout(() => router.push("/matches"), 800);
    } catch (err: any) {
      setMsg(err?.message || "Nu am putut trimite propunerea.");
    } finally {
      setProposing(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      <Nav />
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "1rem 2rem" }}>
        <a href="/objects" style={{ color: "#93c5fd" }}>← Înapoi la listă</a>

        {loading && <p>Se încarcă…</p>}
        {msg && <p style={{ color: msg.includes("Salvat") || msg.includes("Propunere") ? "#86efac" : "#fca5a5" }}>{msg}</p>}

        {/* Vizualizare */}
        {!loading && item && !editMode && (
          <article style={{ marginTop: 16, border: "1px solid #1f2937", borderRadius: 16, padding: 16, background: "rgba(2,6,23,0.6)" }}>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 12, marginBottom: 12 }}
              />
            )}
            <h1 style={{ marginTop: 0 }}>{item.title}</h1>
            {item.category && <p style={{ color: "#94a3b8" }}>Categorie: {item.category}</p>}
            {item.description && <p style={{ color: "#cbd5e1" }}>{item.description}</p>}

            {/* acțiuni pentru proprietar */}
            {iOwnIt && (
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setEditMode(true)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "white", cursor: "pointer" }}
                >
                  Editează
                </button>
                <button
                  onClick={handleDelete}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #7f1d1d", background: "#1f2937", color: "#fecaca", cursor: "pointer" }}
                >
                  Șterge
                </button>
              </div>
            )}

            {/* propunere schimb – doar dacă obiectul NU e al meu */}
            {!iOwnIt && (
              <div style={{ marginTop: 16, borderTop: "1px solid #1f2937", paddingTop: 12 }}>
                <h3 style={{ margin: "8px 0" }}>Propune schimb</h3>
                {myObjects.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>
                    Nu ai încă obiecte proprii. <a href="/add" style={{ color: "#93c5fd" }}>Adaugă unul</a> ca să poți propune schimb.
                  </p>
                ) : (
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ color: "#cbd5e1" }}>Alege obiectul tău:</label>
                    <select
                      value={selectedMyId ?? ""}
                      onChange={(e) => setSelectedMyId(Number(e.target.value))}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "#0b1220",
                        color: "white",
                        border: "1px solid #334155",
                        minWidth: 220,
                      }}
                    >
                      {myObjects.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.title || `(ID ${o.id})`}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={proposeSwap}
                      disabled={proposing}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "#2563eb",
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                        opacity: proposing ? 0.7 : 1,
                      }}
                    >
                      {proposing ? "Se trimite…" : "Trimite propunerea"}
                    </button>
                    <a href="/matches" style={{ color: "#93c5fd" }}>Vezi Matches</a>
                  </div>
                )}
              </div>
            )}
          </article>
        )}

        {/* Editare */}
        {!loading && item && editMode && iOwnIt && (
          <form
            onSubmit={handleUpdate}
            style={{ marginTop: 16, border: "1px solid #1f2937", borderRadius: 16, padding: 16, background: "rgba(2,6,23,0.6)" }}
          >
            <h2 style={{ marginTop: 0 }}>Editează obiect</h2>

            <label style={{ display: "block", marginBottom: 6 }}>Titlu</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "white", marginBottom: 12 }}
            />

            <label style={{ display: "block", marginBottom: 6 }}>Categorie</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "white", marginBottom: 12 }}
            />

            <label style={{ display: "block", marginBottom: 6 }}>Descriere</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "white", marginBottom: 12 }}
            />

            <label style={{ display: "block", marginBottom: 6 }}>Imagine (opțional)</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: 16 }} />

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#2563eb", color: "white", fontWeight: 700, cursor: "pointer" }}>
                Salvează
              </button>
              <button type="button" onClick={() => setEditMode(false)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "white", cursor: "pointer" }}>
                Renunță
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
