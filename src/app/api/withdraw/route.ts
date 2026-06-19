import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const admin = createAdminClient();

  // 소프트 삭제: 원본 이메일 보존 + deleted_at 기록
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: user.id, email: user.email, deleted_at: new Date().toISOString() });

  if (profileError) {
    console.error('[withdraw] profiles upsert error:', profileError);
    return Response.json({ error: '탈퇴 처리 중 오류가 발생했습니다.', detail: profileError.message }, { status: 500 });
  }

  // 이메일 마스킹: 기존 이메일을 해방해 재가입 가능하게 함
  await admin.auth.admin.updateUserById(user.id, {
    email: `deleted_${user.id}@deleted.invalid`,
  });

  // 현재 세션 종료
  await supabase.auth.signOut();

  return Response.json({ ok: true });
}
