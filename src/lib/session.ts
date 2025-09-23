// lib/session.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  username?: string;
  email?: string;
  isLoggedIn: boolean;
}

const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET || '', // Must be at least 32 characters
  cookieName: 'demo-app-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}
