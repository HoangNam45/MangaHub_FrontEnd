'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 py-3 shadow-md bg-white z-999">
        <Link href="/" className="text-2xl font-bold text-black">
          MangaHub
        </Link>
        <div className="space-x-2">
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-8 py-3 shadow-md bg-white z-999">
      <Link href="/" className="text-2xl font-bold text-black">
        MangaHub
      </Link>

      <div className="space-x-2">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link href="/register">
              <Button variant="outline">Sign up</Button>
            </Link>
            <Link href="/login">
              <Button variant="primary">Sign in</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
