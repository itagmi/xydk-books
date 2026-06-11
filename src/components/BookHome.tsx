'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Book } from '@/lib/types';
import { StatusFilter } from '@/components/StatusFilter';
import { BookForm } from '@/components/BookForm';
import { BookList } from '@/components/BookList';
import { Modal } from '@/components/Modal';

type BookListItem = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image'
>;

interface Props {
  books: BookListItem[];
  canManage: boolean;
  error: boolean;
}

export function BookHome({ books, canManage, error }: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">책 기록</h1>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="책 추가"
        >
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <Suspense fallback={null}>
        <div className="mb-4">
          <StatusFilter />
        </div>
      </Suspense>

      {error && (
        <p className="text-sm text-red-500">데이터를 불러오지 못했습니다.</p>
      )}

      <BookList books={books} canManage={canManage} />

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="새 책 추가"
      >
        <BookForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
