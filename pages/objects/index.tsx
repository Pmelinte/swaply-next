import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ObjectCard from '@/components/ObjectCard';

type Obj = {
  id: number; title: string; description: string | null; image_url: string | null;
  users?: { name: string | null } | null; user_id: number;
};

export default function ObjectsList() {
  const [items, setItems] = useState<Obj[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('objects')
        .select('id, title, description, image_url, user_id, users(name)')
        .order('created_at', { ascending: false })
        .limit(60);
      if (!error && data) setItems(data as any);
    })();
  }, []);

  return (
    <div>
      <h2>Objects</h2>
      <div className="grid">
        {items.map(o => (
          <ObjectCard key={o.id} id={o.id} title={o.title} image_url={o.image_url || undefined} description={o.description || undefined} owner={o.users?.name || null} />
        ))}
      </div>
    </div>
  );
}
