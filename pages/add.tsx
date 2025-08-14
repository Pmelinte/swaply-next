// pages/add.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddPage() {
  const [ready, setReady] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Permitem acces doar utilizatorilor autentificați
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = '/login'
      } else {
        setReady(true)
      }
    })
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    const { data: userRes } = await supabase.auth.getUser()
    const user = userRes.user
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase.from('objects').insert({
      user_id: user.id,
      title,
      description
    })

    setSaving(false)
    if (error) {
      setMsg('Eroare: ' + error.message)
    } else {
      setMsg('✅ Obiect adăugat!')
      setTitle('')
      setDescription('')
      // Poți schimba cu window.location.href = '/objects' după ce facem pagina de listare
    }
  }

  if (!ready) return null

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1>Adaugă un obiect</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input
          type="text"
          required
          placeholder="Titlu"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descriere (opțional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Se salvează...' : 'Salvează'}
        </button>
      </form>
      {msg && <p style={{ marginTop: '1rem' }}>{msg}</p>}
    </main>
  )
}
