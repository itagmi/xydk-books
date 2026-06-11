'use client';

import { useState } from 'react';
import { saveReview } from '@/lib/actions';
import { Note } from '@/lib/types';
import { Sparkles, Save } from 'lucide-react';

interface Props {
  bookId: string;
  bookTitle: string;
  author: string;
  category: string;
  notes: Note[];
  initialReview: string | null;
  initialRating: number | null;
}

export function ReviewSection({
  bookId,
  bookTitle,
  author,
  category,
  notes,
  initialReview,
  initialRating,
}: Props) {
  const [review, setReview] = useState(initialReview ?? '');
  const [rating, setRating] = useState(initialRating ?? 0);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateReview = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, bookTitle, author, category, notes }),
      });
      const data = await res.json();
      if (data.review) setReview(data.review);
    } catch (err) {
      alert('독후감 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveReview(bookId, review, rating || undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">독후감</h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-lg transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generateReview}
        disabled={generating || notes.length === 0}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-100 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        {generating ? 'AI 독후감 생성 중...' : 'AI로 독후감 초안 생성'}
      </button>

      {notes.length === 0 && (
        <p className="mb-3 text-center text-xs text-gray-400">
          메모가 있어야 AI 독후감을 생성할 수 있습니다.
        </p>
      )}

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={12}
        placeholder="독후감을 작성하거나 AI 초안을 다듬어 보세요..."
        className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
      />

      <button
        onClick={handleSave}
        disabled={saving || !review.trim()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        <Save className="h-4 w-4" />
        {saving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
}
