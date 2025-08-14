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
        // Preia tokenul din URL și salvează sesiunea în cookies
        const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) {
          setMsg('Eroare la autentificare: ' + error.message)
          return
        }
      } catch (e: any) {
        setMsg('Eroare: ' + e.message)
        return
      }
      // Gata – mergem acasă
      window.location.replace('/')
    })()
  }, [])

  return <main style={{ padding: '2rem' }}>{msg}</main>
}
