export type BookStatus = '책장속' | '책상위' | '가방안' | '완독완료';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  cover_image: string | null;
  rating: number | null;
  total_pages: number | null;
  started_at: string | null;
  finished_at: string | null;
  review: string | null;
  created_at: string;
}

export type NoteKind = '기록' | '독후감';

export interface Note {
  id: string;
  book_id: string;
  page: number;
  quote: string;
  reflection: string;
  note_kind: NoteKind;
  /** @deprecated legacy — quote/reflection 사용 */
  content?: string;
  created_at: string;
}
