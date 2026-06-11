import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Book } from '@/lib/types';
import { BookAdminList } from './BookAdminList';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: '관리 | 책 읽기' };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

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

      <h1 className="mb-6 text-xl font-bold text-gray-900">책 관리</h1>

      <BookAdminList books={(books ?? []) as Book[]} />
    </div>
  );
}
