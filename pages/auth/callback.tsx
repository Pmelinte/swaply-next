// pages/auth/callback.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

type Status = 'working' | 'missing' | 'error' | 'done';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('working');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return;

      const url = window.location.href;
      const hasCode = url.includes('code=');

      if (!hasCode) {
        setStatus('missing');
        return;
      }

      // Schimbă codul din URL pe sesiune (PKCE)
      const { error } = await supabase.auth.exchangeCodeForSession(url);

      if (error) {
        setStatus('error');
        setMessage(error.message ?? 'Autentificarea a eșuat.');
        return;
      }

      setStatus('done');

      // Dacă ai un parametru ?next=/ruta, redirecționează acolo; altfel către /
      const next =
        new URL(url).searchParams.get('next') ??
        '/';
      router.replace(next);
    };

    run();
  }, [router]);

  return (
    <>
      <Head>
        <title>Autentificare…</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main
        style={{
          minHeight: '70vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          color: '#eaeaea',
        }}
      >
        {status === 'working' && <p>Se verifică codul de autentificare…</p>}

        {status === 'missing' && (
          <div style={{ textAlign: 'center' }}>
            <h1>Codul de autentificare lipsește</h1>
            <p>Întoarce-te la pagina de login și încearcă din nou.</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <h1>Eroare la autentificare</h1>
            <p style={{ opacity: 0.8 }}>{message}</p>
          </div>
        )}

        {status === 'done' && <p>Autentificat. Redirecționare…</p>}
      </main>
    </>
  );
}
