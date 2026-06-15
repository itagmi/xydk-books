'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBookStatus } from '@/lib/actions';
import { BookStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Props {
  bookId: string;
  currentStatus: BookStatus;
  onChange?: (status: BookStatus) => void;
}

type Step = 0 | 1 | 2;

function statusToStep(status: BookStatus): Step {
  if (status === '책장속') return 0;
  if (status === '책상위' || status === '가방안') return 1;
  return 2;
}

const STEP_LABELS = ['책장 속', '읽는 중', '완독 완료'];

export function StatusChanger({ bookId, currentStatus, onChange }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const step = statusToStep(status);

  const change = async (next: BookStatus) => {
    if (next === status || pending) return;
    setPending(true);
    try {
      await updateBookStatus(bookId, next);
      setStatus(next);
      onChange?.(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const goToStep = (s: Step) => {
    if (s === 0) change('책장속');
    else if (s === 1) change(status === '가방안' ? '가방안' : '책상위');
    else change('완독완료');
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="mx-auto w-full max-w-xs px-1">
        <div className="relative flex justify-between">
          {/* 연결선 — 원 중심 높이에 배치 */}
          <div
            className="pointer-events-none absolute left-[14px] right-[14px] top-[14px] h-[2px] -translate-y-1/2 bg-gray-200"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-[14px] top-[14px] h-[2px] -translate-y-1/2 bg-gray-900 transition-all duration-300"
            style={{ width: `calc((100% - 28px) * ${step / 2})` }}
            aria-hidden
          />

          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => goToStep(i as Step)}
              disabled={pending}
              className="relative z-10 flex w-14 flex-col items-center gap-1.5 disabled:cursor-not-allowed"
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white transition-all',
                  i < step
                    ? 'border-gray-900 bg-gray-900'
                    : i === step
                      ? 'border-gray-900'
                      : 'border-gray-200'
                )}
              >
                {i < step ? (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                ) : (
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      i === step ? 'bg-gray-900' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-center text-xs font-medium leading-tight',
                  i === step ? 'text-gray-900' : i < step ? 'text-gray-500' : 'text-gray-300'
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-state toggle when reading */}
      {step === 1 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => change('책상위')}
            disabled={pending}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50',
              status === '책상위'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            📚 책상 위
          </button>
          <button
            onClick={() => change('가방안')}
            disabled={pending}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50',
              status === '가방안'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            🎒 가방 안
          </button>
        </div>
      )}

      {/* Main action button */}
      {step === 0 && (
        <button
          onClick={() => change('책상위')}
          disabled={pending}
          className="mt-4 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          읽기 시작 →
        </button>
      )}
      {step === 1 && (
        <button
          onClick={() => change('완독완료')}
          disabled={pending}
          className="mt-3 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          완독 완료 →
        </button>
      )}
    </div>
  );
}
