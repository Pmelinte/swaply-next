import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ensureAppUser } from '@/lib/ensureAppUser';
import { transformCloudinary } from '@/lib/cloudinary';
import Link from 'next/link';

type Obj = {
  id: number; title: string; description: string | null; image_url: string | null;
  user_id: number; users?: { id: number; name: string | null; email: string | null } | null;
};

export default function ObjectDetail() {
  const [obj, setObj] = useState<Obj | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('objects')
        .select('id, title, description, image_url, user_id, users(id, name, email)')
        .eq('id', id)
        .maybeSingle();
      setObj(data as any);
    })();
  }, []);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!obj) return;
    setStatus(null);
    try {
      const myId = await ensureAppUser();
      const toUserId = obj.user_id;
      if (myId === toUserId) throw new Error('Nu poți trimite mesaj către propriul obiect.');
      const { error } = await supabase.from('messages').insert({
        object_id: obj.id, from_user_id: myId, to_user_id: toUserId, content: text
      });
      if (error) throw error;
      setText('');
      setStatus('Mesaj trimis!');
    } catch (err: any) {
      setStatus(err.message);
    }
  };

  if (!obj) return <div className="card">Se încarcă...</div>;

  const img = transformCloudinary(obj.image_url || undefined, 900);

  return (
    <div className="grid" style={{gridTemplateColumns:'1.3fr 0.7fr'}}>
      <div className="card">
        {img && <img src={img} alt={obj.title} style={{width:'100%',borderRadius:12, marginBottom:8}} />}
        <h2>{obj.title}</h2>
        {obj.description && <p>{obj.description}</p>}
      </div>
      <div className="card">
        <h3>Contactează proprietarul</h3>
        <p className="small">Proprietar: {obj.users?.name || obj.users?.email || 'User'}</p>
        <form onSubmit={sendMessage} className="grid" style={{gridTemplateColumns:'1fr'}}>
          <label>Mesaj</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} required />
          <button type="submit">Trimite</button>
          {status && <p className="small">{status}</p>}
        </form>
        <div style={{marginTop:16}}>
          <Link href="/objects"><button className="secondary">Înapoi la listă</button></Link>
        </div>
      </div>
    </div>
  );
}
