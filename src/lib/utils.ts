import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookStatus, Note } from './types';

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

/** 마이그레이션 전 content 컬럼용 구분자 */
export const LEGACY_NOTE_DELIMITER = '\n\n---\n\n';

export function parseLegacyContent(content: string): {
  quote: string;
  reflection: string;
} {
  const trimmed = content.trim();
  if (!trimmed) return { quote: '', reflection: '' };
  const idx = trimmed.indexOf(LEGACY_NOTE_DELIMITER);
  if (idx === -1) return { quote: '', reflection: trimmed };
  return {
    quote: trimmed.slice(0, idx).trim(),
    reflection: trimmed.slice(idx + LEGACY_NOTE_DELIMITER.length).trim(),
  };
}

export function noteQuote(note: Pick<Note, 'quote' | 'reflection' | 'content'>): string {
  const fromColumn = (note.quote ?? '').trim();
  if (fromColumn) return fromColumn;

  const parsed = parseLegacyContent(note.content ?? '');
  if (parsed.quote) return parsed.quote;

  return '';
}

export function noteReflection(note: Pick<Note, 'quote' | 'reflection' | 'content'>): string {
  const quoteFromColumn = (note.quote ?? '').trim();
  const reflectionFromColumn = (note.reflection ?? '').trim();
  const parsed = parseLegacyContent(note.content ?? '');

  // content에 구분자로 저장된 경우(legacy fallback) — 컬럼보다 우선
  if (parsed.quote && parsed.reflection) return parsed.reflection;

  // quote/reflection 컬럼으로 분리 저장된 경우
  if (quoteFromColumn || reflectionFromColumn) return reflectionFromColumn;

  return parsed.reflection;
}

/** 접힌 카드 한 줄 미리보기 */
export function notePreview(note: Note): string {
  const reflection = noteReflection(note);
  const quote = noteQuote(note);
  const text = reflection || quote;
  return text.replace(/\s+/g, ' ').trim() || '메모';
}

export function formatNoteForAI(note: Note): string {
  const parts: string[] = [];
  const quote = noteQuote(note);
  const reflection = noteReflection(note);
  if (quote) parts.push(`[글귀] ${quote}`);
  if (reflection) parts.push(`[느낀점] ${reflection}`);
  const body = parts.join('\n');
  return note.page > 0 ? `[p.${note.page}]\n${body}` : body;
}

/** 마이그레이션 전 content 컬럼용 */
export function toLegacyNoteContent(quote: string, reflection: string): string {
  if (quote && reflection) return `${quote}${LEGACY_NOTE_DELIMITER}${reflection}`;
  return quote || reflection;
}

export function isMissingQuoteColumnError(message: string): boolean {
  return message.includes("'quote'") && message.includes('schema cache');
}
