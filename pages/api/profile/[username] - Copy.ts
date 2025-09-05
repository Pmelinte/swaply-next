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

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ profile: null, wishlist: [], objects: [], contact: null, error: 'Method Not Allowed' });
  }

  const { username } = req.query;
  if (typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ profile: null, wishlist: [], objects: [], contact: null, error: 'Invalid username' });
  }

  // 1) user_id din username
  const { data: userId, error: e1 } = await supabase.rpc('get_user_id_by_username', { p_username: username });
  if (e1) return res.status(500).json({ profile: null, wishlist: [], objects: [], contact: null, error: e1.message });
  if (!userId) return res.status(404).json({ profile: null, wishlist: [], objects: [], contact: null, error: 'Profile not found' });

  // 2) profil public
  const { data: profileRows, error: e2 } = await supabase.rpc('get_public_profile', { p_user_id: userId as string });
  if (e2) return res.status(500).json({ profile: null, wishlist: [], objects: [], contact: null, error: e2.message });
  const profile = Array.isArray(profileRows) ? profileRows[0] ?? null : profileRows ?? null;

  // 3) wishlist public
  const { data: wishlist, error: e3 } = await supabase.rpc('get_public_wishlist', { p_user_id: userId as string });
  if (e3) return res.status(500).json({ profile, wishlist: [], objects: [], contact: null, error: e3.message });

  // 4) obiecte ale uti
