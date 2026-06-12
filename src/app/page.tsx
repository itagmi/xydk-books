import { createClient } from '@/lib/supabase/server';
import { BookHome } from '@/components/BookHome';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, author, category, status, cover_image, rating')
    .order('created_at', { ascending: false });

  return (
    <BookHome
      books={books ?? []}
      error={!!error}
    />
  );
}
