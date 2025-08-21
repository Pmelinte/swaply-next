// pages/add.tsx
import { useEffect, useMemo, useRef, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { createClient, User } from "@supabase/supabase-js";
import Layout from "../components/Layout";
import s from "./add.module.css";

type NewObjectForm = {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
};

type HFTop = { label: string; score: number };

export default function AddObjectPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [form, setForm] = useState<NewObjectForm>({ title: "", description: "", category: "", imageUrl: "" });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [classifying, setClassifying] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [top3, setTop3] = useState<string[]>([]);
  const urlDebounce = useRef<number | null>(null);

  // --- AUTH ---
  useEffect(() => {
    let ok = true;
    supabase.auth.getUser().then(({ data }) => { if (!ok) return; setUser(data?.user ?? null); setCheckingAuth(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { ok = false; sub.subscription?.unsubscribe(); };
  }, [supabase]);

  useEffect(() => { if (!checkingAuth && !user) router.replace("/auth?redirect=/add"); }, [checkingAuth, user, router]);

  // --- HELPERE NUME/BRAND ---
  function lastPathSegmentFromUrl(u: string): string {
    try { const url = new URL(u); return url.pathname.split("/").filter(Boolean).pop() || ""; }
    catch { return u.split("/").filter(Boolean).pop() || ""; }
  }
  function cleanNameLikeFilename(name: string): string {
    let base = name.replace(/\.[a-z0-9]{2,4}$/i, "");
    try { base = decodeURIComponent(base); } catch {}
    base = base.replace(/[_\-+]+/g, " ")
               .replace(/\b(img|image|photo|picture|pic|copy|final|new|edit|large|small|thumb|desktop|mobile|wallpaper|download|www|http|https)\b/gi, " ")
               .replace(/\b\d{2,4}x\d{2,4}\b/gi, " ")
               .replace(/[()[\]]/g, " ")
               .replace(/\s{2,}/g, " ")
               .trim();
    // dacă e doar numeric sau mai scurt de 3 caractere -> ignorăm
    if (!/[a-zA-ZăâîșțÁÂÎȘȚ]/.test(base) || base.length < 3) return "";
    return base;
  }
  function brandFromUrl(u?: string): string {
    if (!u) return "";
    try {
      const host = new URL(u).hostname.toLowerCase();
      if (host.includes("jysk")) return "JYSK";
      if (host.includes("ikea")) return "IKEA";
      if (host.includes("emag")) return "eMAG";
      if (host.includes("dedeman")) return "Dedeman";
      if (host.includes("altex")) return "Altex";
      if (host.includes("leroymerlin")) return "Leroy Merlin";
      return "";
    } catch { return ""; }
  }
  function buildNiceTitle(label: string | null, fromName: string | null, url?: string): string | null {
    const L = (label || "").trim();
    let N = (fromName || "").trim();
    const B = brandFromUrl(url);
    if (!N && B) N = B;
    if (L && N) {
      if (N.toLowerCase().startsWith(L.toLowerCase())) return N;
      return `${L} ${N}`.trim();
    }
    return L || N || null;
  }

  // --- FORM INPUT ---
  const onInput =
    (key: keyof NewObjectForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function fileToBase64(f: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => { reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(f); });
  }

  function mapLabelsToCategory(labels: string[]): string {
    const text = labels.map((s) => s.toLowerCase()).join(" ");
    const has = (xs: string[]) => xs.some((k) => text.includes(k));
    const ELECTRONICS = ["laptop","notebook computer","desktop computer","computer keyboard","computer mouse","cellular telephone","mobile phone","smartphone","camera","television","monitor","headphone","earphone","speaker","loudspeaker","smart watch"];
    const SPORT = ["bicycle","mountain bike","skateboard","ski","snowboard","ball","soccer ball","football","basketball","tennis racket","baseball","helmet","dumbbell","barbell","glove"];
    const FASHION = ["t-shirt","shirt","jersey","jean","denim","dress","jacket","coat","shoe","sneaker","running shoe","boot","bag","handbag","backpack","cap","hat"];
    const BOOKS = ["book"];
    if (has(ELECTRONICS)) return "electronice";
    if (has(SPORT)) return "sport";
    if (has(BOOKS) && !text.includes("notebook computer")) return "cărți";
    if (has(FASHION)) return "moda";
    return "altele";
  }

  async function classifyWithPayload(payload: object, preview?: string, meta?: { fileName?: string; url?: string }) {
    try {
      setClassifying(true); setClassifyError(null);
      setSuggestedTitle(null); setSuggestedCategory(null);
      if (preview) setPreviewUrl(preview);

      const res = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      const json: { suggestion?: string | null; raw?: HFTop[]; error?: string } = await res.json();
      if ((json as any).error) throw new Error((json as any).error);

      const label = (json?.suggestion ?? "").trim();
      const raw = (json?.raw ?? []);
      setTop3(raw.slice(0, 3).map(x => x.label.split(",")[0]));

      const rawLabels = raw.map((x) => x.label);
      const cat = mapLabelsToCategory(rawLabels);
      if (!form.category) setForm((p) => ({ ...p, category: cat }));
      setSuggestedCategory(cat);

      let nameFromSource = "";
      if (meta?.fileName) nameFromSource = cleanNameLikeFilename(meta.fileName);
      else if (meta?.url) nameFromSource = cleanNameLikeFilename(lastPathSegmentFromUrl(meta.url));

      const nice = buildNiceTitle(label || null, nameFromSource || null, meta?.url);
      setSuggestedTitle(nice);
      if (nice && !form.title.trim()) {
        const finalTitle = nice.length > 80 ? nice.slice(0, 77).trim() + "…" : nice;
        setForm((p) => ({ ...p, title: finalTitle }));
      }
    } catch (err: any) {
      console.error(err);
      setClassifyError(err?.message || "Nu am putut clasifica imaginea.");
    } finally {
      setClassifying(false);
    }
  }

  async function classifyFromFile(f: File) {
    const blobUrl = URL.createObjectURL(f);
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    const imageBase64 = await fileToBase64(f);
    await classifyWithPayload({ imageBase64 }, blobUrl, { fileName: f.name });
  }
  async function classifyFromUrl(url: string) {
    await classifyWithPayload({ imageUrl: url }, url, { url });
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) classifyFromFile(f);
  };
  const onImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, imageUrl: val }));
    setPreviewUrl(val || null);
    if (urlDebounce.current) clearTimeout(urlDebounce.current);
    if (val && /^https?:\/\//i.test(val)) {
      urlDebounce.current = window.setTimeout(() => { classifyFromUrl(val); }, 600);
    } else {
      setSuggestedTitle(null); setSuggestedCategory(null); setClassifyError(null); setTop3([]);
    }
  };

  async function uploadToCloudinary(f: File): Promise<string> {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
    const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
    const fd = new FormData();
    fd.append("file", f);
    fd.append("upload_preset", preset);
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
    const json = await res.json();
    return json.secure_url as string;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true); setErrorMsg(null); setSuccessMsg(null);
    try {
      if (!user) throw new Error("Nu ești autentificat. Autentifică-te și revino la /add.");
      let imageUrl = form.imageUrl.trim();
      if (!imageUrl && file) imageUrl = await uploadToCloudinary(file);
      const payload = {
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || null,
        image_url: imageUrl || null,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("objects").insert(payload);
      if (error) throw error;
      setSuccessMsg("Obiectul a fost adăugat cu succes!");
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "A apărut o eroare la salvare.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) return (
    <Layout>
      <h1 className={s.title}>Se verifică autentificarea…</h1>
      <p className={s.muted}>Rămânem pe /add până aflăm sigur dacă ești logat.</p>
    </Layout>
  );
  if (!user) return (
    <Layout>
      <h1 className={s.title}>Trebuie să te autentifici</h1>
      <p className={s.muted}>Te redirecționăm la pagina de autentificare…</p>
    </Layout>
  );

  return (
    <Layout>
      <h1 className={s.title}>Adaugă obiect</h1>
      <p className={s.muted}>Ești logat ca <b>{user.email ?? user.id}</b>.</p>

      <form onSubmit={onSubmit} className={s.form}>
        <label>
          <span>Titlu</span>
          <input type="text" value={form.title} onChange={onInput("title")} placeholder="Ex: Bicicletă mountain bike" required className={s.input} />
          <div className={s.hint}>
            {classifying && "Analizez imaginea pentru un titlu…"}
            {!classifying && suggestedTitle && <>Sugestie titlu: <b>{suggestedTitle}</b> (poți edita)</>}
          </div>
        </label>

        <label>
          <span>Descriere</span>
          <textarea value={form.description} onChange={onInput("description")} placeholder="Stare bună, schimb pe…" rows={4} className={s.textarea} />
        </label>

        <label>
          <span>Categorie</span>
          <select value={form.category} onChange={onInput("category")} className={s.select}>
            <option value="">— alege —</option>
            <option value="electronice">Electronice</option>
            <option value="sport">Sport</option>
            <option value="cărți">Cărți</option>
            <option value="moda">Modă</option>
            <option value="altele">Altele</option>
          </select>
          <div className={s.hint}>
            {classifying && "Încerc să deduc și categoria…"}
            {!classifying && suggestedCategory && <>Sugestie categorie: <b>{suggestedCategory}</b> (poți schimba)</>}
          </div>
        </label>

        <fieldset className={s.fieldset}>
          <legend className={s.legend}>Imagine</legend>
          <div>
            <label>
              <span>Încarcă fișier (Cloudinary)</span>
              <input type="file" accept="image/*" onChange={onFile} />
            </label>

            {previewUrl && (
              <div style={{ marginTop: 8 }}>
                <img src={previewUrl} alt="Previzualizare" className={s.preview} />
              </div>
            )}

            {top3.length > 0 && (
              <div className={s.chips}>
                {top3.map((t) => (
                  <span key={t} className={s.chip}>{t}</span>
                ))}
              </div>
            )}

            <div className={s.separator}>— sau —</div>

            <label>
              <span>URL Imagine (opțional)</span>
              <input type="url" value={form.imageUrl} onChange={onImageUrlChange} placeholder="https://…" className={s.input} />
              <div className={s.hint} style={{ color: classifyError ? "#b00020" : undefined }}>
                {classifyError && `Nu am reușit clasificarea din URL: ${classifyError}`}
              </div>
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={submitting} className={s.button}>
          {submitting ? "Se salvează…" : "Adaugă obiect"}
        </button>

        {errorMsg && <div className={`${s.alert} ${s.alertError}`}>{errorMsg}</div>}
        {successMsg && <div className={`${s.alert} ${s.alertOk}`}>{successMsg}</div>}
      </form>
    </Layout>
  );
}
