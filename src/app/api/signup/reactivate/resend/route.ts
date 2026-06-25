import { isDeletedAccount, sendReactivationEmail } from '@/lib/reactivate';

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

  if (!email) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  let deleted = false;
  try {
    deleted = await isDeletedAccount(email);
  } catch (err) {
    console.error('[reactivate/resend] lookup error:', err);
    return Response.json({ error: 'lookup_failed' }, { status: 500 });
  }

  if (!deleted) {
    return Response.json({ error: 'not_deleted' }, { status: 409 });
  }

  try {
    await sendReactivationEmail(email);
  } catch (err) {
    console.error('[reactivate/resend] email error:', err);
    return Response.json({ error: 'email_failed' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
