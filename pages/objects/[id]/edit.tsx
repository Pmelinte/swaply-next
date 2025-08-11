import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ensureAppUser } from '@/lib/ensureAppUser';

export default function EditObject() {
  const [objId, setObjId] = useState<number | null>(null);
  const [uid, setUid] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split('/'); // /objects/[id]/edit
    const idStr = parts[2];
    const id = Number(idStr);
    if (!id) { setMsg('ID invalid.'); return; }
    setObjId(id);

    (async () => {
      try {
        const myId = await ensureAppUser();
        setUid(myId);

        const { data, error } = await supabase
          .from('objects')
          .select('id, user_id, title, description, category, image_url')
          .eq('id', id)
          .maybeSingle();

        if (error || !data) { setMsg('Obiectul nu există.'); return; }
        if (data.user_id !== myId) { setMsg('Nu ai permisiune să editezi acest obiect.'); return; }

        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(data.category || '');
        setImageUrl(data.image_url || null);
      } catch (e: any) {
        setMsg(e.message);
      }
    })();
  }, []);

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      throw new Error('Setează NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME și NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET în .env.local');
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', preset);

    const resp = await fetch(url, { method: 'POST', body: form });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Cloudinary upload failed: [${resp.status}] ${body}`);
    }
    const data = await resp.json();
    return data.secure_url as string;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!objId || !uid) return;
    setMsg(null);
    try {
      const { error } = await supabase
        .from('objects')
        .update({
          title,
          description,
          category,
          image_url: imageUrl // asigură actualizarea imaginii
        })
        .eq('id', objId);

      if (error) throw error;
      window.location.href = `/objects/${objId}`;
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Editează obiect</h2>
      <form onSubmit={onSubmit} className="grid" style={{gridTemplateColumns:'1fr'}}>
        <label>Titlu</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required />

        <label>Descriere</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} />

        <label>Categorie</label>
        <input value={category} onChange={e=>setCategory(e.target.value)} />

        <label>Imagine (opțional schimbă)</label>
        <input type="file" accept="image/*" onChange={async (e)=>{
          const f = e.target.files?.[0];
          if (f) {
            try {
              const url = await uploadToCloudinary(f);
              setImageUrl(url);
            } catch (err: any) {
              setMsg(err.message);
            }
          }
        }} />
        {imageUrl && <img src={imageUrl} alt="preview" style={{width:240, borderRadius:12}}/>}

        <div style={{display:'flex', gap:8}}>
          <button type="submit">Salvează</button>
          <a href={objId ? `/objects/${objId}` : '/objects'}>
            <button type="button" className="secondary">Renunță</button>
          </a>
        </div>
        {msg && <p className="small">{msg}</p>}
      </form>
    </div>
  );
}
