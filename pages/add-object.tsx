import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ensureAppUser } from '@/lib/ensureAppUser';

export default function AddObject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) window.location.href = '/';
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
    setMessage(null);
    try {
      const uid = await ensureAppUser();
      const { data, error } = await supabase
        .from('objects')
        .insert({ user_id: uid, title, description, category, image_url: imageUrl })
        .select('id')
        .single();
      if (error) throw error;
      window.location.href = `/objects/${data.id}`;
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Adaugă obiect</h2>
      <form onSubmit={onSubmit} className="grid" style={{gridTemplateColumns:'1fr'}}>
        <label>Titlu</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required />
        <label>Descriere</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} />
        <label>Categorie</label>
        <input value={category} onChange={e=>setCategory(e.target.value)} />
        <label>Imagine</label>
        <input type="file" accept="image/*" onChange={async (e)=>{
          const file = e.target.files?.[0];
          if (file) {
            try {
              const url = await uploadToCloudinary(file);
              setImageUrl(url);
            } catch (err: any) {
              setMessage(err.message);
            }
          }
        }} />
        {imageUrl && <img src={imageUrl} alt="preview" style={{width:240, borderRadius:12}}/>}
        <div>
          <button type="submit">Salvează</button>
        </div>
        {message && <p className="small">{message}</p>}
      </form>
    </div>
  );
}
