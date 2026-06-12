'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addNote } from '@/lib/actions';
import { StickyNote } from 'lucide-react';

export function NoteForm({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [page, setPage] = useState('');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPending(true);
    try {
      await addNote(bookId, Number(page) || 0, content.trim());
      setPage('');
      setContent('');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl bg-yellow-50 p-4 border border-yellow-200">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-yellow-800">
        <StickyNote className="h-4 w-4" />
        포스트잇 메모 추가
      </div>
      <div className="mb-2 flex gap-2">
        <input
          type="number"
          placeholder="페이지"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="w-20 rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          min={1}
        />
        <input
          type="text"
          placeholder="메모 내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />
      </div>
      <button
        type="submit"
        disabled={pending || !content.trim()}
        className="w-full rounded-lg bg-yellow-400 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-500 disabled:opacity-50 transition-colors"
      >
        {pending ? '저장 중...' : '메모 저장'}
      </button>
    </form>
  );
}
