import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from './supabase/admin';
import { getSiteUrl } from './site';

export async function clearDeletedProfile(userId: string, email?: string | null) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('deleted_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.deleted_at) return;

  const { error } = await admin
    .from('profiles')
    .upsert({ id: userId, email: email ?? undefined, deleted_at: null });

  if (error) throw error;
}

/** 탈퇴 계정 재가입 — 기존 사용자에게는 signup resend 대신 magic link 사용 */
export async function sendReactivationEmail(email: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) throw error;
}

export async function isDeletedAccount(email: string) {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data: profile } = await admin
    .from('profiles')
    .select('id, deleted_at')
    .eq('email', normalized)
    .maybeSingle();

  if (profile?.deleted_at) return true;

  // email 컬럼이 없는 예전 탈퇴 계정 fallback
  const { findAuthUserByEmail } = await import('./auth-admin');
  const user = await findAuthUserByEmail(email);
  if (!user) return false;

  const { data: profileById } = await admin
    .from('profiles')
    .select('deleted_at')
    .eq('id', user.id)
    .maybeSingle();

  return !!profileById?.deleted_at;
}
