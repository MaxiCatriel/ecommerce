'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useI18n } from 'components/i18n/provider';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Attempting signIn with:', { email, password: '***' });
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      console.log('signIn result:', res);
      if (res?.error) {
        setError('Credenciales inválidas');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('signIn error:', err);
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">{t.login.title}</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <label className="mb-1 block text-sm">{t.login.email}</label>
          <input className="w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm">{t.login.password}</label>
          <input className="w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-red-600">{t.login.error}</p> : null}
        <button className="rounded bg-blue-600 px-4 py-2 text-white">{t.login.submit}</button>
      </form>
      <p className="mt-4 text-sm">
        ¿No tienes cuenta?{' '}
        <a className="text-blue-600 underline" href="/(auth)/register">
          {t.register.submit}
        </a>
      </p>
    </div>
  );
}
