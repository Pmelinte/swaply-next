import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Check your email to confirm registration (if email confirmation is enabled).');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/objects';
      }
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Login / Register</h2>
      <div className="small" style={{marginBottom: 12}}>
        Autentifică-te sau înregistrează-te pentru a adăuga și a contacta proprietarii de obiecte.
      </div>
      <form onSubmit={onSubmit} className="grid" style={{gridTemplateColumns:'1fr'}}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <div style={{display:'flex', gap:8}}>
          <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          <button type="button" className="secondary" onClick={()=>setMode(mode==='login'?'register':'login')}>Switch to {mode==='login'?'Register':'Login'}</button>
        </div>
      </form>
      {msg && <p className="small" style={{marginTop:12}}>{msg}</p>}
    </div>
  );
}
