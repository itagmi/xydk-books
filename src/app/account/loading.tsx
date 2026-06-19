export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6 animate-pulse">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-5 w-16 rounded bg-gray-200" />
        </div>

        <div className="space-y-4">
          {/* 프로필 */}
          <div className="rounded-2xl bg-white p-5 space-y-3">
            <div className="h-3 w-12 rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="flex justify-between py-1">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
              <div className="flex justify-between py-1">
                <div className="h-4 w-12 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* 독서 현황 */}
          <div className="rounded-2xl bg-white p-5 space-y-3">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="flex justify-between py-1">
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-200" />
            </div>
          </div>

          {/* AI 독후감 */}
          <div className="rounded-2xl bg-white p-5 space-y-3">
            <div className="h-3 w-16 rounded bg-gray-200" />
            <div className="flex justify-between py-1">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100" />
            <div className="h-3 w-40 rounded bg-gray-200" />
          </div>

          {/* 계정 */}
          <div className="rounded-2xl bg-white p-5 space-y-3">
            <div className="h-3 w-12 rounded bg-gray-200" />
            <div className="h-9 w-24 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
