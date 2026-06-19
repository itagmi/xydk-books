'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteNote, updateNote } from '@/lib/actions';
import { Note, NoteKind } from '@/lib/types';
import { cn, notePreview, noteQuote, noteReflection } from '@/lib/utils';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';

const inputCls =
  'rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400';

function NoteBody({ note }: { note: Note }) {
  const quote = noteQuote(note);
  const reflection = noteReflection(note);

  return (
    <div className="min-w-0 space-y-2">
      {quote && (
        <blockquote className="border-l-2 border-yellow-400 bg-white/60 px-3 py-2 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap wrap-break-word">
          {quote}
        </blockquote>
      )}
      {reflection && (
        <div>
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-yellow-700/70">
            느낀점
          </p>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap wrap-break-word">
            {reflection}
          </p>
        </div>
      )}
    </div>
  );
}

export function NoteItem({ note }: { note: Note }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(String(note.page || ''));
  const [noteKind, setNoteKind] = useState<NoteKind>(note.note_kind ?? '기록');
  const [quote, setQuote] = useState(noteQuote(note));
  const [reflection, setReflection] = useState(noteReflection(note));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const canSave = quote.trim() || reflection.trim();
  const preview = notePreview(note);

  const handleEdit = () => {
    setPage(String(note.page || ''));
    setNoteKind(note.note_kind ?? '기록');
    setQuote(noteQuote(note));
    setReflection(noteReflection(note));
    setSaveError('');
    setExpanded(true);
    setEditing(true);
  };

  const handleCancel = () => {
    setPage(String(note.page || ''));
    setNoteKind(note.note_kind ?? '기록');
    setQuote(noteQuote(note));
    setReflection(noteReflection(note));
    setEditing(false);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError('');
    try {
      await updateNote(
        note.id,
        note.book_id,
        Number(page) || 0,
        quote.trim(),
        reflection.trim(),
        noteKind
      );
      setEditing(false);
      router.refresh();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : '메모 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 메모를 삭제할까요?')) return;
    setDeleting(true);
    await deleteNote(note.id, note.book_id);
    router.refresh();
  };

  if (editing) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="페이지"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className={`w-20 ${inputCls}`}
            min={1}
          />
          <div className="flex rounded-lg border border-yellow-300 bg-white p-0.5 text-xs font-medium">
            {(['기록', '독후감'] as NoteKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setNoteKind(kind)}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  noteKind === kind
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'text-yellow-700/60 hover:text-yellow-800'
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-yellow-800">글귀</label>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            className={`w-full resize-y ${inputCls}`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-yellow-800">느낀점</label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={2}
            className={`w-full resize-y ${inputCls}`}
          />
        </div>
        {saveError && <p className="text-xs text-red-500">{saveError}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex-1 rounded-lg bg-yellow-400 py-1.5 text-xs font-medium text-yellow-900 hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 rounded-lg border border-yellow-300 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-100 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-yellow-50 border border-yellow-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 p-3 text-left hover:bg-yellow-100/50 transition-colors"
        aria-expanded={expanded}
      >
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
          note.note_kind === '독후감'
            ? 'bg-amber-200/70 text-amber-800'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {note.note_kind ?? '기록'}
        </span>
        {note.page > 0 ? (
          <span className="shrink-0 rounded bg-yellow-200/60 px-1.5 py-0.5 text-xs font-mono text-yellow-800">
            p.{note.page}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
          {preview}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-yellow-100 px-3 pb-3 pt-2">
          <div className="mb-2 flex justify-end gap-1">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded p-1 text-gray-300 hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
              aria-label="메모 수정"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded p-1 text-gray-300 hover:bg-yellow-100 hover:text-red-400 disabled:opacity-50 transition-colors"
              aria-label="메모 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <NoteBody note={note} />
        </div>
      )}
    </div>
  );
}
