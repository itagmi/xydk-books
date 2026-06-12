'use client';

import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { BookStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { StatusChanger } from './StatusChanger';

interface Props {
  bookId: string;
  initialStatus: BookStatus;
}

export function BookStatusControl({ bookId, initialStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 inline-flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-80"
        aria-label="상태 변경"
      >
        <StatusBadge status={status} />
        <Pencil className="h-3.5 w-3.5 text-gray-400" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="상태 변경">
        <StatusChanger
          bookId={bookId}
          currentStatus={status}
          onChange={setStatus}
        />
      </Modal>
    </>
  );
}
