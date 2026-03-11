'use client';

import { FormEvent, useState } from 'react';
import { useI18n } from 'components/i18n/provider';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || t.forgotPassword.error);
        return;
      }

      setMessage(t.forgotPassword.success);
    } catch {
      setError(t.forgotPassword.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">{t.forgotPassword.title}</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <label className="mb-1 block text-sm">{t.login.email}</label>
          <input
            className="w-full rounded border p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
          {loading ? t.forgotPassword.sending : t.forgotPassword.submit}
        </button>
      </form>
    </div>
  );
}