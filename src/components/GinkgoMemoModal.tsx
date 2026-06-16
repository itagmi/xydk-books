'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { addNote } from '@/lib/actions';

interface BookInfo {
  id: string;
  title: string;
  author: string;
}

interface Props {
  book: BookInfo | null;
  onClose: () => void;
}

const inputCls =
  'rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2 text-sm text-amber-950 placeholder:text-amber-700/35 focus:outline-none focus:ring-2 focus:ring-amber-400/50';

export function GinkgoMemoModal({ book, onClose }: Props) {
  const router = useRouter();
  const reflectionRef = useRef<HTMLTextAreaElement>(null);
  const [page, setPage] = useState('');
  const [quote, setQuote] = useState('');
  const [reflection, setReflection] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!book) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    reflectionRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [book, onClose]);

  useEffect(() => {
    if (!book) {
      setPage('');
      setQuote('');
      setReflection('');
      setPending(false);
    }
  }, [book]);

  if (!book) return null;

  const canSubmit = quote.trim() || reflection.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || pending) return;
    setPending(true);
    try {
      await addNote(book.id, Number(page) || 0, quote.trim(), reflection.trim());
      setPage('');
      setQuote('');
      setReflection('');
      router.refresh();
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="닫기"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ginkgo-memo-title"
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] shadow-2xl"
        style={{
          background:
            'linear-gradient(165deg, #fffef7 0%, #fef9e8 55%, #fef3c7 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src="/logo.svg"
            alt=""
            className="absolute -right-6 top-1/2 h-52 w-auto -translate-y-1/2 rotate-[18deg] opacity-[0.28]"
          />
          <img
            src="/logo.svg"
            alt=""
            className="absolute -bottom-10 -left-8 h-40 w-auto -rotate-[28deg] scale-x-[-1] opacity-[0.2]"
          />
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p id="ginkgo-memo-title" className="truncate text-sm font-semibold text-amber-950">
                {book.title}
              </p>
              <p className="truncate text-xs text-amber-800/60">{book.author}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-amber-800/50 hover:bg-amber-900/5 hover:text-amber-900 transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="number"
              placeholder="페이지"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className={`w-20 ${inputCls}`}
              min={1}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-amber-900/70">글귀</label>
              <textarea
                placeholder="책에서 인상 깊었던 문장"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={2}
                className={`w-full resize-y ${inputCls}`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-amber-900/70">느낀점</label>
              <textarea
                ref={reflectionRef}
                placeholder="지금 든 생각을 적어보세요"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className={`w-full resize-y ${inputCls}`}
              />
            </div>
            <button
              type="submit"
              disabled={pending || !canSubmit}
              className="mt-3 w-full rounded-xl bg-[#E8A800] py-2.5 text-sm font-medium text-amber-950 hover:bg-[#d99a00] disabled:opacity-50 transition-colors shadow-sm"
            >
              {pending ? '저장 중...' : '메모 저장'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
