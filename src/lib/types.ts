export type BookStatus = '책장속' | '책상위' | '가방안' | '완독완료';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  cover_image: string | null;
  rating: number | null;
  started_at: string | null;
  finished_at: string | null;
  review: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  book_id: string;
  page: number;
  quote: string;
  reflection: string;
  /** @deprecated legacy — quote/reflection 사용 */
  content?: string;
  created_at: string;
}
