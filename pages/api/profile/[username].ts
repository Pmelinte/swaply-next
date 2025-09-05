// pages/api/profile/[username].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ApiData = {
  profile: any | null;
  wishlist: any[];
  objects: any[];
  contact: { email: string | null; phone: string | null } | null;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiData>
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ profile: null, wishlist: [], objects: [], contact: null, error: 'Method Not Allowed' });
  }

  const { username } = req.query;
  if (typeof username !== 'string' || !username.trim()) {
    return res
      .status(400)
      .json({ profile: null, wishlist: [], objects: [], contact: null, error: 'Invalid username' });
  }

  // 1) username -> user_id
  const { data: userId, error: e1 } = await supabase.rpc('get_user_id_by_username', {
    p_username: username,
  });
  if (e1) {
    return res
      .status(500)
      .json({ profile: null, wishlist: [], objects: [], contact: null, error: e1.message });
  }
  if (!userId) {
    return res
      .status(404)
      .json({ profile: null, wishlist: [], objects: [], contact: null, error: 'Profile not found' });
  }

  // 2) profil public (normalizăm la obiect)
  const { data: profileRows, error: e2 } = await supabase.rpc('get_public_profile', {
    p_user_id: userId as string,
  });
  if (e2) {
    return res
      .status(500)
      .json({ profile: null, wishlist: [], objects: [], contact: null, error: e2.message });
  }
  const profile = Array.isArray(profileRows) ? profileRows[0] ?? null : profileRows ?? null;

  // 3) wishlist public
  const { data: wishlist, error: e3 } = await supabase.rpc('get_public_wishlist', {
    p_user_id: userId as string,
  });
  if (e3) {
    return res
      .status(500)
      .json({ profile, wishlist: [], objects: [], contact: null, error: e3.message });
  }

  // 4) obiecte ale utilizatorului — fallback owner_id -> user_id
  let objects: any[] = [];
  let e4msg: string | null = null;

  const q1 = await supabase.from('objects').select('*').eq('owner_id', userId as string);
  if (q1.error && /owner_id/.test(q1.error.message)) {
    const q2 = await supabase.from('objects').select('*').eq('user_id', userId as string);
    if (q2.error) {
      e4msg = q2.error.message;
    } else {
      objects = q2.data ?? [];
    }
  } else if (q1.error) {
    e4msg = q1.error.message;
  } else {
    objects = q1.data ?? [];
  }
  if (e4msg) {
    return res
      .status(500)
      .json({ profile, wishlist: wishlist || [], objects: [], contact: null, error: e4msg });
  }

  // 5) contact public (normalizăm la obiect)
  const { data: contactRows, error: e5 } = await supabase.rpc('get_public_contact', {
    p_user_id: userId as string,
  });
  if (e5) {
    return res
      .status(500)
      .json({ profile, wishlist: wishlist || [], objects: objects || [], contact: null, error: e5.message });
  }
  const contact =
    Array.isArray(contactRows) && contactRows.length
      ? contactRows[0]
      : { email: null, phone: null };

  return res.status(200).json({
    profile,
    wishlist: wishlist || [],
    objects: objects || [],
    contact,
  });
}
