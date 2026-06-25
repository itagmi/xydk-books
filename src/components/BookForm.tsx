"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createBook, updateBook } from "@/lib/actions";
import { Book, BookStatus } from "@/lib/types";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/utils";
import { BookOpen, Loader2 } from "lucide-react";

interface Props {
  book?: Pick<
    Book,
    | "id"
    | "title"
    | "author"
    | "category"
    | "status"
    | "cover_image"
    | "total_pages"
  >;
  onDone: () => void;
}

interface BookSearchHit {
  title: string;
  author: string;
  category: string;
  cover_image: string | null;
}

export function BookForm({ book, onDone }: Props) {
  const [form, setForm] = useState({
    title: book?.title ?? "",
    author: book?.author ?? "",
    category: book?.category ?? "",
    status: (book?.status ?? "책장속") as BookStatus,
    cover_image: book?.cover_image ?? "",
    total_pages: book?.total_pages ? String(book.total_pages) : "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const skipNextSearch = useRef(Boolean(book));
  const titleFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchResults.length === 0) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!titleFieldRef.current?.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchResults.length]);

  useEffect(() => {
    const title = form.title.trim();
    if (title.length < 2) return;

    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await fetch(
          `/api/search-books?q=${encodeURIComponent(title)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          setSearchResults([]);
          setSearchError(data.error ?? "책 검색에 실패했습니다.");
          return;
        }
        setSearchResults(data.results ?? []);
      } catch {
        setSearchResults([]);
        setSearchError("책 검색에 실패했습니다.");
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.title]);

  const applySearchHit = (hit: BookSearchHit) => {
    skipNextSearch.current = true;
    setSearchResults([]);
    setSearchError("");
    setForm((prev) => ({
      ...prev,
      title: hit.title,
      author: hit.author || prev.author,
      cover_image: hit.cover_image ?? prev.cover_image,
    }));
  };

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key === "title" && value.trim().length < 2) {
        setSearchResults([]);
        setSearchError("");
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError("제목과 저자는 필수입니다.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const totalPages = form.total_pages.trim()
        ? Number(form.total_pages)
        : undefined;
      const data = {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        ...(book
          ? { status: form.status }
          : { status: "책장속" as BookStatus }),
        ...(form.cover_image.trim()
          ? { cover_image: form.cover_image.trim() }
          : {}),
        ...(totalPages && totalPages > 0
          ? { total_pages: totalPages }
          : book
            ? { total_pages: null }
            : {}),
      };
      if (book) {
        await updateBook(book.id, data);
      } else {
        await createBook({
          title: data.title,
          author: data.author,
          category: data.category,
          ...(data.cover_image ? { cover_image: data.cover_image } : {}),
          ...(totalPages && totalPages > 0 ? { total_pages: totalPages } : {}),
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

  const showDropdown = searchResults.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex justify-center pb-1">
        {form.cover_image ? (
          <Image
            src={form.cover_image}
            alt={form.title || "표지"}
            width={120}
            height={168}
            className="h-36 w-24 rounded-lg object-cover shadow-md"
            unoptimized
          />
        ) : (
          <div className="flex h-36 w-24 items-center justify-center rounded-lg bg-gray-100">
            <BookOpen className="h-8 w-8 text-gray-300" />
          </div>
        )}
      </div>

      <div className="relative z-20">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          제목 *
        </label>
        <div ref={titleFieldRef} className="relative">
          <input
            className={inputCls}
            value={form.title}
            onChange={set("title")}
            placeholder="책 제목"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-300" />
          )}
          {showDropdown && (
            <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {searchResults.map((hit) => (
                <li key={`${hit.title}-${hit.author}`}>
                  <button
                    type="button"
                    onClick={() => applySearchHit(hit)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    {hit.cover_image ? (
                      <Image
                        src={hit.cover_image}
                        alt=""
                        width={32}
                        height={44}
                        className="h-11 w-8 shrink-0 rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-11 w-8 shrink-0 rounded bg-gray-200" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {hit.title}
                      </p>
                      {hit.author && (
                        <p className="truncate text-xs text-gray-500">
                          {hit.author}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {searchError && (
          <p className="mt-1 text-xs text-red-500">{searchError}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          저자 *
        </label>
        <input
          className={inputCls}
          value={form.author}
          onChange={set("author")}
          placeholder="저자명"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          장르
        </label>
        <input
          className={inputCls}
          value={form.category}
          onChange={set("category")}
          placeholder="소설, 에세이, 자기계발 등"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600 flex">
          총 페이지{" "}
          <p className="text-[11px] leading-relaxed text-gray-400 ml-1">
            작성하면 표지에 독서 완독률이 표시돼요.
          </p>
        </label>
        <input
          type="number"
          min={1}
          className={inputCls}
          value={form.total_pages}
          onChange={set("total_pages")}
          placeholder="예: 324"
        />
      </div>
      {book ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            상태
          </label>
          <select
            className={inputCls}
            value={form.status}
            onChange={set("status")}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          책장에 추가됩니다. 읽기 시작은 책장에서 선택하세요.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {pending ? "저장 중..." : book ? "수정" : "추가"}
      </button>
    </form>
  );
}
