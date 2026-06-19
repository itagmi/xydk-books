import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { WithdrawButton } from './WithdrawButton';

const MONTHLY_LIMIT = Number(process.env.REVIEW_MONTHLY_LIMIT ?? 5);

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 탈퇴 계정 차단
  const { data: profile } = await supabase
    .from('profiles')
    .select('deleted_at')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.deleted_at) redirect('/api/signout?reason=deleted');

  const { count: booksCount } = await supabase
    .from('books')
    .select('id', { count: 'exact', head: true });

  const month = currentMonth();
  const gen = user.user_metadata?.review_gen as { month?: string; count?: number } | undefined;
  const reviewCount = gen?.month === month ? (gen.count ?? 0) : 0;
  const reviewRemaining = Math.max(0, MONTHLY_LIMIT - reviewCount);

  const nickname = user.user_metadata?.nickname as string | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="돌아가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-gray-800">내 정보</h1>
        </div>

        <div className="space-y-4">
          {/* 프로필 */}
          <section className="rounded-2xl bg-white p-5 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">프로필</h2>
            <div className="space-y-2">
              {nickname && (
                <Row label="닉네임" value={nickname} />
              )}
              <Row label="이메일" value={user.email ?? '—'} />
              <Row label="가입일" value={formatDate(user.created_at)} />
            </div>
          </section>

          {/* 독서 현황 */}
          <section className="rounded-2xl bg-white p-5 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">독서 현황</h2>
            <Row label="등록한 책" value={`${booksCount ?? 0}권`} />
          </section>

          {/* AI 독후감 */}
          <section className="rounded-2xl bg-white p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">AI 독후감</h2>
              <span className="text-xs text-gray-300">{month}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">이번 달 사용</span>
                <span className="text-sm font-medium text-gray-800">
                  {reviewCount}
                  <span className="font-normal text-gray-400"> / {MONTHLY_LIMIT}회</span>
                </span>
              </div>
              {/* 프로그레스 바 */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-800 transition-all"
                  style={{ width: `${(reviewCount / MONTHLY_LIMIT) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {reviewRemaining > 0
                  ? `이번 달 ${reviewRemaining}회 더 생성할 수 있어요`
                  : '이번 달 한도를 모두 사용했어요'}
              </p>
            </div>
          </section>

          {/* 계정 탈퇴 */}
          <section className="rounded-2xl bg-white p-5 space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">계정</h2>
            <WithdrawButton />
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}
