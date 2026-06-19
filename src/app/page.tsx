import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookHome } from '@/components/BookHome';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'itagmi88@gmail.com';

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: books, error }, { data: { user } }] = await Promise.all([
    supabase.from('books').select('id, title, author, category, status, cover_image, rating').order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ]);

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
