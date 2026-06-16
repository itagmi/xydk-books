'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Note } from '@/lib/types';
import { GinkgoMemoModal } from '@/components/GinkgoMemoModal';
import { NoteItem } from './NoteItem';

interface Props {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  notes: Note[];
}

export function NotesSection({ bookId, bookTitle, bookAuthor, notes }: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            메모{' '}
            <span className="text-sm font-normal text-gray-400">
              {notes.length}개
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="메모 추가"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            + 버튼으로 메모를 추가해 보세요.
          </p>
        )}
      </div>

      <GinkgoMemoModal
        book={adding ? { id: bookId, title: bookTitle, author: bookAuthor } : null}
        onClose={() => setAdding(false)}
      />
    </>
  );
}
