export default function BookDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* 뒤로가기 */}
      <div className="mb-6 h-5 w-20 rounded bg-gray-200" />

      {/* 책 헤더 */}
      <div className="mb-6 flex gap-4">
        <div className="h-28 w-20 flex-shrink-0 rounded-xl bg-gray-200" />
        <div className="flex-1 pt-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-1/4 rounded bg-gray-200" />
          <div className="mt-2 h-8 w-32 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* 메모 목록 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
        <div className="h-5 w-24 rounded bg-gray-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
