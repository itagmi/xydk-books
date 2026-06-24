'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteBook } from '@/lib/actions';
import { Book } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { BookForm } from '@/components/BookForm';
import { BookOpen, Pencil, Trash2, X } from 'lucide-react';

type BookListItem = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image' | 'total_pages'
>;

interface Props {
  books: BookListItem[];
  canManage: boolean;
}

export function BookList({ books, canManage }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
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

  if (books.length === 0) {
    return (
      <p className="mt-12 text-center text-sm text-gray-400">
        아직 등록된 책이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {books.map((book) => (
        <li key={book.id}>
          {editing === book.id ? (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">책 수정</h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="닫기"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <BookForm book={book} onDone={() => setEditing(null)} />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-white p-4 shadow-sm">
              <Link
                href={`/books/${book.id}`}
                className="flex min-w-0 flex-1 items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="flex-shrink-0">
                  {book.cover_image ? (
                    <Image
                      src={book.cover_image}
                      alt={book.title}
                      width={48}
                      height={64}
                      className="h-16 w-12 rounded object-cover shadow"
                    />
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded bg-gray-100">
                      <BookOpen className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {book.title}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {book.author}
                  </p>
                </div>
              </Link>
              <StatusBadge status={book.status} />
              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(book.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    aria-label="수정"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deleting === book.id}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
