'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, StickyNote, LayoutDashboard } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { UserMenuDropdown } from '@/components/UserMenuDropdown';
import { deleteBook, updateBookStatus } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { Book, type BookStatus } from '@/lib/types';
import { BookEditModal } from '@/components/BookEditModal';
import { BookForm } from '@/components/BookForm';
import { Modal } from '@/components/Modal';
import { GinkgoMemoModal } from '@/components/GinkgoMemoModal';
import { FinishReadingConfirmModal } from '@/components/FinishReadingConfirmModal';
import { EmptyDeskGuideIllustration } from '@/components/EmptyDeskGuideIllustration';
import { LocationScene } from '@/components/LocationScene';
import { isStatusAtCapacity, STATUS_LIMITS, canFinishReading, statusLimitErrorMessage } from '@/lib/book-limits';
import { markFinishedReadingToast } from '@/components/FinishedReadingToast';
import { STATUS_LABELS } from '@/lib/utils';

type BookListItem = Pick<
  Book,
  'id' | 'title' | 'author' | 'category' | 'status' | 'cover_image' | 'rating' | 'total_pages'
> & { max_page: number | null };

function calcProgress(maxPage: number | null, totalPages: number | null): number | null {
  if (!totalPages || maxPage == null) return null;
  return Math.min(100, Math.round((maxPage / totalPages) * 100));
}

type SceneVariant = 'desk' | 'bag';

interface Props {
  books: BookListItem[];
  error: boolean;
  isAdmin?: boolean;
}

function CoverPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = {
    sm: 'h-10 w-7',
    md: 'h-16 w-12',
    lg: 'h-24 w-16',
  }[size];
  return (
    <div className={`${cls} flex shrink-0 items-center justify-center rounded-md bg-gray-100`}>
      <img src="/logo.svg" alt="" className="h-5 w-auto opacity-30" />
    </div>
  );
}

function ProgressOverlay({
  progress,
  rounded = false,
  spine = false,
}: {
  progress: number | null;
  rounded?: boolean;
  spine?: boolean;
}) {
  if (progress === null) return null;
  const label = `${progress}%`;

  if (spine) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden${rounded ? ' rounded-lg' : ''}`}
        aria-hidden
      >
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-0.5 pb-0.5 pt-2">
          <div className="h-0.5 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-[#E8A800]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="mt-0.5 block text-center text-[8px] font-bold tabular-nums text-white">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden${rounded ? ' rounded-lg' : ''}`}
      aria-hidden
    >
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-1.5 pb-1.5 pt-6">
        <div className="flex items-center gap-1.5">
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-[#E8A800]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-bold tabular-nums text-white">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function DragOverlayCard({ book }: { book: BookListItem }) {
  return (
    <div className="scene-card scene-card-desk w-64 rotate-1 p-3 opacity-95 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {book.cover_image ? (
            <Image
              src={book.cover_image}
              alt={book.title}
              width={40}
              height={56}
              className="h-14 w-10 rounded-md object-cover shadow"
            />
          ) : (
            <CoverPlaceholder size="sm" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{book.title}</p>
          <p className="truncate text-xs text-gray-500">{book.author}</p>
        </div>
      </div>
    </div>
  );
}

