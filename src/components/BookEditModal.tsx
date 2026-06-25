'use client';

import { BookForm } from '@/components/BookForm';
import { Modal } from '@/components/Modal';
import type { Book } from '@/lib/types';

type EditableBook = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image' | 'total_pages'
>;

interface Props {
  book: EditableBook | null;
  onClose: () => void;
}

export function BookEditModal({ book, onClose }: Props) {
  return (
    <Modal open={book != null} onClose={onClose} title="책 정보 수정">
      {book ? <BookForm book={book} onDone={onClose} /> : null}
    </Modal>
  );
}
