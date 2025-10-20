'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AuthControls() {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  const role = (session?.user as any)?.role;

  if (!isAuthed) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          prefetch={true}
          className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Ingresar
        </Link>
        <Link
          href="/register"
          prefetch={true}
          className="rounded-full border px-3 py-2 text-sm hover:bg-blue-50 border-blue-600 text-blue-600 dark:border-blue-400 dark:hover:bg-neutral-900"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {role === 'ADMIN' ? (
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            prefetch={true}
            className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Admin
          </Link>
          {process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true' && (
            <Link
              href="/admin/chat"
              prefetch={true}
              className="rounded-full border px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Chat
            </Link>
          )}
        </div>
      ) : null}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded-full bg-neutral-800 px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-neutral-200 dark:text-black"
      >
        Salir
      </button>
    </div>
  );
}

