'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type DoneReason = 'new' | 'existing';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<DoneReason | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResendMsg(error ? '잠시 후 다시 시도해주세요.' : '인증 이메일을 재전송했습니다.');
    setResending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // auto-confirm인 경우 바로 로그인
    if (data.session) {
      router.push('/');
      router.refresh();
      return;
    }

    // identities가 빈 배열이면 이미 가입된 이메일
    const isExisting = data.user?.identities?.length === 0;
    setDone(isExisting ? 'existing' : 'new');
    setLoading(false);
  };

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300';

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

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {done ? (
            <div className="py-4 text-center">
              {done === 'existing' ? (
                <>
                  <p className="text-sm font-medium text-gray-800">이미 가입된 이메일이에요</p>
                  <p className="mt-2 text-sm text-gray-400">
                    인증을 완료했다면 바로 로그인할 수 있어요.
                  </p>
                  <Link
                    href="/login"
                    className="mt-5 block w-full rounded-xl bg-gray-900 py-3 text-center text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                    로그인하기
                  </Link>
                  <p className="mt-3 text-xs text-gray-400">
                    인증 메일을 받지 못하셨다면 새 이메일 주소로 가입해보세요.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800">이메일을 확인해주세요</p>
                  <p className="mt-2 text-sm text-gray-400">
                    {email}로 인증 링크를 보냈습니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-5 w-full rounded-xl border border-gray-200 py-3 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {resending ? '전송 중...' : '인증 이메일 다시 보내기'}
                  </button>
                  <Link
                    href="/login"
                    className="mt-4 block text-sm text-gray-400 underline underline-offset-2"
                  >
                    로그인으로 돌아가기
                  </Link>
                </>
              )}
              {resendMsg && (
                <p className="mt-2 text-xs text-gray-400">{resendMsg}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                required
                autoComplete="email"
                className={inputCls}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 (6자 이상)"
                required
                autoComplete="new-password"
                className={inputCls}
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                required
                autoComplete="new-password"
                className={inputCls}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </form>
          )}
        </div>

        {!done && (
          <p className="mt-4 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-gray-700 underline underline-offset-2">
              로그인
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
