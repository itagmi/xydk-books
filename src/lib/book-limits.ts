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
