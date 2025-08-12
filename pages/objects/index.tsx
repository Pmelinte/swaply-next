import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Obj = {
  id: string;
  title: string | null;
  description: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

export default function ObjectsPage() {
  const [rows, setRows] = useState<Obj[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('objects error =>', error);
      console.log('objects rows  =>', data?.length);

      if (error) setErr(error.message);
      setRows(data ?? []);
    })();
  }, []);

  return (
    <div>
      <h2>Objects</h2>
      {err && <p style={{ color: 'salmon' }}>Error: {err}</p>}
      {rows.length === 0 ? (
        <p>No objects found.</p>
      ) : (
        <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
          {rows.map(o => (
            <li key={o.id} style={{ padding: 12, border: '1px solid #333', borderRadius: 8 }}>
              <strong>{o.title || '(no title)'}</strong>
              <div style={{ opacity: 0.8 }}>{o.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
