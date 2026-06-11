'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BookStatus } from '@/lib/types';
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('status') as BookStatus | null;

  const setStatus = (status: BookStatus | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setStatus(null)}
        className={cn(
          'rounded-full px-3 py-1 text-sm font-medium transition-colors',
          current === null
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        )}
      >
        전체
      </button>
      {ALL_STATUSES.map((status) => (
        <button
          key={status}
          onClick={() => setStatus(status)}
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium transition-colors',
            current === status
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          )}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
