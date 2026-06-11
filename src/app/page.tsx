import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { BookStatus } from '@/lib/types';
import { BookHome } from '@/components/BookHome';

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const user = await getUser();

  let query = supabase
    .from('books')
    .select('id, title, author, category, status, cover_image')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status as BookStatus);
  }

  const { data: books, error } = await query;

  return (
    <BookHome
      books={books ?? []}
      canManage={!!user}
      error={!!error}
    />
  );
}
