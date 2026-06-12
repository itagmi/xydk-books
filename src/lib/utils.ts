import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<BookStatus, string> = {
  책장속: '책장 속',
  책상위: '책상 위',
  가방안: '가방 안',
  완독완료: '완독 완료',
};

export const STATUS_COLORS: Record<BookStatus, string> = {
  책장속: 'bg-gray-100 text-gray-600',
  책상위: 'bg-blue-100 text-blue-700',
  가방안: 'bg-green-100 text-green-700',
  완독완료: 'bg-purple-100 text-purple-700',
};

export const ALL_STATUSES: BookStatus[] = [
  '책장속',
  '책상위',
  '가방안',
  '완독완료',
];
