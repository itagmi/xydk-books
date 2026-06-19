import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 서버 사이드에서 강제 로그아웃 후 리다이렉트 (탈퇴 계정 세션 처리용)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { searchParams, origin } = new URL(request.url);
  const reason = searchParams.get('reason');
  const dest = reason ? `${origin}/login?error=${reason}` : `${origin}/login`;

  return NextResponse.redirect(dest);
}
