import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ensureAppUser } from '@/lib/ensureAppUser';
import ObjectCard from '@/components/ObjectCard';

export default function MyObjects() {
  const [uid, setUid] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const id = await ensureAppUser();
        setUid(id);
        const { data } = await supabase.from('objects').select('*').eq('user_id', id).order('created_at', { ascending: false });
        setItems(data || []);
      } catch {
        window.location.href = '/';
      }
    })();
  }, []);

  const remove = async (id: number) => {
    if (!confirm('Ștergi obiectul?')) return;
    await supabase.from('objects').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div>
      <h2>Obiectele mele</h2>
      <div className="grid">
        {items.map(o => (
          <div key={o.id} className="card">
            <ObjectCard id={o.id} title={o.title} image_url={o.image_url || undefined} description={o.description || undefined} />
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <a href={`/objects/${o.id}`}><button>Deschide</button></a>
              <a href={`/objects/${o.id}/edit`}><button className="secondary">Edit</button></a>
              <button className="secondary" onClick={()=>remove(o.id)}>Șterge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
