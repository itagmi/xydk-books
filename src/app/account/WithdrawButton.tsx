'use client';

import { useState } from 'react';

export function WithdrawButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    setPending(true);
    setError('');
    const res = await fetch('/api/withdraw', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/login?withdrawn=1';
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? '오류가 발생했습니다. 다시 시도해주세요.');
      setPending(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-700">정말 탈퇴하시겠어요?</p>
          <ul className="text-xs text-red-500 space-y-0.5 list-disc pl-4">
            <li>책·메모 데이터는 삭제되지 않고 보존됩니다</li>
            <li>같은 이메일로 새로 가입할 수 있지만 이전 데이터와 연결되지 않습니다</li>
            <li>탈퇴 후 로그인할 수 없습니다</li>
          </ul>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={pending}
            className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="cursor-pointer text-sm text-gray-300 hover:text-red-400 transition-colors"
    >
      계정 탈퇴
    </button>
  );
}
