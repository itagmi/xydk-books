'use client';

import { useEffect, useRef, useState } from 'react';
import { saveReview } from '@/lib/actions';
import { Note } from '@/lib/types';
import { Pencil, Sparkles, Save } from 'lucide-react';

interface Props {
  bookId: string;
  bookTitle: string;
  author: string;
  category: string;
  notes: Note[];
  initialReview: string | null;
  initialRating: number | null;
  autoFocus?: boolean;
}

function StarRating({
  rating,
  onChange,
  readonly = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) =>
        readonly ? (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          >
            ★
          </span>
        ) : (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`text-lg transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          >
            ★
          </button>
        )
      )}
    </div>
  );
}

export function ReviewSection({
  bookId,
  bookTitle,
  author,
  category,
  notes,
  initialReview,
  initialRating,
  autoFocus = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [review, setReview] = useState(initialReview ?? '');
  const [rating, setRating] = useState(initialRating ?? 0);
  const [editing, setEditing] = useState(() => autoFocus || !initialReview?.trim());
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const section = document.getElementById('review');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => textareaRef.current?.focus(), 300);
  }, [autoFocus]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = window.setTimeout(() => setSaveSuccess(false), 3000);
    return () => window.clearTimeout(timer);
  }, [saveSuccess]);

  const generateReview = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, bookTitle, author, category, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '독후감 생성 중 오류가 발생했습니다.');
        if (data.remaining !== undefined) setRemaining(data.remaining);
        return;
      }
      if (data.review) setReview(data.review);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch {
      setError('독후감 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!review.trim()) return;
    setSaving(true);
    setError('');
    try {
      await saveReview(bookId, review, rating || undefined);
      setEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div id="review" className="relative mt-6 scroll-mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">독후감</h2>
        <div className="flex items-center gap-2">
          <StarRating
            rating={rating}
            onChange={setRating}
            readonly={!editing}
          />
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="독후감 수정"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <>
          <textarea
            ref={textareaRef}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={12}
            placeholder="독후감을 작성하거나 AI 초안을 다듬어 보세요..."
            className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
          />

          {notes.length === 0 && (
            <p className="mt-3 text-center text-xs text-gray-400">
              메모가 있어야 AI 독후감을 생성할 수 있습니다.
            </p>
          )}

          {error && (
            <p className="mt-3 text-center text-xs text-red-500">{error}</p>
          )}

          <button
            type="button"
            onClick={generateReview}
            disabled={generating || notes.length === 0 || remaining === 0}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-100 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {generating
              ? 'AI 독후감 생성 중...'
              : remaining === 0
                ? '이번 달 생성 한도 초과'
                : remaining !== null
                  ? `AI로 독후감 초안 생성 (이번 달 ${remaining}회 남음)`
                  : 'AI로 독후감 초안 생성'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !review.trim()}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </button>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
          {review.trim() || (
            <span className="text-gray-400">저장된 독후감이 없습니다.</span>
          )}
        </div>
      )}

      {saveSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          저장이 완료되었습니다.
        </div>
      )}
    </div>
  );
}
