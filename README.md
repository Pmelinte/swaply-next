# Swaply — Obj/User/Auth

Stack: Next.js 13.5 (pages), Supabase (auth + DB), Cloudinary (imagini).  
Alias TypeScript: `@/*` → `baseUrl: "."`.

## Rute
- `/` — Login / Register (email + parolă), logout
- `/add-object` — Adaugă obiect (folosește `ensureAppUser()` pentru `user_id`)
- `/objects` — Listă obiecte (cu helper `transformCloudinary(url)`)
- `/objects/[id]` — Detaliu obiect + trimitere mesaj către proprietar
- `/my-objects` — Listă, edit, delete doar pentru owner
- `/users` — Listă utilizatori
- `/matches` — Listă brută
- `/insert` — redirect → `/add-object`

## Setup local
1. Copiază `.env.local.example` în `.env.local` și pune cheile reale.
2. `npm install`
3. `npm run dev` → http://localhost:3000
4. Configurează la Supabase → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (local) + URL-ul Vercel în producție
   - Redirect URLs: adaugă aceleași URL-uri

## Deploy (Vercel)
- Setează Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CLOUDINARY_*`.
- Pornește build. Folosește mereu: `import { supabase } from '@/lib/supabaseClient'`.

## SQL
- `sql/schema.sql` → tabele
- `sql/policies.sql` → RLS (Row Level Security) pentru Supabase
