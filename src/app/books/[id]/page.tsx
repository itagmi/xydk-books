import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BookStatus, Note } from '@/lib/types';
import { NotesSection } from './NotesSection';
import { ReviewSection } from './ReviewSection';
import { BookStatusControl } from './BookStatusControl';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: book } = await supabase
    .from('books')
    .select('title, author, category, cover_image')
    .eq('id', id)
    .single();

  if (!book) {
    return { title: '책을 찾을 수 없음' };
  }

  const description = [book.author, book.category].filter(Boolean).join(' · ');

  return {
    title: book.title,
    description,
    openGraph: {
      title: book.title,
      description,
      type: 'article',
      images: book.cover_image
        ? [{ url: book.cover_image, alt: book.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: book }, { data: notes }, { count: deskCount }, { count: bagCount }] =
    await Promise.all([
      supabase.from('books').select('*').eq('id', id).single(),
      supabase
        .from('notes')
        .select('*')
        .eq('book_id', id)
        .order('page', { ascending: true }),
      supabase
        .from('books')
        .select('id', { count: 'exact', head: true })
        .eq('status', '책상위'),
      supabase
        .from('books')
        .select('id', { count: 'exact', head: true })
        .eq('status', '가방안'),
    ]);

  if (!book) notFound();

  const isReading = book.status === '책상위' || book.status === '가방안';
  const isFinished = book.status === '완독완료';

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
      <div className="mb-6 flex gap-4">
        <div className="flex-shrink-0">
          {book.cover_image ? (
            <Image
              src={book.cover_image}
              alt={book.title}
              width={80}
              height={112}
              className="h-28 w-20 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="flex h-28 w-20 items-center justify-center rounded-xl bg-gray-100">
              <BookOpen className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-lg font-bold leading-tight text-gray-900">
            {book.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{book.author}</p>
          {book.category && (
            <p className="mt-0.5 text-xs text-gray-400">{book.category}</p>
          )}
          <BookStatusControl
            bookId={book.id}
            initialStatus={book.status as BookStatus}
            deskCount={deskCount ?? 0}
            bagCount={bagCount ?? 0}
          />
          {book.rating != null && (
            <p className="mt-1.5 text-sm text-yellow-400">
              {'★'.repeat(book.rating)}
              {'☆'.repeat(5 - book.rating)}
            </p>
          )}
        </div>
      </div>

      {(isReading || isFinished) && (
        <NotesSection
          bookId={book.id}
          bookTitle={book.title}
          bookAuthor={book.author}
          notes={(notes ?? []) as Note[]}
        />
      )}

      {/* 완독: 독후감은 메모 아래 */}
      {isFinished && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
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
