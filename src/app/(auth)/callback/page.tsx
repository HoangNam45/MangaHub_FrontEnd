'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        // Clear URL parameters after reading them
        const cleanURL = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanURL);

        if (error) {
          setError(decodeURIComponent(error));
          setStatus('error');
          return;
        }

        if (!token) {
          setError('No token received');
          setStatus('error');
          return;
        }

        // Use Redux login to decode token and store user info
        await login(token);

        setStatus('success');

        // Redirect with a short delay to ensure UI updates
        timeoutId = setTimeout(() => {
          router.push('/');
        }, 100);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router, login]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600">Completing authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // if (status === 'error') {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-gray-50">
  //       <Card className="w-full max-w-md shadow-lg">
  //         <CardHeader>
  //           <CardTitle className="text-center text-red-600">Authentication Failed</CardTitle>
  //         </CardHeader>
  //         <CardContent className="text-center">
  //           <p className="mb-4 text-gray-600">{error}</p>
  //           <button
  //             onClick={() => router.push('/login')}
  //             className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
  //           >
  //             Back to Login
  //           </button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Success!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600">Authentication successful! Redirecting...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
