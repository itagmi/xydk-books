export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-sm space-y-2">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="h-7 w-10 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* 일별 가입자 테이블 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex justify-between">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-12 rounded bg-gray-200" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex justify-between border-b border-gray-50 px-4 py-3 last:border-0">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-6 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* 전체 가입자 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-8 w-24 rounded-lg bg-gray-200" />
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 rounded bg-gray-200" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-gray-50 px-4 py-3 grid grid-cols-4 gap-4 last:border-0">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-6 justify-self-end rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
