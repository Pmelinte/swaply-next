import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Matches() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('matches')
        .select('id, status, created_at, object_id, other_object_id, from_user_id, to_user_id')
        .order('created_at', { ascending: false })
        .limit(100);
      setRows(data || []);
    })();
  }, []);
  return (
    <div className="card">
      <h2>Matches (brut)</h2>
      <div className="small" style={{marginBottom:8}}>Stocare flexibilă pentru potriviri / intenții.</div>
      <table style={{width:'100%', fontSize:14}}>
        <thead>
          <tr>
            <th align="left">#</th>
            <th align="left">Object</th>
            <th align="left">Other</th>
            <th align="left">From</th>
            <th align="left">To</th>
            <th align="left">Status</th>
            <th align="left">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.object_id || '—'}</td>
              <td>{r.other_object_id || '—'}</td>
              <td>{r.from_user_id || '—'}</td>
              <td>{r.to_user_id || '—'}</td>
              <td>{r.status}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
