'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteBook } from '@/lib/actions';
import { Book } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { BookForm } from '@/components/BookForm';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

export function BookAdminList({ books }: { books: Book[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"을 삭제할까요?`)) return;
    setDeleting(id);
    try {
      await deleteBook(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Add button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">
          전체 {books.length}권
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          책 추가
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">새 책 추가</h3>
            <button onClick={() => setAdding(false)}>
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <BookForm onDone={() => setAdding(false)} />
        </div>
      )}

      {/* Book list */}
      <div className="space-y-2">
        {books.map((book) => (
          <div key={book.id}>
            {editing === book.id ? (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">책 수정</h3>
                  <button onClick={() => setEditing(null)}>
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <BookForm book={book} onDone={() => setEditing(null)} />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={book.status} />
                    <Link
                      href={`/books/${book.id}`}
                      className="text-sm font-medium text-gray-900 hover:underline truncate"
                    >
                      {book.title}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {book.author}
                    {book.category ? ` · ${book.category}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(book.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    aria-label="수정"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deleting === book.id}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          등록된 책이 없습니다.
        </div>
      )}
    </div>
  );
}
