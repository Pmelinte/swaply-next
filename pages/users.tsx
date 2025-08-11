import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('users').select('id, name, email, avatar_url, created_at').order('created_at', { ascending: false }).limit(100);
      setUsers(data || []);
    })();
  }, []);
  return (
    <div>
      <h2>Users</h2>
      <div className="grid">
        {users.map(u => (
          <div key={u.id} className="card">
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              {u.avatar_url && <img src={u.avatar_url} alt="avatar" style={{width:48, height:48, borderRadius:12, objectFit:'cover'}} />}
              <div>
                <div><strong>{u.name || '—'}</strong></div>
                <div className="small">{u.email}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
