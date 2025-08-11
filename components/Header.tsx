import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{display:'flex', gap: '0.75rem', alignItems:'center'}}>
        <Link href="/"><strong>Swaply</strong></Link>
        <nav style={{display:'flex', gap:'0.75rem'}}>
          <Link href="/objects">Objects</Link>
          <Link href="/add-object">Add</Link>
          <Link href="/my-objects">My Objects</Link>
          <Link href="/users">Users</Link>
          <Link href="/matches">Matches</Link>
        </nav>
      </div>
      <div>
        {email ? (
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            <span className="small">{email}</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <Link href="/">Login</Link>
        )}
      </div>
    </header>
  );
}
