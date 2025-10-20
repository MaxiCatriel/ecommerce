'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useI18n } from 'components/i18n/provider';

export default function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'No se pudo registrar');
        setLoading(false);
        return;
      }
      // Auto login after successful registration
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      if (loginRes?.error) {
        // If login fails, redirect to login page
        router.push('/(auth)/login');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setError('Error de red o del servidor');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">{t.register.title}</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <label className="mb-1 block text-sm">{t.register.name}</label>
          <input
            className="w-full rounded border p-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t.register.email}</label>
          <input
            className="w-full rounded border p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t.register.password}</label>
          <input
            className="w-full rounded border p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
          {loading ? '...' : t.register.submit}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ¿Ya tienes cuenta?{' '}
        <a className="text-blue-600 underline" href="/(auth)/login">
          {t.login.title}
        </a>
      </p>
    </div>
  );
}
