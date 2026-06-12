'use client';

import { useState } from 'react';
import { updateBookStatus } from '@/lib/actions';
import { BookStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Props {
  bookId: string;
  currentStatus: BookStatus;
}

type Step = 0 | 1 | 2;

function statusToStep(status: BookStatus): Step {
  if (status === '책장속') return 0;
  if (status === '책상위' || status === '가방안') return 1;
  return 2;
}

const STEP_LABELS = ['책장 속', '읽는 중', '완독 완료'];

export function StatusChanger({ bookId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);

  const step = statusToStep(status);

  const change = async (next: BookStatus) => {
    if (next === status || pending) return;
    setPending(true);
    try {
      await updateBookStatus(bookId, next);
      setStatus(next);
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
      <div className="flex items-center">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <button
              onClick={() => goToStep(i as Step)}
              disabled={pending}
              className="flex flex-col items-center gap-1 disabled:cursor-not-allowed"
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all',
                  i < step
                    ? 'border-gray-900 bg-gray-900'
                    : i === step
                    ? 'border-gray-900 bg-white'
                    : 'border-gray-200 bg-white'
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
                  'text-xs font-medium whitespace-nowrap',
                  i === step ? 'text-gray-900' : i < step ? 'text-gray-400' : 'text-gray-300'
                )}
              >
                {label}
              </span>
            </button>
            {i < 2 && (
              <div
                className={cn(
                  'mb-5 h-px flex-1 transition-colors',
                  i < step ? 'bg-gray-900' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
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
