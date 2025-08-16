// pages/add.tsx
import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";
import Nav from "../components/Nav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export default function AddPage() {
  const [user, setUser] = useState<User | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  const uploadToCloudinary = async (f: File) => {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
    const form = new FormData();
    form.append("file", f);
    form.append("upload_preset", preset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error("Upload eșuat către Cloudinary.");
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setMsg("Nu ești autentificat.");
    setLoading(true);
    setMsg(null);

    try {
      let image_url: string | null = null;
      if (file) image_url = await uploadToCloudinary(file);

      const { error } = await supabase.from("objects").insert({
        title,
        description: description || null,
        category: category || null,
        image_url,
        user_id: user.id,
      });

      if (error) throw error;
      window.location.href = "/my-objects";
    } catch (err: any) {
      setMsg(err?.message || "Nu am putut salva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
      <Nav />
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>Adaugă obiect</h1>
        {msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}

        <form
          onSubmit={handleSubmit}
          style={{
            border: "1px solid #1f2937",
            borderRadius: 16,
            padding: 16,
            background: "rgba(2,6,23,0.6)",
          }}
        >
          <label style={{ display: "block", marginBottom: 6 }}>Titlu</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "white",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Descriere</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "white",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>Categorie</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "white",
              marginBottom: 12,
            }}
          />

          <label style={{ display: "block", marginBottom: 6 }}>
            Imagine (opțional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ marginBottom: 16 }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            {loading ? "Se salvează…" : "Salvează"}
          </button>
        </form>
      </section>
    </main>
  );
}
