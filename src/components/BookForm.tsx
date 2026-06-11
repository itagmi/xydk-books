'use client';

import { useState } from 'react';
import { createBook, updateBook } from '@/lib/actions';
import { Book, BookStatus } from '@/lib/types';
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/utils';

interface Props {
  book?: Pick<Book, 'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image'>;
  onDone: () => void;
}

export function BookForm({ book, onDone }: Props) {
  const [form, setForm] = useState({
    title: book?.title ?? '',
    author: book?.author ?? '',
    category: book?.category ?? '',
    status: (book?.status ?? '책장속') as BookStatus,
    cover_image: book?.cover_image ?? '',
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError('제목과 저자는 필수입니다.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const data = {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        status: form.status,
        ...(form.cover_image.trim() ? { cover_image: form.cover_image.trim() } : {}),
      };
      if (book) {
        await updateBook(book.id, data);
      } else {
        await createBook(data);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setPending(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          제목 *
        </label>
        <input
          className={inputCls}
          value={form.title}
          onChange={set('title')}
          placeholder="책 제목"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          저자 *
        </label>
        <input
          className={inputCls}
          value={form.author}
          onChange={set('author')}
          placeholder="저자명"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          카테고리
        </label>
        <input
          className={inputCls}
          value={form.category}
          onChange={set('category')}
          placeholder="소설, 에세이, 자기계발 등"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          상태
        </label>
        <select
          className={inputCls}
          value={form.status}
          onChange={set('status')}
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          표지 이미지 URL
        </label>
        <input
          className={inputCls}
          value={form.cover_image}
          onChange={set('cover_image')}
          placeholder="https://..."
          type="url"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {pending ? '저장 중...' : book ? '수정' : '추가'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