function DroppableZone({
  id,
  children,
  canDrop,
  isDragActive,
}: {
  id: string;
  children: React.ReactNode;
  canDrop: boolean;
  isDragActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  let ringClass = '';
  if (isDragActive && canDrop) {
    ringClass =
      isOver ? 'ring-2 ring-inset ring-white/45' : 'ring-1 ring-inset ring-white/20';
  }

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-150 ${isDragActive ? 'min-h-16' : ''} ${ringClass}`}
    >
      {children}
    </div>
  );
}

function ReadingLocationMenu({
  book,
  deskCount,
  bagCount,
  onDelete,
  onRequestFinish,
  onEdit,
  showDetail = false,
  disabled,
  showLocation = true,
  className = 'absolute right-2 top-2 z-10',
  menuClassName = 'min-w-[7.5rem] overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg',
  buttonClassName = 'scene-card-action disabled:opacity-50',
}: {
  book: BookListItem;
  deskCount: number;
  bagCount: number;
  onDelete?: () => void;
  onRequestFinish?: () => void;
  onEdit?: () => void;
  showDetail?: boolean;
  disabled?: boolean;
  showLocation?: boolean;
  className?: string;
  menuClassName?: string;
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const deskFull = isStatusAtCapacity('책상위', deskCount, book.status);
  const bagFull = isStatusAtCapacity('가방안', bagCount, book.status);
  const showFinish = canFinishReading(book.status);
  const hasStatusActions = showLocation || showFinish;

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const padding = 8;
    const menuWidth = menu?.offsetWidth ?? 120;
    const menuHeight = menu?.offsetHeight ?? 0;

    let left = rect.right - menuWidth;
    left = Math.max(padding, Math.min(left, window.innerWidth - padding - menuWidth));

    let top = rect.bottom + 4;
    if (menuHeight && top + menuHeight > window.innerHeight - padding) {
      top = Math.max(padding, rect.top - menuHeight - 4);
    }

    setMenuStyle({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const changeStatus = async (status: BookStatus) => {
    if (book.status === status || pending) {
      setOpen(false);
      return;
    }
    if (status === '책상위' || status === '가방안') {
      if (isStatusAtCapacity(status, status === '책상위' ? deskCount : bagCount, book.status)) {
        return;
      }
    }
    if (status === '완독완료' && !canFinishReading(book.status)) {
      return;
    }
    setPending(true);
    try {
      await updateBookStatus(book.id, status);
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const itemCls =
    'block w-full cursor-pointer px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40';
  const deleteCls =
    'block w-full cursor-pointer px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40';

  const menu =
    open ? (
      <div
        ref={menuRef}
        className={`fixed z-50 ${menuClassName}`}
        style={
          menuStyle
            ? { top: menuStyle.top, left: menuStyle.left }
            : { visibility: 'hidden', top: 0, left: 0 }
        }
      >
        {showLocation && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeStatus('책상위');
              }}
              disabled={pending || book.status === '책상위' || deskFull}
              className={itemCls}
            >
              {STATUS_LABELS.책상위}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeStatus('가방안');
              }}
              disabled={pending || book.status === '가방안' || bagFull}
              className={itemCls}
            >
              {STATUS_LABELS.가방안}
            </button>
          </>
        )}
        {showFinish && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onRequestFinish?.();
            }}
            disabled={pending}
            className={`${itemCls}${showLocation ? ' border-t border-gray-100' : ''}`}
          >
            {STATUS_LABELS.완독완료}
          </button>
        )}
        {showDetail && (
          <Link
            href={`/books/${book.id}`}
            onClick={() => setOpen(false)}
            className={`${itemCls}${hasStatusActions ? ' border-t border-gray-100' : ''}`}
          >
            메모 목록
          </Link>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
            disabled={pending || disabled}
            className={`${itemCls}${hasStatusActions || showDetail ? ' border-t border-gray-100' : ''}`}
          >
            책 정보 수정
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            disabled={pending || disabled}
            className={`${deleteCls}${hasStatusActions || showDetail ? ' border-t border-gray-100' : ''}`}
          >
            삭제
          </button>
        )}
      </div>
    ) : null;

  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        disabled={disabled || pending}
        className={buttonClassName}
        aria-label="더보기"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2.25} />
      </button>
      {typeof document !== 'undefined' && open ? createPortal(menu, document.body) : null}
    </div>
  );
}

function ReadingCard({
  book,
  deskCount,
  bagCount,
  deleting,
  variant,
  onDelete,
  onMemo,
  onRequestFinish,
  onEdit,
}: {
  book: BookListItem;
  deskCount: number;
  bagCount: number;
  deleting: boolean;
  variant: SceneVariant;
  onDelete: () => void;
  onMemo: () => void;
  onRequestFinish: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: book.id,
    data: { bookId: book.id, fromStatus: book.status },
  });

  const cardClass = variant === 'bag' ? 'scene-card-bag' : 'scene-card-desk';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`scene-card ${cardClass} relative p-4 cursor-grab active:cursor-grabbing${isDragging ? ' opacity-40' : ''}`}
    >
      <ReadingLocationMenu
        book={book}
        deskCount={deskCount}
        bagCount={bagCount}
        disabled={deleting}
        onDelete={onDelete}
        onRequestFinish={onRequestFinish}
        onEdit={onEdit}
        showDetail
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMemo}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left hover:opacity-90 transition-opacity"
        >
          <div className="relative shrink-0">
            {book.cover_image ? (
              <Image
                src={book.cover_image}
                alt={book.title}
                width={64}
                height={88}
                className="block h-22 w-16 rounded-lg object-cover shadow-md"
              />
            ) : (
              <CoverPlaceholder size="lg" />
            )}
            <ProgressOverlay
              progress={calcProgress(book.max_page, book.total_pages)}
              rounded
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-snug text-gray-900">{book.title}</p>
            <p className="mt-0.5 text-sm text-gray-500">{book.author}</p>
            {book.category && (
              <p className="mt-0.5 text-xs text-gray-400">{book.category}</p>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={onMemo}
          className="scene-card-memo flex h-7 w-7 shrink-0 items-center justify-center"
          aria-label="메모"
        >
          <StickyNote className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

function ShelfSpine({
  book,
  onDelete,
  onRequestFinish,
  onEdit,
  deleting,
  finished = false,
  deskCount,
  bagCount,
}: {
  book: BookListItem;
  onDelete: () => void;
  onRequestFinish: () => void;
  onEdit: () => void;
  deleting: boolean;
  finished?: boolean;
  deskCount: number;
  bagCount: number;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: book.id,
    data: { bookId: book.id, fromStatus: book.status },
    disabled: finished,
  });

  const spineEl = (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`scene-spine${finished ? ' scene-spine-finished' : ''}${!finished ? ' cursor-grab active:cursor-grabbing' : ''}${isDragging ? ' opacity-40' : ''}`}
      style={{
        height: `${4.5 + (book.title.length % 3) * 0.4}rem`,
        background: book.cover_image
          ? undefined
          : `linear-gradient(180deg, hsl(${(book.title.charCodeAt(0) * 7) % 360}, 35%, 42%), hsl(${(book.title.charCodeAt(0) * 7 + 20) % 360}, 40%, 28%))`,
      }}
    >
      {book.cover_image ? (
        <Image
          src={book.cover_image}
          alt={book.title}
          width={44}
          height={88}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="scene-spine-title">{book.title}</span>
      )}
      {!finished && (
        <ProgressOverlay
          progress={calcProgress(book.max_page, book.total_pages)}
          spine
        />
      )}
      {finished && book.rating != null && (
        <span className="scene-spine-rating" aria-label={`${book.rating}점`}>
          {'★'.repeat(book.rating)}
        </span>
      )}
    </div>
  );

  return (
    <div className="group relative">
      {finished ? (
        <Link href={`/books/${book.id}`} className="block" title={book.title}>
          {spineEl}
        </Link>
      ) : (
        <div title={book.title}>{spineEl}</div>
      )}
      <ReadingLocationMenu
        book={book}
        deskCount={deskCount}
        bagCount={bagCount}
        disabled={deleting}
        onDelete={onDelete}
        onRequestFinish={onRequestFinish}
        onEdit={onEdit}
        showLocation={!finished}
        showDetail
        className="absolute -right-1 -top-1 z-10"
        menuClassName="min-w-[7.5rem] overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
        buttonClassName="scene-shelf-action disabled:opacity-50"
      />
    </div>
  );
}

function ShelfBoard({
  books,
  onDelete,
  onRequestFinish,
  onEdit,
  deleting,
  finished = false,
  deskCount,
  bagCount,
}: {
  books: BookListItem[];
  onDelete: (id: string, title: string) => void;
  onRequestFinish: (id: string, title: string) => void;
  onEdit: (book: BookListItem) => void;
  deleting: string | null;
  finished?: boolean;
  deskCount: number;
  bagCount: number;
}) {
  return (
    <div className="scene-shelf-board">
      {books.map((book) => (
        <ShelfSpine
          key={book.id}
          book={book}
          finished={finished}
          deskCount={deskCount}
          bagCount={bagCount}
          deleting={deleting === book.id}
          onDelete={() => onDelete(book.id, book.title)}
          onRequestFinish={() => onRequestFinish(book.id, book.title)}
          onEdit={() => onEdit(book)}
        />
      ))}
    </div>
  );
}

function ShelfZone({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="scene-shelf-zone">
      <p className="scene-shelf-label">
        {label}
        <span>{count}권</span>
      </p>
      {children}
    </div>
  );
}

function chunkBooks<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function BookHome({ books, error, isAdmin }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [finishTarget, setFinishTarget] = useState<{
    id: string;
    title: string;
    fromProgress?: boolean;
  } | null>(null);
  const [finishPending, setFinishPending] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [memoBook, setMemoBook] = useState<BookListItem | null>(null);
  const [editBook, setEditBook] = useState<BookListItem | null>(null);
  const [nickname, setNickname] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [guideDontShow, setGuideDontShow] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // D&D state
  const [localBooks, setLocalBooks] = useState(books);
  const [activeBook, setActiveBook] = useState<BookListItem | null>(null);
  const [dragError, setDragError] = useState('');

  // books prop이 바뀌면(server refresh) localBooks 동기화
  useEffect(() => {
    setLocalBooks(books);
  }, [books]);

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setNickname(data.user?.user_metadata?.nickname ?? '');
      setUserEmail(data.user?.email ?? '');
    });
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('ginkgo_guide_seen')) {
      setShowGuide(true);
    }
  }, []);

  const dismissGuide = (openAdd = false) => {
    if (guideDontShow) localStorage.setItem('ginkgo_guide_seen', '1');
    setShowGuide(false);
    if (openAdd) setAdding(true);
  };

  useEffect(() => {
    if (!deleteSuccess) return;
    const timer = window.setTimeout(() => setDeleteSuccess(false), 3000);
    return () => window.clearTimeout(timer);
  }, [deleteSuccess]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const requestDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const requestFinish = (id: string, title: string) => {
    setFinishTarget({ id, title });
  };

  const confirmFinish = async () => {
    if (!finishTarget || finishPending) return;
    const { id } = finishTarget;
    setFinishPending(true);
    setFinishTarget(null);
    try {
      await updateBookStatus(id, '완독완료');
      markFinishedReadingToast();
      router.push(`/books/${id}?review=1`);
    } finally {
      setFinishPending(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    const { id } = deleteTarget;
    setDeleting(id);
    setDeleteTarget(null);
    try {
      await deleteBook(id);
      setDeleteSuccess(true);
    } finally {
      setDeleting(null);
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const book = localBooks.find((b) => b.id === active.id);
    setActiveBook(book ?? null);
    setDragError('');
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    const dragged = activeBook;
    setActiveBook(null);

    if (!over || !dragged) return;

    const toStatus = over.id as BookStatus;
    const fromStatus = dragged.status;
    if (fromStatus === toStatus) return;

    // 용량 체크 (드래그 대상을 제외한 현재 카운트)
    const currentCount = localBooks.filter(
      (b) => b.status === toStatus && b.id !== dragged.id
    ).length;
    if (isStatusAtCapacity(toStatus, currentCount, fromStatus)) {
      setDragError(statusLimitErrorMessage(toStatus));
      setTimeout(() => setDragError(''), 3000);
      return;
    }

    // 낙관적 업데이트
    setLocalBooks((prev) =>
      prev.map((b) => (b.id === dragged.id ? { ...b, status: toStatus } : b))
    );

    try {
      await updateBookStatus(dragged.id, toStatus);
      router.refresh();
    } catch (err) {
      // 실패 시 되돌리기
      setLocalBooks(books);
      setDragError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
      setTimeout(() => setDragError(''), 3000);
    }
  };

  const inBag = localBooks.filter((b) => b.status === '가방안');
  const onDesk = localBooks.filter((b) => b.status === '책상위');
  const unread = localBooks.filter((b) => b.status === '책장속');
  const finished = localBooks.filter((b) => b.status === '완독완료');
  const unreadRows = chunkBooks(unread, 6);
  const finishedRows = chunkBooks(finished, 6);
  const shelfTotal = unread.length + finished.length;
  const shelfDetail = [
    unread.length > 0 && `읽기 전 ${unread.length}`,
    finished.length > 0 && `완독 ${finished.length}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const isDragActive = activeBook !== null;

  // 각 존에 드롭 가능한지 판단 (드래그 중인 책은 제외하고 카운트)
  const deskCountExcluding = activeBook ? onDesk.filter((b) => b.id !== activeBook.id).length : onDesk.length;
  const bagCountExcluding = activeBook ? inBag.filter((b) => b.id !== activeBook.id).length : inBag.length;
  const canDropOnDesk = isDragActive && activeBook!.status !== '책상위' && !isStatusAtCapacity('책상위', deskCountExcluding, activeBook!.status);
  const canDropOnBag = isDragActive && activeBook!.status !== '가방안' && !isStatusAtCapacity('가방안', bagCountExcluding, activeBook!.status);
  const canDropOnShelf = isDragActive && activeBook!.status !== '책장속';

  const emptySlot = (msg: string) => (
    <div className="flex items-center justify-center py-8">
      <p className="scene-empty-text">{msg}</p>
    </div>
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div>
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Ginkgo" className="h-9 w-auto" />
            <div>
              <h1 className="text-lg font-light tracking-widest text-gray-800">GINKGO</h1>
              {nickname && (
                <p className="text-xs text-gray-400">{nickname}의 서재</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="관리자 대시보드"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="책 추가"
            >
              <Plus className="h-5 w-5" />
            </button>
            <UserMenuDropdown
              nickname={nickname}
              email={userEmail}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {error && (
          <p className="mb-4 text-sm text-red-500">데이터를 불러오지 못했습니다.</p>
        )}

        {/* 책상 위 */}
        <LocationScene
          status="책상위"
          count={onDesk.length}
          limit={onDesk.length > 0 ? STATUS_LIMITS.책상위 : undefined}
          empty={onDesk.length === 0 && !isDragActive ? emptySlot('비어있어요') : undefined}
        >
          <DroppableZone id="책상위" canDrop={canDropOnDesk} isDragActive={isDragActive}>
            <div className="relative z-[1] space-y-3">
              {onDesk.map((book) => (
                <ReadingCard
                  key={book.id}
                  book={book}
                  variant="desk"
                  deskCount={onDesk.length}
                  bagCount={inBag.length}
                  deleting={deleting === book.id}
                  onDelete={() => requestDelete(book.id, book.title)}
                  onMemo={() => setMemoBook(book)}
                  onRequestFinish={() => requestFinish(book.id, book.title)}
                  onEdit={() => setEditBook(book)}
                />
              ))}
              {onDesk.length === 0 && isDragActive && canDropOnDesk && (
                <div className="flex items-center justify-center py-6">
                  <p className="scene-empty-text">여기에 놓으세요</p>
                </div>
              )}
            </div>
          </DroppableZone>
        </LocationScene>

        {/* 가방 안 */}
        <LocationScene
          status="가방안"
          count={inBag.length}
          limit={inBag.length > 0 ? STATUS_LIMITS.가방안 : undefined}
          empty={inBag.length === 0 && !isDragActive ? emptySlot('비어있어요') : undefined}
        >
          <DroppableZone id="가방안" canDrop={canDropOnBag} isDragActive={isDragActive}>
            <div className="relative z-[1] space-y-3">
              {inBag.map((book) => (
                <ReadingCard
                  key={book.id}
                  book={book}
                  variant="bag"
                  deskCount={onDesk.length}
                  bagCount={inBag.length}
                  deleting={deleting === book.id}
                  onDelete={() => requestDelete(book.id, book.title)}
                  onMemo={() => setMemoBook(book)}
                  onRequestFinish={() => requestFinish(book.id, book.title)}
                  onEdit={() => setEditBook(book)}
                />
              ))}
              {inBag.length === 0 && isDragActive && canDropOnBag && (
                <div className="flex items-center justify-center py-6">
                  <p className="scene-empty-text">여기에 놓으세요</p>
                </div>
              )}
            </div>
          </DroppableZone>
        </LocationScene>

        {/* 책장 속 — 읽기 전 / 완독 */}
        <LocationScene
          status="책장속"
          count={shelfTotal > 0 ? shelfTotal : undefined}
          detail={shelfDetail}
          empty={shelfTotal === 0 && !isDragActive ? emptySlot('비어있어요') : undefined}
        >
          <DroppableZone id="책장속" canDrop={canDropOnShelf} isDragActive={isDragActive}>
            <div className="relative z-[1]">
              <ShelfZone label="읽기 전" count={unread.length}>
                {unreadRows.map((row, i) => (
                  <ShelfBoard
                    key={`unread-${i}`}
                    books={row}
                    deleting={deleting}
                    onDelete={requestDelete}
                    onRequestFinish={requestFinish}
                    onEdit={setEditBook}
                    deskCount={onDesk.length}
                    bagCount={inBag.length}
                  />
                ))}
              </ShelfZone>
              <ShelfZone label="완독" count={finished.length}>
                {finishedRows.map((row, i) => (
                  <ShelfBoard
                    key={`finished-${i}`}
                    books={row}
                    finished
                    deleting={deleting}
                    onDelete={requestDelete}
                    onRequestFinish={requestFinish}
                    onEdit={setEditBook}
                    deskCount={onDesk.length}
                    bagCount={inBag.length}
                  />
                ))}
              </ShelfZone>
              {shelfTotal === 0 && isDragActive && canDropOnShelf && (
                <div className="flex items-center justify-center py-6">
                  <p className="scene-empty-text">여기에 놓으세요</p>
                </div>
              )}
            </div>
          </DroppableZone>
        </LocationScene>

        {/* 온보딩 가이드 */}
        <Modal open={showGuide} onClose={() => dismissGuide()} title="">
          <div className="flex flex-col items-center gap-5 px-2 pb-2 pt-1 text-center">
            <EmptyDeskGuideIllustration />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">
                Ginkgo에 오신 걸 환영해요
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                읽는 책을 책상·가방·책장에 두고<br />
                메모와 독후감까지 남기는 독서 기록 앱이에요.
              </p>
              <p className="text-xs leading-relaxed text-gray-400">
                오른쪽 위 <span className="font-medium text-gray-600">+</span> 버튼으로 책을 추가한 뒤,<br />
                책상 위에 올리면 읽기가 시작돼요.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <button
                onClick={() => dismissGuide(true)}
                className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                + 첫 책 추가하기
              </button>
              <button
                onClick={() => dismissGuide()}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={guideDontShow}
                onChange={(e) => setGuideDontShow(e.target.checked)}
                className="h-3.5 w-3.5 accent-gray-700"
              />
              다시 보지 않기
            </label>
          </div>
        </Modal>

        <Modal open={adding} onClose={() => setAdding(false)} title="새 책 추가">
          <BookForm onDone={() => setAdding(false)} />
        </Modal>

        <BookEditModal
          book={editBook}
          onClose={() => {
            setEditBook(null);
            router.refresh();
          }}
        />

        <Modal
          open={deleteTarget != null}
          onClose={() => setDeleteTarget(null)}
          title="책 삭제"
        >
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{deleteTarget?.title}</span>
            을(를) 삭제할까요?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            삭제하면 메모와 기록이 모두 사라지며 복구할 수 없어요.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting != null}
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting != null}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </Modal>

        <FinishReadingConfirmModal
          open={finishTarget != null}
          bookTitle={finishTarget?.title}
          fromProgress={finishTarget?.fromProgress}
          onClose={() => setFinishTarget(null)}
          onConfirm={confirmFinish}
          pending={finishPending}
        />

        <GinkgoMemoModal
          book={memoBook}
          onClose={() => setMemoBook(null)}
          onSuggestFinish={({ id, title }) =>
            setFinishTarget({ id, title, fromProgress: true })
          }
        />

        {deleteSuccess && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
          >
            삭제가 완료되었습니다.
          </div>
        )}

        {dragError && (
          <div
            role="alert"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-sm text-white shadow-lg"
          >
            {dragError}
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeBook ? <DragOverlayCard book={activeBook} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
