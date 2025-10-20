'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; session: Session | null };

function AuthSessionProvider({ children, session }: Props) {
  // Keep provider simple; next-auth auto-detects base path
  return <SessionProvider session={session as any}>{children}</SessionProvider>;
}

export default AuthSessionProvider as any;
