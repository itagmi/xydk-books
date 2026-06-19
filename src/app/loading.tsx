export default function HomeLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 rounded bg-gray-200" />
        <div className="h-8 w-8 rounded-full bg-gray-200" />
      </div>

      {/* 책상위 섹션 */}
      <div className="space-y-3">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>

      {/* 가방안 섹션 */}
      <div className="space-y-3">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-28 rounded-2xl bg-gray-200" />
      </div>

      {/* 책장 섹션 */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-gray-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="h-16 w-12 rounded-md bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
