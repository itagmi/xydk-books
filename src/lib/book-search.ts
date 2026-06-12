export interface BookSearchHit {
  title: string;
  author: string;
  category: string;
  cover_image: string | null;
}

interface GoogleVolume {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  cover_i?: number;
}

interface NaverBookItem {
  title?: string;
  author?: string;
  image?: string;
}

function stripHtml(text: string): string {
  return text.replace(/<\/?[^>]+(>|$)/g, '');
}

async function searchNaverBooks(query: string): Promise<BookSearchHit[]> {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return [];

  const url = new URL('https://openapi.naver.com/v1/search/book.json');
  url.searchParams.set('query', query);
  url.searchParams.set('display', '10');
  url.searchParams.set('sort', 'sim');

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });
  const data = await res.json();

  if (!res.ok) {
    if (data?.errorCode === '024') {
      throw new Error(
        '네이버 앱에 "검색" API가 활성화되지 않았습니다. developers.naver.com → 내 애플리케이션 → API 설정 → 사용 API에서 "검색"을 체크하고 저장해 주세요.'
      );
    }
    const message = data?.errorMessage ?? '네이버 책 검색 실패';
    throw new Error(message);
  }

  return ((data.items ?? []) as NaverBookItem[])
    .map((item) => {
      if (!item.title) return null;
      return {
        title: stripHtml(item.title),
        author: item.author ?? '',
        category: '',
        cover_image: item.image || null,
      };
    })
    .filter((hit): hit is BookSearchHit => hit !== null);
}

async function searchGoogleBooks(query: string): Promise<BookSearchHit[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) return [];

  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '10');
  url.searchParams.set('langRestrict', 'ko');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message ?? 'Google Books 검색 실패';
    throw new Error(message);
  }

  return ((data.items ?? []) as GoogleVolume[])
    .map((item) => {
      const info = item.volumeInfo;
      if (!info?.title) return null;
      const thumbnail =
        info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
      return {
        title: info.title,
        author: info.authors?.[0] ?? '',
        category: '',
        cover_image: thumbnail
          ? thumbnail.replace('http://', 'https://')
          : null,
      };
    })
    .filter((hit): hit is BookSearchHit => hit !== null);
}

async function searchOpenLibrary(query: string): Promise<BookSearchHit[]> {
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '10');

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) return [];

  return ((data.docs ?? []) as OpenLibraryDoc[])
    .map((doc) => {
      if (!doc.title) return null;
      return {
        title: doc.title,
        author: doc.author_name?.[0] ?? '',
        category: '',
        cover_image: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null,
      };
    })
    .filter((hit): hit is BookSearchHit => hit !== null);
}

function dedupeHits(hits: BookSearchHit[]): BookSearchHit[] {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.title}|${hit.author}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasSearchCredentials(): boolean {
  return Boolean(
    (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) ||
      process.env.GOOGLE_BOOKS_API_KEY
  );
}

export async function searchBooks(query: string): Promise<BookSearchHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const errors: string[] = [];
  const hits: BookSearchHit[] = [];

  if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
    try {
      hits.push(...(await searchNaverBooks(trimmed)));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : '네이버 책 검색 실패');
    }
  }

  if (hits.length === 0 && process.env.GOOGLE_BOOKS_API_KEY) {
    try {
      hits.push(...(await searchGoogleBooks(trimmed)));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Google Books 검색 실패');
    }
  }

  if (hits.length === 0) {
    hits.push(...(await searchOpenLibrary(trimmed)));
  }

  const results = dedupeHits(hits);

  if (results.length === 0 && !hasSearchCredentials()) {
    throw new Error(
      '책 검색 API 키가 없습니다. .env에 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET을 추가해 주세요.'
    );
  }

  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return results;
}
