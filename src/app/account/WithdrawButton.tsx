'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';

export function WithdrawButton() {
  const [showModal, setShowModal] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleWithdraw = async () => {
    setPending(true);
    setError('');
    const res = await fetch('/api/withdraw', { method: 'POST' });
    if (res.ok) {
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? '오류가 발생했습니다. 다시 시도해주세요.');
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(''); setShowModal(true); }}
        className="cursor-pointer text-sm text-gray-300 hover:text-red-400 transition-colors"
      >
        계정 탈퇴
      </button>

      <Modal open={showModal} onClose={() => !pending && setShowModal(false)} title="계정 탈퇴">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            탈퇴하면 계정과 모든 책·메모 데이터가 삭제됩니다.<br />
            이 작업은 되돌릴 수 없습니다.
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={pending}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={pending}
              className="flex-1 cursor-pointer rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {pending ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-lg text-center"
        >
          탈퇴가 완료됐습니다.<br />로그인 화면으로 이동합니다.
        </div>
      )}
    </>
  );
}
