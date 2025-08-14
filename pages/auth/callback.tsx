// pages/auth/callback.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const [msg, setMsg] = useState('Se finalizează autentificarea...')

  useEffect(() => {
    (async () => {
      try {
        // Supabase v2: schimbă codul/tokens din URL într-o sesiune salvată
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (error) {
          setMsg('Eroare la autentificare: ' + error.message)
          return
        }
      } catch (e: any) {
        setMsg('Eroare: ' + e.message)
        return
      }
      // Done → acasă
      window.location.replace('/')
    })()
  }, [])

  return <main style={{ padding: '2rem' }}>{msg}</main>
}
