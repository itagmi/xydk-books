'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Modal } from '@/components/Modal';

export type DailySignupUser = {
  id: string;
  email: string | null;
  nickname: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  reviewCount: number;
  isDeleted: boolean;
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

export function DailySignupsModal({
  date,
  users,
  closeHref,
}: {
  date: string;
  users: DailySignupUser[];
  closeHref: string;
}) {
  const router = useRouter();
  const onClose = useCallback(() => router.push(closeHref), [router, closeHref]);

  return (
    <Modal
      open
      onClose={onClose}
      panelClassName="max-w-3xl"
      title={
        <>
          {date} 가입자
          <span className="ml-2 text-sm font-normal text-gray-400">{users.length}명</span>
        </>
      }
    >
      {users.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          해당 날짜에 가입한 사용자가 없습니다.
        </p>
      ) : (
        <div className="max-h-[60vh] overflow-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">이메일</th>
                <th className="px-4 py-3 font-medium text-gray-500">닉네임</th>
                <th className="px-4 py-3 font-medium text-gray-500">가입일</th>
                <th className="px-4 py-3 font-medium text-gray-500">마지막 로그인</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">AI 독후감</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-50 last:border-0 ${u.isDeleted ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-700">
                    <span>{u.email ?? '—'}</span>
                    {u.isDeleted && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        탈퇴
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.nickname ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.lastSignInAt)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">
                    {u.reviewCount > 0 ? u.reviewCount : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
