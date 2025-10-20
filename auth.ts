import { prisma } from 'lib/db';

function getBcrypt(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('bcryptjs');
  } catch {
    throw new Error("Missing dependency 'bcryptjs'. Run `npm install` (or `npm install bcryptjs`).");
  }
}

function getNextAuth(): { NextAuth: any; Credentials: any } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const na = require('next-auth');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const creds = require('next-auth/providers/credentials');
    return { NextAuth: na.default || na, Credentials: creds.default || creds };
  } catch {
    return null;
  }
}

const NA = getNextAuth();


let handlers: any;
let signIn: any;
let signOut: any;
let authOptions: any;
let auth: any;

if (NA) {
  const { NextAuth, Credentials } = NA;
  authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    providers: [
      Credentials({
        id: 'credentials',
        name: 'credentials',
        async authorize(creds: any) {
          console.log('Authorize called with creds:', creds);
          const email = String(creds?.email || '').toLowerCase();
          const password = String(creds?.password || '');
          console.log('Normalized email:', email, 'password length:', password.length);
          if (!email || !password) {
            console.log('Missing email or password');
            return null;
          }
          const user = await prisma.user?.findUnique?.({ where: { email } });
          console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : null);
          if (!user) {
            console.log('No user found for email:', email);
            return null;
          }
          const bcrypt = getBcrypt();
          const ok = await bcrypt.compare(password, user.passwordHash);
          console.log('Password comparison result:', ok);
          if (!ok) {
            console.log('Password mismatch');
            return null;
          }
          console.log('Login successful for user:', user.email);
          return { id: user.id, email: user.email, name: user.name || '', role: user.role } as any;
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.role = (user as any).role || 'USER';
        }
        return token;
      },
      async session({ session, token }: any) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role || 'USER';
        return session;
      }
    }
  };
  // next-auth v4 returns a function (request handler).
  // next-auth v5 returns an object: { handlers, auth, signIn, signOut }.
  const maybe = NextAuth(authOptions);
  if (typeof maybe === 'function') {
    // v4 style
    handlers = maybe;
    // Provide server-side auth() helper for v4 using getServerSession
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const na = require('next-auth');
      const gss = na.getServerSession || na.unstable_getServerSession;
      if (gss) {
        auth = async () => gss(authOptions);
      }
    } catch {
      // ignore
    }
  } else if (maybe && typeof maybe === 'object') {
    // v5 style
    ({ handlers, signIn, signOut, auth } = maybe as any);
  }
} else {
  // Fallback stubs so the app can build without next-auth (until installed)
  const notInstalled = async () =>
    new Response('next-auth is not installed. Run `npm install next-auth`.', { status: 501 });
  handlers = { GET: notInstalled, POST: notInstalled };
  auth = async () => null;
  signIn = async () => {
    throw new Error('next-auth is not installed. Run `npm install next-auth`.');
  };
  signOut = async () => {
    throw new Error('next-auth is not installed. Run `npm install next-auth`.');
  };
}

export { auth, authOptions, handlers, signIn, signOut };
