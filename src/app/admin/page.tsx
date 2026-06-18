import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'itagmi88@gmail.com';

function isoToDate(iso: string) {
  return iso.slice(0, 10);
}

function today() {
  return isoToDate(new Date().toISOString());
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

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const admin = createAdminClient();

  // 모든 유저 가져오기 (최대 1000명)
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const users = usersData?.users ?? [];

  const todayStr = today();
  const sevenDaysAgoIso = daysAgo(7);
  const month = currentMonth();

  const totalUsers = users.length;
  const todaySignups = users.filter(u => u.created_at && isoToDate(u.created_at) === todayStr).length;
  const activeUsers = users.filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgoIso).length;

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

  // 사용자별 AI 독후감 생성 횟수 (이번 달)
  type ReviewRow = { email: string; count: number };
  const reviewRows: ReviewRow[] = users
    .map(u => {
      const gen = u.user_metadata?.review_gen as { month?: string; count?: number } | undefined;
      const count = gen?.month === month ? (gen.count ?? 0) : 0;
      return { email: u.email ?? u.id, count };
    })
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="오늘 가입자" value={todaySignups} />
        <StatCard label="전체 가입자" value={totalUsers} />
        <StatCard label="7일 활성 사용자" value={activeUsers} />
        <StatCard label="AI 독후감 사용자" value={reviewRows.length} sub={`이번 달`} />
      </div>

      {/* 최근 7일 가입자 */}
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

      {/* AI 독후감 생성 현황 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          AI 독후감 생성 현황 <span className="text-xs font-normal text-gray-400">({month} 기준)</span>
        </h2>
        {reviewRows.length === 0 ? (
          <p className="text-sm text-gray-400">이번 달 생성 기록이 없습니다.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">이메일</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">생성 횟수</th>
                </tr>
              </thead>
              <tbody>
                {reviewRows.map(row => (
                  <tr key={row.email} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-gray-700">{row.email}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
