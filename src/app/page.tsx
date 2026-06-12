import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { BookHome } from '@/components/BookHome';

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getUser();

  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, author, category, status, cover_image, rating')
    .order('created_at', { ascending: false });

  return (
    <BookHome
      books={books ?? []}
      canManage={!!user}
      error={!!error}
    />
  );
}
