'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { BookEditModal } from '@/components/BookEditModal';
import type { Book } from '@/lib/types';

type EditableBook = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image' | 'total_pages'
>;

export function BookInfoEdit({ book }: { book: EditableBook }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Pencil className="h-3 w-3" />
        책 정보 수정
      </button>
      <BookEditModal book={open ? book : null} onClose={close} />
    </>
  );
}
