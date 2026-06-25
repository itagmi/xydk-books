import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const admin = createAdminClient();

  // 책 삭제 (notes는 cascade로 자동 삭제)
  const { error: booksError } = await admin
    .from('books')
    .delete()
    .eq('user_id', user.id);

  if (booksError) {
    console.error('[withdraw] books delete error:', booksError);
    return Response.json({ error: '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }

  // 소프트 삭제: deleted_at 기록
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      deleted_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('[withdraw] profiles upsert error:', profileError);
    return Response.json({ error: '탈퇴 처리 중 오류가 발생했습니다.', detail: profileError.message }, { status: 500 });
  }

  // 현재 세션 종료
  await supabase.auth.signOut();

  return Response.json({ ok: true });
}
