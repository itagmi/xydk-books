import { BookStatus } from '@/lib/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  status: BookStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
