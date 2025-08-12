import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Obj = {
  id: string;
  title: string | null;
  description: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

const capitalize = (s?: string | null) =>
  s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function ObjectsPage() {
  const [rows, setRows] = useState<Obj[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select('id,title,description,image_url,created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) setErr(error.message);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Objects</h2>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: 'salmon' }}>Error: {err}</p>}
      {!loading && rows.length === 0 && <p>No objects found.</p>}

      <ul style={{ display: 'grid', gap: 16, padding: 0, listStyle: 'none' }}>
        {rows.map((o) => (
          <li
            key={o.id}
            style={{ border: '1px solid #333', borderRadius: 12, padding: 16 }}
          >
            <strong style={{ display: 'block', fontSize: 18 }}>
              {capitalize(o.title)}
            </strong>
            <span style={{ opacity: 0.8 }}>{o.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
