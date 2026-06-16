"use client";

import { useEffect, useState } from "react";

export const FINISHED_TOAST_KEY = "ginkgo-finished-toast";

export function markFinishedReadingToast() {
  sessionStorage.setItem(FINISHED_TOAST_KEY, "1");
}

function shouldShowFinishedToast() {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(FINISHED_TOAST_KEY) !== "1") return false;
  sessionStorage.removeItem(FINISHED_TOAST_KEY);
  return true;
}

export function FinishedReadingToast() {
  const [visible, setVisible] = useState(shouldShowFinishedToast);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      완독 완료 — 생각을 정리해볼까요?
    </div>
  );
}
