'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './supabase/server';
import { BookStatus } from './types';

export async function addNote(bookId: string, page: number, content: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notes')
    .insert({ book_id: bookId, page, content });
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
  status: BookStatus;
  cover_image?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  const { error } = await supabase.from('books').insert({ ...data, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin');
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
  const { error } = await supabase.from('books').update(data).eq('id', bookId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath(`/books/${bookId}`);
  revalidatePath('/admin');
}

export async function deleteBook(bookId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin');
}
