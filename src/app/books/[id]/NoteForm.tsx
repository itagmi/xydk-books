'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addNote } from '@/lib/actions';
import { StickyNote } from 'lucide-react';

const inputCls =
  'rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400';

export function NoteForm({
  bookId,
  onSuccess,
  inModal = false,
}: {
  bookId: string;
  onSuccess?: () => void;
  inModal?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState('');
  const [quote, setQuote] = useState('');
  const [reflection, setReflection] = useState('');
  const [pending, setPending] = useState(false);

  const canSubmit = quote.trim() || reflection.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    try {
      await addNote(
        bookId,
        Number(page) || 0,
        quote.trim(),
        reflection.trim()
      );
      setPage('');
      setQuote('');
      setReflection('');
      router.refresh();
      onSuccess?.();
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        inModal
          ? 'rounded-xl bg-yellow-50 p-4 border border-yellow-200'
          : 'mt-4 rounded-xl bg-yellow-50 p-4 border border-yellow-200'
      }
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-yellow-800">
        <StickyNote className="h-4 w-4" />
        포스트잇 메모 추가
      </div>
      <div className="space-y-3">
        <input
          type="number"
          placeholder="페이지"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className={`w-20 ${inputCls}`}
          min={1}
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-yellow-800">
            글귀
          </label>
          <textarea
            placeholder="책에서 인상 깊었던 문장"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            className={`w-full resize-y ${inputCls}`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-yellow-800">
            느낀점
          </label>
          <textarea
            placeholder="이 글귀를 읽고 든 생각"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={2}
            className={`w-full resize-y ${inputCls}`}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending || !canSubmit}
        className="mt-3 w-full rounded-lg bg-yellow-400 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-500 disabled:opacity-50 transition-colors"
      >
        {pending ? '저장 중...' : '메모 저장'}
      </button>
    </form>
  );
}
