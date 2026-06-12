'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteNote } from '@/lib/actions';
import { Note } from '@/lib/types';
import { Trash2 } from 'lucide-react';

export function NoteItem({ note }: { note: Note }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('이 메모를 삭제할까요?')) return;
    setDeleting(true);
    await deleteNote(note.id, note.book_id);
    router.refresh();
  };

  return (
    <div className="flex gap-3 rounded-lg bg-yellow-50 border border-yellow-100 p-3">
      {note.page > 0 && (
        <span className="flex-shrink-0 text-xs font-mono text-yellow-700 pt-0.5">
          p.{note.page}
        </span>
      )}
      <p className="flex-1 text-sm text-gray-700 leading-relaxed">{note.content}</p>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
        aria-label="메모 삭제"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
