import { ReactNode } from 'react';
import { BookStatus } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

type SceneStatus = Extract<BookStatus, '가방안' | '책상위' | '책장속'>;

const SCENE_CLASS: Record<SceneStatus, string> = {
  가방안: 'scene-bag',
  책상위: 'scene-desk',
  책장속: 'scene-shelf',
};

interface Props {
  status: SceneStatus;
  count?: number;
  limit?: number;
  detail?: string;
  children?: ReactNode;
  empty?: ReactNode;
  className?: string;
}

export function LocationScene({
  status,
  count,
  limit,
  detail,
  children,
  empty,
  className,
}: Props) {
  const label = STATUS_LABELS[status];
  const hasContent = empty == null;

  return (
    <section className={cn('mb-8', className)}>
      <h2 className="mb-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
        {count != null && count > 0 && (
          <span className="font-normal normal-case text-gray-300">
            {limit != null ? `${count}/${limit}권` : `${count}권`}
          </span>
        )}
        {detail && (
          <span className="w-full text-[11px] font-normal normal-case tracking-normal text-gray-300">
            {detail}
          </span>
        )}
      </h2>
      <div className={cn(SCENE_CLASS[status], 'scene-root')}>
        {hasContent ? children : empty}
      </div>
    </section>
  );
}
