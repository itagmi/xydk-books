'use client';

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { LogOut, UserRound, ChevronRight } from 'lucide-react';

interface Props {
  nickname: string;
  email: string;
  onLogout: () => void;
}

export function UserMenuDropdown({ nickname, email, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const padding = 8;
    const menuWidth = menu?.offsetWidth ?? 220;

    let left = rect.right - menuWidth;
    left = Math.max(padding, Math.min(left, window.innerWidth - padding - menuWidth));

    setMenuStyle({ top: rect.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) { setMenuStyle(null); return; }
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      className="fixed z-50 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
      style={menuStyle ? { top: menuStyle.top, left: menuStyle.left } : { visibility: 'hidden', top: 0, left: 0 }}
    >
      {/* 프로필 요약 */}
      <div className="px-4 py-3 border-b border-gray-100">
        {nickname && <p className="text-sm font-medium text-gray-800">{nickname}</p>}
        {email && <p className="mt-0.5 text-xs text-gray-400 truncate">{email}</p>}
      </div>

      {/* 내 정보 */}
      <Link
        href="/account"
        onClick={() => setOpen(false)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        내 정보
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </Link>

      {/* 로그아웃 */}
      <div className="border-t border-gray-100">
        <button
          type="button"
          onClick={() => { setOpen(false); onLogout(); }}
          className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          로그아웃
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="내 정보"
        aria-expanded={open}
      >
        <UserRound className="h-4 w-4" />
      </button>
      {typeof document !== 'undefined' && open
        ? createPortal(menu, document.body)
        : null}
    </>
  );
}
