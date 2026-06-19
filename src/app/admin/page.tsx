import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageSizeSelect } from './PageSizeSelect';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'itagmi88@gmail.com';
const PAGE_SIZES = [5, 10, 15, 20] as const;
const DEFAULT_PAGE_SIZE = 5;

function isoToDate(iso: string) {
  return iso.slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return isoToDate(iso);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const admin = createAdminClient();
  const [{ data: usersData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('profiles').select('id, email, deleted_at'),
  ]);
  const users = usersData?.users ?? [];

  // profiles 맵: id → { email, deleted_at }
  type ProfileRow = { id: string; email: string | null; deleted_at: string | null };
  const profileMap = new Map<string, ProfileRow>(
    (profiles ?? []).map((p: ProfileRow) => [p.id, p]),
  );

  const todayStr = isoToDate(new Date().toISOString());
  const sevenDaysAgoIso = daysAgo(7);
  const month = currentMonth();

  const totalUsers = users.length;
  const todaySignups = users.filter(u => u.created_at && isoToDate(u.created_at) === todayStr).length;
  const activeUsers = users.filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgoIso).length;
  const aiUserCount = users.filter(u => {
    const gen = u.user_metadata?.review_gen as { month?: string; count?: number } | undefined;
    return gen?.month === month && (gen.count ?? 0) > 0;
  }).length;

  // 일별 가입자 (최근 7일)
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[isoToDate(d.toISOString())] = 0;
  }
  for (const u of users) {
    if (!u.created_at) continue;
    const date = isoToDate(u.created_at);
    if (date in dailyMap) dailyMap[date]++;
  }

  // 전체 가입자 목록 — 최신 순 정렬 후 페이지네이션
  const sorted = [...users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const { page: pageParam, size: sizeParam } = await searchParams;
  const pageSize = PAGE_SIZES.includes(Number(sizeParam) as typeof PAGE_SIZES[number])
    ? Number(sizeParam)
    : DEFAULT_PAGE_SIZE;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const clampedPage = Math.min(page, Math.max(1, totalPages));
  const pageUsers = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="오늘 가입자" value={todaySignups} />
        <StatCard label="전체 가입자" value={totalUsers} />
        <StatCard label="7일 활성 사용자" value={activeUsers} />
        <StatCard label="AI 독후감 사용자" value={aiUserCount} sub="이번 달" />
      </div>

      {/* 최근 7일 일별 가입자 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-700">최근 7일 일별 가입자</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">날짜</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">가입자 수</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailyMap).map(([date, count]) => (
                <tr key={date} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 text-gray-700">{date}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 전체 가입자 목록 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-700">
            전체 가입자 목록
            <span className="ml-2 text-xs font-normal text-gray-400">{totalUsers}명</span>
          </h2>
          <PageSizeSelect sizes={PAGE_SIZES} current={pageSize} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">이메일</th>
                <th className="px-4 py-3 font-medium text-gray-500">가입일</th>
                <th className="px-4 py-3 font-medium text-gray-500">마지막 로그인</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">AI 독후감</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map(u => {
                const gen = u.user_metadata?.review_gen as { month?: string; count?: number } | undefined;
                const reviewCount = gen?.month === month ? (gen.count ?? 0) : 0;
                const profile = profileMap.get(u.id);
                const isDeleted = !!profile?.deleted_at;
                return (
                  <tr key={u.id} className={`border-b border-gray-50 last:border-0 ${isDeleted ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-700">
                      <span>{u.email ?? '—'}</span>
                      {isDeleted && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                          탈퇴
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.last_sign_in_at)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900">
                      {reviewCount > 0 ? reviewCount : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1">
            <PaginationLink page={clampedPage - 1} size={pageSize} disabled={clampedPage <= 1} label="‹ 이전" />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationLink key={p} page={p} size={pageSize} active={p === clampedPage} label={String(p)} />
            ))}
            <PaginationLink page={clampedPage + 1} size={pageSize} disabled={clampedPage >= totalPages} label="다음 ›" />
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function PaginationLink({
  page,
  size,
  label,
  active,
  disabled,
}: {
  page: number;
  size: number;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const base = 'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors';
  if (disabled) {
    return <span className={`${base} cursor-not-allowed text-gray-300`}>{label}</span>;
  }
  return (
    <Link
      href={`?page=${page}&size=${size}`}
      className={`${base} ${active ? 'bg-gray-900 font-medium text-white' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {label}
    </Link>
  );
}
