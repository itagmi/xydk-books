'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      router.push('/');
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <img src="/logo.svg" alt="Ginkgo" className="h-20 w-auto" />
        </div>
        <h1 className="text-xl font-light tracking-widest text-gray-800">GINKGO</h1>
        <p className="mt-6 text-base font-medium text-gray-800">환영합니다 🎉</p>
        <p className="mt-2 text-sm text-gray-400">이메일 인증이 완료되었습니다.</p>
        <p className="mt-8 text-xs text-gray-300">{count}초 후 홈으로 이동합니다</p>
      </div>
    </div>
  );
}
