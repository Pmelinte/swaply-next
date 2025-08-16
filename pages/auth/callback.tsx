// pages/auth/callback.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [msg, setMsg] = useState('Se confirmă autentificarea…')

  useEffect(() => {
    const run = async () => {
      // 1) Dacă deja avem sesiune, mergem acasă
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        return
      }

      // 2) FLOW IMPLICIT (fragment): #access_token=…&refresh_token=…
      // ex: /auth/callback#access_token=…&refresh_token=…
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.slice(1) // scoatem '#'
        const h = new URLSearchParams(hash)
        const access_token = h.get('access_token') || undefined
        const refresh_token = h.get('refresh_token') || undefined

        if (access_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            // refresh_token poate lipsi pe unele provider-e; trimitem '' ca fallback
            refresh_token: refresh_token ?? ''
          })
          if (!error) {
            router.replace('/')
            return
          }
        }
      }

      // 3) FLOW PKCE (query): ?code=…
      const code = router.query.code as string | undefined
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace('/')
          return
        }
      }

      // 4) Nimic de procesat
      setMsg('Codul de autentificare lipsește. Întoarce-te la pagina de login și încearcă din nou.')
    }

    run()
  }, [router])

  return (
    <div style={{minHeight:'70vh',display:'grid',placeItems:'center',padding:'2rem'}}>
      <p style={{opacity:.6,fontSize:'clamp(18px,3vw,42px)',textAlign:'center'}}>{msg}</p>
    </div>
  )
}
