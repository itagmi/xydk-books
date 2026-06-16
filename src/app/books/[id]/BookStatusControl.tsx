'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { updateBookStatus } from '@/lib/actions';
import { canFinishReading } from '@/lib/book-limits';
import { BookStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { FinishReadingConfirmModal } from '@/components/FinishReadingConfirmModal';
import { markFinishedReadingToast } from '@/components/FinishedReadingToast';
import { StatusChanger } from './StatusChanger';

interface Props {
  bookId: string;
  bookTitle: string;
  initialStatus: BookStatus;
  deskCount: number;
  bagCount: number;
}

export function BookStatusControl({
  bookId,
  bookTitle,
  initialStatus,
  deskCount,
  bagCount,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [finishConfirm, setFinishConfirm] = useState(false);
  const [finishPending, setFinishPending] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const confirmFinish = async () => {
    if (!canFinishReading(status) || finishPending) return;
    setFinishPending(true);
    try {
      await updateBookStatus(bookId, '완독완료');
      setStatus('완독완료');
      setFinishConfirm(false);
      markFinishedReadingToast();
      router.push(`/books/${bookId}?review=1`);
    } finally {
      setFinishPending(false);
    }
  };

  return (
    <>
      {status === '완독완료' ? (
        <StatusBadge status={status} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1.5 inline-flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-80"
          aria-label="상태 변경"
        >
          <StatusBadge status={status} />
          <Pencil className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}

      <Modal open={open && !finishConfirm} onClose={() => setOpen(false)} title="상태 변경">
        <StatusChanger
          bookId={bookId}
          currentStatus={status}
          deskCount={deskCount}
          bagCount={bagCount}
          onChange={(next) => {
            setStatus(next);
            if (next !== '완독완료') {
              setOpen(false);
            }
          }}
          onRequestFinish={() => {
            setOpen(false);
            setFinishConfirm(true);
          }}
        />
      </Modal>

      <FinishReadingConfirmModal
        open={finishConfirm}
        bookTitle={bookTitle}
        onClose={() => setFinishConfirm(false)}
        onConfirm={confirmFinish}
        pending={finishPending}
      />
    </>
  );
}
