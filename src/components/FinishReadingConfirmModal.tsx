'use client';

import { Modal } from '@/components/Modal';

interface Props {
  open: boolean;
  bookTitle?: string;
  fromProgress?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
}

export function FinishReadingConfirmModal({
  open,
  bookTitle,
  fromProgress = false,
  onClose,
  onConfirm,
  pending = false,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="완독 완료">
      <p className="text-sm text-gray-600">
        {fromProgress ? (
          bookTitle ? (
            <>
              총 페이지까지 읽은 것 같아요.
              <br />
              <span className="font-medium text-gray-900">{bookTitle}</span>
              을(를) 완독 처리할까요?
            </>
          ) : (
            '총 페이지까지 읽은 것 같아요. 완독 처리할까요?'
          )
        ) : bookTitle ? (
          <>
            <span className="font-medium text-gray-900">{bookTitle}</span>
            을(를) 완독 처리할까요?
          </>
        ) : (
          '완독 완료로 바꿀까요?'
        )}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        완독 후에는 상태를 바꿀 수 없어요.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {pending ? '변경 중...' : '완독 완료'}
        </button>
      </div>
    </Modal>
  );
}
