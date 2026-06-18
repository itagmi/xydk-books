import { createClient } from '@/lib/supabase/server';
import { BookHome } from '@/components/BookHome';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'itagmi88@gmail.com';

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: books, error }, { data: { user } }] = await Promise.all([
    supabase.from('books').select('id, title, author, category, status, cover_image, rating').order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ]);

  return (
    <BookHome
      books={books ?? []}
      error={!!error}
      isAdmin={user?.email === ADMIN_EMAIL}
    />
  );
}
