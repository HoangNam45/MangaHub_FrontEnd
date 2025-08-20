'use client';

import { useAppSelector } from '@/store/hooks';

export default function AuthDebug() {
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
        {user && (
          <div>
            <div>User ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Name: {user.name}</div>
            <div>Email Verified: {user.isEmailVerified ? 'Yes' : 'No'}</div>
          </div>
        )}
        {token && (
          <div>
            <div>Token: {token.substring(0, 20)}...</div>
          </div>
        )}
      </div>
    </div>
  );
}
