'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBookStatus } from '@/lib/actions';
import { isStatusAtCapacity, statusLimitErrorMessage } from '@/lib/book-limits';
import { BookStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Props {
  bookId: string;
  currentStatus: BookStatus;
  deskCount: number;
  bagCount: number;
  onChange?: (status: BookStatus) => void;
}

type Step = 0 | 1 | 2;

function statusToStep(status: BookStatus): Step {
  if (status === '책장속') return 0;
  if (status === '책상위' || status === '가방안') return 1;
  return 2;
}

const STEP_LABELS = ['책장 속', '읽는 중', '완독 완료'];

export function StatusChanger({
  bookId,
  currentStatus,
  deskCount,
  bagCount,
  onChange,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const step = statusToStep(status);
  const deskFull = isStatusAtCapacity('책상위', deskCount, status);
  const bagFull = isStatusAtCapacity('가방안', bagCount, status);

  const change = async (next: BookStatus) => {
    if (next === status || pending) return;
    if (isStatusAtCapacity(next, next === '책상위' ? deskCount : bagCount, status)) {
      setError(statusLimitErrorMessage(next));
      return;
    }
    setPending(true);
    setError('');
    try {
      await updateBookStatus(bookId, next);
      setStatus(next);
      onChange?.(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    } finally {
      setPending(false);
    }
  };

  const goToStep = (s: Step) => {
    if (s === 0) {
      change('책장속');
      return;
    }
    if (s === 2) {
      change('완독완료');
      return;
    }
    if (status === '책상위' || status === '가방안') return;
    if (!deskFull) change('책상위');
    else if (!bagFull) change('가방안');
    else setError('책상과 가방이 모두 가득 찼어요.');
  };

  return (
    <div>
      <div className="mx-auto w-full max-w-xs px-1">
        <div className="relative flex justify-between">
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
              disabled={pending || (i === 1 && step !== 1 && deskFull && bagFull)}
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

      {step === 1 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => change('책상위')}
            disabled={pending || (deskFull && status !== '책상위') || status === '책상위'}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              status === '책상위'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            📚 책상 위
            <span className="mt-0.5 block text-[10px] font-normal opacity-70">
              {deskCount}/3
            </span>
          </button>
          <button
            onClick={() => change('가방안')}
            disabled={pending || (bagFull && status !== '가방안') || status === '가방안'}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              status === '가방안'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            🎒 가방 안
            <span className="mt-0.5 block text-[10px] font-normal opacity-70">
              {bagCount}/2
            </span>
          </button>
        </div>
      )}

      {step === 0 && (
        <button
          onClick={() => change('책상위')}
          disabled={pending || deskFull}
          className="mt-4 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {deskFull ? '책상이 가득 찼어요 (3/3)' : '읽기 시작 →'}
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

      {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}
