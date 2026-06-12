'use client';

import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { Note } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { NoteForm } from './NoteForm';
import { NoteItem } from './NoteItem';

interface Props {
  bookId: string;
  notes: Note[];
  variant: 'inline' | 'modal';
}

function NotesContent({ bookId, notes }: { bookId: string; notes: Note[] }) {
  return (
    <>
      <div className="space-y-2">
        {notes.length > 0 ? (
          notes.map((note) => <NoteItem key={note.id} note={note} />)
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            아직 메모가 없습니다.
          </p>
        )}
      </div>
      <NoteForm bookId={bookId} />
    </>
  );
}

export function NotesSection({ bookId, notes, variant }: Props) {
  const [open, setOpen] = useState(false);

  if (variant === 'modal') {
    return (
      <>
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              메모{' '}
              <span className="text-sm font-normal text-gray-400">
                {notes.length}개
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
              aria-label="메모 보기"
            >
              <StickyNote className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={`메모 ${notes.length}개`}
        >
          <NotesContent bookId={bookId} notes={notes} />
        </Modal>
      </>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-semibold text-gray-900">
        메모{' '}
        <span className="text-sm font-normal text-gray-400">
          {notes.length}개
        </span>
      </h2>
      <NotesContent bookId={bookId} notes={notes} />
    </div>
  );
}
