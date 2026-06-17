'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';
import { assertStatusCapacity, canFinishReading, finishReadingErrorMessage } from './book-limits';
import { BookStatus } from './types';
import { isMissingQuoteColumnError, toLegacyNoteContent } from './utils';

function revalidateBlog() {
  const url = process.env.BLOG_REVALIDATE_URL;
  const secret = process.env.BLOG_REVALIDATE_SECRET;
  if (!url || !secret) return;
  fetch(url, {
    method: 'POST',
    headers: { 'x-revalidate-secret': secret },
  }).catch(() => {});
}

export async function addNote(
  bookId: string,
  page: number,
  quote: string,
  reflection: string
) {
  const supabase = await createClient();
  let { error } = await supabase
    .from('notes')
    .insert({ book_id: bookId, page, quote, reflection, content: '' });

  if (error && isMissingQuoteColumnError(error.message)) {
    ({ error } = await supabase.from('notes').insert({
      book_id: bookId,
      page,
      content: toLegacyNoteContent(quote, reflection),
    }));
  }

  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
}

export async function updateNote(
  noteId: string,
  bookId: string,
  page: number,
  quote: string,
  reflection: string
) {
  const supabase = await createClient();
  let { error } = await supabase
    .from('notes')
    .update({ page, quote, reflection, content: '' })
    .eq('id', noteId);

  if (error && isMissingQuoteColumnError(error.message)) {
    ({ error } = await supabase
      .from('notes')
      .update({ page, content: toLegacyNoteContent(quote, reflection) })
      .eq('id', noteId));
  }

  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
}

export async function deleteNote(noteId: string, bookId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
}

export async function updateBookStatus(bookId: string, status: BookStatus) {
  const supabase = await createClient();
  if (status === '완독완료') {
    const { data: book, error: fetchError } = await supabase
      .from('books')
      .select('status')
      .eq('id', bookId)
      .single();
    if (fetchError) throw new Error(fetchError.message);
    if (!canFinishReading(book.status)) {
      throw new Error(finishReadingErrorMessage());
    }
  }
  if (status === '책상위' || status === '가방안') {
    await assertStatusCapacity(supabase, status, bookId);
  }
  const updates: Record<string, unknown> = { status };
  if (status === '책상위' || status === '가방안') {
    updates.started_at = new Date().toISOString().split('T')[0];
  }
  if (status === '완독완료') {
    updates.finished_at = new Date().toISOString().split('T')[0];
  }
  const { error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', bookId);
  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
  revalidatePath('/');
  revalidateBlog();
}

export async function saveReview(bookId: string, review: string, rating?: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('books')
    .update({ review, ...(rating !== undefined ? { rating } : {}) })
    .eq('id', bookId);
  if (error) throw new Error(error.message);
  revalidatePath(`/books/${bookId}`);
}

export async function createBook(data: {
  title: string;
  author: string;
  category: string;
  cover_image?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { error } = await supabase.from('books').insert({
    ...data,
    status: '책장속',
    user_id: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidateBlog();
}

export async function updateBook(
  bookId: string,
  data: {
    title?: string;
    author?: string;
    category?: string;
    status?: BookStatus;
    cover_image?: string;
    rating?: number;
  }
) {
  const supabase = await createClient();
  if (data.status === '책상위' || data.status === '가방안') {
    await assertStatusCapacity(supabase, data.status, bookId);
  }
  const { error } = await supabase.from('books').update(data).eq('id', bookId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath(`/books/${bookId}`);
  revalidateBlog();
}

export async function deleteBook(bookId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidateBlog();
}
