import { findAuthUserByEmail } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown }).email === 'string'
    ? (body as { email: string }).email.trim()
    : '';
  const password = typeof (body as { password?: unknown }).password === 'string'
    ? (body as { password: string }).password
    : '';
  const nickname = typeof (body as { nickname?: unknown }).nickname === 'string'
    ? (body as { nickname: string }).nickname.trim()
    : '';

  if (!email || password.length < 6) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  if (nickname.length < 2 || nickname.length > 10) {
    return Response.json({ error: 'invalid_nickname' }, { status: 400 });
  }

  let user;
  try {
    user = await findAuthUserByEmail(email);
  } catch (err) {
    console.error('[reactivate] find user error:', err);
    return Response.json({ error: 'lookup_failed' }, { status: 500 });
  }

  if (!user) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('deleted_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.deleted_at) {
    return Response.json({ error: 'active' }, { status: 409 });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password,
    user_metadata: { ...user.user_metadata, nickname },
  });

  if (updateError) {
    console.error('[reactivate] updateUser error:', updateError);
    return Response.json({ error: 'update_failed' }, { status: 500 });
  }

  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: user.id, email, deleted_at: null });

  if (profileError) {
    console.error('[reactivate] profiles error:', profileError);
    return Response.json({ error: 'profile_failed' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
