// pages/login/index.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/'
    })
  }, [])

  async function signInWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    })
    setLoading(false)
    setStatus(error ? 'Eroare: ' + error.message : '✅ Ți-am trimis linkul de autentificare pe email.')
  }

  async function signInWithGoogle() {
    setLoading(true)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) { setLoading(false); setStatus('Eroare: ' + error.message) }
  }

  return (
    <main style={{ maxWidth: 400, margin: '0 auto', padding: '2rem' }}>
      <h1>Intră în cont</h1>
      <form onSubmit={signInWithEmail} style={{ display: 'grid', gap: '0.5rem' }}>
        <input
          type="email"
          required
          placeholder="email@exemplu.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button disabled={loading} type="submit">
          {loading ? 'Se trimite...' : 'Primește link de login'}
        </button>
      </form>
      <hr style={{ margin: '1rem 0' }} />
      <button onClick={signInWithGoogle} disabled={loading}>Continuă cu Google</button>
      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </main>
  )
}
