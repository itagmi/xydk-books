'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function PageSizeSelect({ sizes, current }: { sizes: readonly number[]; current: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300"
    >
      {sizes.map(s => (
        <option key={s} value={s}>{s}개씩 보기</option>
      ))}
    </select>
  );
}
