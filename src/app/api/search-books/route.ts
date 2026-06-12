import { searchBooks } from '@/lib/book-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  try {
    const results = await searchBooks(q);
    return Response.json({ results });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '책 검색 중 오류가 발생했습니다.';
    return Response.json({ error: message, results: [] }, { status: 502 });
  }
}
