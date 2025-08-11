import { supabase } from '@/lib/supabaseClient';

export async function ensureAppUser() {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw new Error('Not authenticated');
  // Try to find row
  const { data: existing, error: selErr } = await supabase
    .from('users')
    .select('id, auth_uid')
    .eq('auth_uid', user.id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  // Create row
  const { data: inserted, error: insErr } = await supabase
    .from('users')
    .insert({ auth_uid: user.id, email: user.email })
    .select('id')
    .single();
  if (insErr) throw insErr;
  return inserted.id;
}
