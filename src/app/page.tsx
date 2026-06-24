import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookHome } from '@/components/BookHome';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'itagmi88@gmail.com';

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: booksRaw, error }, { data: { user } }] = await Promise.all([
    supabase.from('books').select('id, title, author, category, status, cover_image, rating, total_pages').order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const bookIds = booksRaw?.map((b) => b.id) ?? [];
  const { data: maxPages } = bookIds.length > 0
    ? await supabase.rpc('get_book_max_pages', { p_book_ids: bookIds })
    : { data: null };

  const maxPageMap = new Map<string, number>(
    (maxPages as { book_id: string; max_page: number }[] | null)?.map((r) => [r.book_id, r.max_page]) ?? []
  );

  const books = booksRaw?.map((b) => ({
    ...b,
    max_page: maxPageMap.get(b.id) ?? null,
  })) ?? [];

  // 탈퇴 처리된 계정의 잔존 세션 차단
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.deleted_at) {
      redirect('/api/signout?reason=deleted');
    }
  }

  return (
    <BookHome
      books={books ?? []}
      error={!!error}
      isAdmin={user?.email === ADMIN_EMAIL}
    />
  );
}
