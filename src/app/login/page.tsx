'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function StatusBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (error === 'auth_error') {
    return (
      <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm text-green-700">
        이메일 인증이 완료됐어요.<br />로그인해주세요.
      </div>
    );
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    // 탈퇴 계정 차단
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.deleted_at) {
      await supabase.auth.signOut();
      setError('탈퇴한 계정입니다.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-300';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 flex justify-center">
            <img src="/logo.svg" alt="Ginkgo" className="h-16 w-auto" />
          </div>
          <h1 className="text-xl font-light tracking-widest text-gray-800">GINKGO</h1>
          <p className="mt-1 text-sm text-gray-400">나의 독서 여정</p>
        </div>

        <Suspense>
          <StatusBanner />
        </Suspense>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              autoComplete="off"
              className={inputCls}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                autoComplete="off"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-400">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-gray-700 underline underline-offset-2">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
