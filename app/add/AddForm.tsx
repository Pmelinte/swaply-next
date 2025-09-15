"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function AddForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      let image_url: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: fd });
        const upload = await res.json();
        if (upload?.error) throw new Error(upload.error?.message || "Cloudinary upload failed");
        image_url = upload.secure_url as string;
      }

      const baseTitle = (label || "Obiectul meu nou").trim();
      const { error } = await supabase.from("objects").insert({
        title: baseTitle,      // pentru schema care cere NOT NULL
        label: baseTitle,      // UI folosește label
        notes: notes || null,
        category: category || null,
        score: 50,
        user_id: user.id,
        image_url
      });
      if (error) { alert("Eroare la inserare: " + error.message); return; }

      router.push("/my-objects");
      router.refresh();
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh", padding: 16 }}>
      <form onSubmit={onSubmit} className="card" style={{ width: "100%", maxWidth: 560 }}>
        <div className="pad" style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Adaugă obiect</h2>

          <label className="small">Titlu</label>
          <input className="btn" value={label} onChange={e=>setLabel(e.target.value)} placeholder="ex: Rucsac urban 20L" style={{ borderRadius: 10 }} />

          <label className="small">Categorie</label>
          <input className="btn" value={category} onChange={e=>setCategory(e.target.value)} placeholder="ex: electronice / cărți / altele" style={{ borderRadius: 10 }} />

          <label className="small">Notițe</label>
          <textarea className="btn" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Detalii utile" style={{ borderRadius: 10, resize: "vertical" }} />

          <label className="small">Imagine (opțional)</label>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} className="btn" style={{ padding: 8, borderRadius: 10 }} />

          <div className="hstack" style={{ justifyContent: "end", marginTop: 8 }}>
            <button className="btn" type="submit" disabled={busy}>{busy ? "Se salvează..." : "Salvează"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
