'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, ChevronRight, MoreHorizontal, LogOut } from 'lucide-react';
import { deleteBook } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { Book, BookStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { BookForm } from '@/components/BookForm';
import { Modal } from '@/components/Modal';

type BookListItem = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image' | 'rating'
>;

interface Props {
  books: BookListItem[];
  error: boolean;
}

function CoverPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = {
    sm: 'h-10 w-7',
    md: 'h-16 w-12',
    lg: 'h-24 w-16',
  }[size];
  return (
    <div className={`${cls} flex flex-shrink-0 items-center justify-center rounded-md bg-gray-100`}>
      <img src="/logo.svg" alt="" className="h-5 w-auto opacity-30" />
    </div>
  );
}

function CardMenu({
  onDelete,
  disabled,
}: {
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="absolute right-2 top-2 z-10">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        disabled={disabled}
        className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50 transition-colors"
        aria-label="더보기"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 min-w-[88px] overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            disabled={disabled}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

function ReadingCard({
  book,
  onDelete,
  deleting,
}: {
  book: BookListItem;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="relative rounded-2xl bg-white p-4 pt-10 shadow-sm">
      <CardMenu onDelete={onDelete} disabled={deleting} />
      <Link href={`/books/${book.id}`} className="flex items-center gap-4 hover:opacity-90 transition-opacity">
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
      </Link>
    </div>
  );
}

function FinishedCard({
  book,
  onDelete,
  deleting,
}: {
  book: BookListItem;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="relative rounded-2xl bg-white p-4 pt-10 shadow-sm">
      <CardMenu onDelete={onDelete} disabled={deleting} />
      <Link href={`/books/${book.id}`} className="flex items-center gap-4 hover:opacity-90 transition-opacity">
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
          {book.rating != null && (
            <p className="mt-1 text-sm text-yellow-400">
              {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
      </Link>
    </div>
  );
}

function ShelfItem({
  book,
  onDelete,
  deleting,
}: {
  book: BookListItem;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="relative rounded-xl bg-white px-3 pb-2.5 pt-8 shadow-sm">
      <CardMenu onDelete={onDelete} disabled={deleting} />
      <Link href={`/books/${book.id}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
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
      </Link>
    </div>
  );
}

export function BookHome({ books, error }: Props) {
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setNickname(data.user?.user_metadata?.nickname ?? '');
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"을 삭제할까요?`)) return;
    setDeleting(id);
    try {
      await deleteBook(id);
    } finally {
      setDeleting(null);
    }
  };

  const reading = books.filter(
    (b) => b.status === '책상위' || b.status === '가방안'
  );
  const finished = books.filter((b) => b.status === '완독완료');
  const shelf = books.filter((b) => b.status === '책장속');

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Ginkgo" className="h-9 w-auto" />
          <div>
            <h1 className="text-lg font-light tracking-widest text-gray-800">GINKGO</h1>
            {nickname && (
              <p className="text-xs text-gray-400">{nickname}의 서재</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="책 추가"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
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
              <ReadingCard
                key={book.id}
                book={book}
                deleting={deleting === book.id}
                onDelete={() => handleDelete(book.id, book.title)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-10 shadow-sm">
            <img src="/logo.svg" alt="" className="mb-2 h-8 w-auto opacity-20" />
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
          <div className="space-y-3">
            {finished.map((book) => (
              <FinishedCard
                key={book.id}
                book={book}
                deleting={deleting === book.id}
                onDelete={() => handleDelete(book.id, book.title)}
              />
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
              <ShelfItem
                key={book.id}
                book={book}
                deleting={deleting === book.id}
                onDelete={() => handleDelete(book.id, book.title)}
              />
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
