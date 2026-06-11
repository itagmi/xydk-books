import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookStatus, Note } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { NoteForm } from './NoteForm';
import { NoteItem } from './NoteItem';
import { ReviewSection } from './ReviewSection';
import { StatusChanger } from './StatusChanger';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: book }, { data: notes }] = await Promise.all([
    supabase.from('books').select('*').eq('id', id).single(),
    supabase
      .from('notes')
      .select('*')
      .eq('book_id', id)
      .order('page', { ascending: true }),
  ]);

  if (!book) notFound();

  const isReading =
    book.status === '책상위' || book.status === '가방안';
  const isFinished =
    book.status === '기록중' || book.status === '완독완료';

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
      </div>

      {/* Book header */}
      <div className="mb-6 flex gap-5">
        <div className="flex-shrink-0">
          {book.cover_image ? (
            <Image
              src={book.cover_image}
              alt={book.title}
              width={80}
              height={112}
              className="h-28 w-20 rounded-lg object-cover shadow-md"
            />
          ) : (
            <div className="flex h-28 w-20 items-center justify-center rounded-lg bg-gray-100">
              <BookOpen className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1">
            <StatusBadge status={book.status as BookStatus} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {book.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{book.author}</p>
          {book.category && (
            <p className="mt-0.5 text-xs text-gray-400">{book.category}</p>
          )}
          {book.rating && (
            <p className="mt-1 text-yellow-400">
              {'★'.repeat(book.rating)}
              {'☆'.repeat(5 - book.rating)}
            </p>
          )}
        </div>
      </div>

      {/* Status changer */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <StatusChanger
          bookId={book.id}
          currentStatus={book.status as BookStatus}
        />
      </div>

      {/* Notes section */}
      {(isReading || isFinished) && (
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">
            메모{' '}
            <span className="text-sm font-normal text-gray-400">
              ({notes?.length ?? 0}개)
            </span>
          </h2>
          <div className="space-y-2">
            {notes?.map((note) => (
              <NoteItem key={note.id} note={note as Note} />
            ))}
          </div>
          <NoteForm bookId={book.id} />
        </div>
      )}

      {/* Review section */}
      {isFinished && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <ReviewSection
            bookId={book.id}
            bookTitle={book.title}
            author={book.author}
            category={book.category}
            notes={(notes ?? []) as Note[]}
            initialReview={book.review}
            initialRating={book.rating}
          />
        </div>
      )}
    </div>
  );
}
