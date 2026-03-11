'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useI18n } from 'components/i18n/provider';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError(t.resetPassword.invalidToken);
      return;
    }

    if (password.length < 6) {
      setError(t.resetPassword.passwordMin);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.resetPassword.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || t.resetPassword.error);
        return;
      }

      setSuccess(t.resetPassword.success);
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch {
      setError(t.resetPassword.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">{t.resetPassword.title}</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <label className="mb-1 block text-sm">{t.resetPassword.newPassword}</label>
          <input
            className="w-full rounded border p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t.resetPassword.confirmPassword}</label>
          <input
            className="w-full rounded border p-2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}
        <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
          {loading ? t.resetPassword.saving : t.resetPassword.submit}
        </button>
      </form>
    </div>
  );
}