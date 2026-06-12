'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Plus, ChevronRight } from 'lucide-react';
import { Book, BookStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { BookForm } from '@/components/BookForm';
import { Modal } from '@/components/Modal';

type BookListItem = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image' | 'rating'
>;

interface Props {
  books: BookListItem[];
  canManage: boolean;
  error: boolean;
}

function CoverPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = {
    sm: 'h-10 w-7',
    md: 'h-16 w-12',
    lg: 'h-24 w-16',
  }[size];
  const iconCls = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }[size];
  return (
    <div className={`${cls} flex flex-shrink-0 items-center justify-center rounded-md bg-gray-100`}>
      <BookOpen className={`${iconCls} text-gray-300`} />
    </div>
  );
}

function ReadingCard({ book }: { book: BookListItem }) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex-shrink-0">
          {book.cover_image ? (
            <Image
              src={book.cover_image}
              alt={book.title}
              width={64}
              height={88}
              className="h-22 w-16 rounded-lg object-cover shadow"
            />
          ) : (
            <CoverPlaceholder size="lg" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5">
            <StatusBadge status={book.status as BookStatus} />
          </div>
          <p className="font-semibold leading-snug text-gray-900">{book.title}</p>
          <p className="mt-0.5 text-sm text-gray-500">{book.author}</p>
          {book.category && (
            <p className="mt-0.5 text-xs text-gray-400">{book.category}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
      </div>
    </Link>
  );
}

function FinishedCard({ book }: { book: BookListItem }) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex-shrink-0">
          {book.cover_image ? (
            <Image
              src={book.cover_image}
              alt={book.title}
              width={40}
              height={56}
              className="h-14 w-10 rounded object-cover shadow"
            />
          ) : (
            <CoverPlaceholder size="md" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{book.title}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">{book.author}</p>
          {book.rating != null && (
            <p className="mt-0.5 text-xs text-yellow-400">
              {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ShelfItem({ book }: { book: BookListItem }) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex-shrink-0">
          {book.cover_image ? (
            <Image
              src={book.cover_image}
              alt={book.title}
              width={28}
              height={40}
              className="h-10 w-7 rounded object-cover"
            />
          ) : (
            <CoverPlaceholder size="sm" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">{book.title}</p>
          <p className="truncate text-xs text-gray-400">{book.author}</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-200" />
      </div>
    </Link>
  );
}

export function BookHome({ books, canManage, error }: Props) {
  const [adding, setAdding] = useState(false);

  const reading = books.filter(
    (b) => b.status === '책상위' || b.status === '가방안'
  );
  const finished = books.filter((b) => b.status === '완독완료');
  const shelf = books.filter((b) => b.status === '책장속');

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-900">책 기록</h1>
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

      {error && (
        <p className="mb-4 text-sm text-red-500">데이터를 불러오지 못했습니다.</p>
      )}

      {/* 지금 읽는 중 */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          지금 읽는 중
        </h2>
        {reading.length > 0 ? (
          <div className="space-y-3">
            {reading.map((book) => (
              <ReadingCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-10 shadow-sm">
            <BookOpen className="mb-2 h-8 w-8 text-gray-200" />
            <p className="text-sm text-gray-400">읽고 있는 책이 없어요</p>
          </div>
        )}
      </section>

      {/* 완독 */}
      {finished.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            완독 <span className="ml-1 font-normal normal-case text-gray-300">{finished.length}권</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {finished.map((book) => (
              <FinishedCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* 책장 속 */}
      {shelf.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            책장 속 <span className="ml-1 font-normal normal-case text-gray-300">{shelf.length}권</span>
          </h2>
          <div className="space-y-1.5">
            {shelf.map((book) => (
              <ShelfItem key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {books.length === 0 && !error && (
        <p className="mt-12 text-center text-sm text-gray-400">
          아직 등록된 책이 없습니다.
        </p>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="새 책 추가">
        <BookForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
