'use client';

import { useState } from 'react';
import { updateBookStatus } from '@/lib/actions';
import { BookStatus } from '@/lib/types';
import { ALL_STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  bookId: string;
  currentStatus: BookStatus;
}

export function StatusChanger({ bookId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);

  const handleChange = async (newStatus: BookStatus) => {
    if (newStatus === status) return;
    setPending(true);
    try {
      await updateBookStatus(bookId, newStatus);
      setStatus(newStatus);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-500">상태 변경</p>
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={pending}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-all disabled:opacity-50',
              s === status
                ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
