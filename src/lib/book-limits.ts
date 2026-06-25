import type { SupabaseClient } from '@supabase/supabase-js';
import { BookStatus } from './types';
import { STATUS_LABELS } from './utils';

export const STATUS_LIMITS: Partial<Record<BookStatus, number>> = {
  가방안: 2,
  책상위: 3,
};

export function getStatusLimit(status: BookStatus): number | undefined {
  return STATUS_LIMITS[status];
}

export function statusLimitErrorMessage(status: BookStatus): string {
  if (status === '책상위') {
    return '책상 위가 가득 찼어요. 읽고 있는 책을 완독하면 새 책을 올릴 수 있어요.';
  }
  if (status === '가방안') {
    return '가방 안이 가득 찼어요. 책상에 옮기거나 완독하면 자리가 생겨요.';
  }
  const limit = STATUS_LIMITS[status];
  if (limit == null) return '상태를 변경할 수 없습니다.';
  return `${STATUS_LABELS[status]}에는 최대 ${limit}권까지 둘 수 있어요.`;
}

export function isStatusAtCapacity(
  status: BookStatus,
  count: number,
  currentStatus: BookStatus
): boolean {
  const limit = STATUS_LIMITS[status];
  if (limit == null) return false;
  if (currentStatus === status) return false;
  return count >= limit;
}

export function canFinishReading(status: BookStatus): boolean {
  return status === '책상위' || status === '가방안';
}

export function shouldSuggestFinishReading(
  totalPages: number | null | undefined,
  notePage: number,
  previousMaxPage: number | null | undefined,
  status: BookStatus | undefined
): boolean {
  if (!totalPages || totalPages <= 0 || !status) return false;
  if (!canFinishReading(status)) return false;
  const effectiveMax = Math.max(notePage, previousMaxPage ?? 0);
  return effectiveMax >= totalPages;
}

export function finishReadingErrorMessage(): string {
  return '읽기 전 책은 완독 처리할 수 없어요. 먼저 책상이나 가방으로 옮겨 주세요.';
}

export async function assertStatusCapacity(
  supabase: SupabaseClient,
  status: BookStatus,
  excludeBookId?: string
): Promise<void> {
  const limit = STATUS_LIMITS[status];
  if (limit == null) return;

  let query = supabase
    .from('books')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);

  if (excludeBookId) {
    query = query.neq('id', excludeBookId);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  if ((count ?? 0) >= limit) {
    throw new Error(statusLimitErrorMessage(status));
  }
}
