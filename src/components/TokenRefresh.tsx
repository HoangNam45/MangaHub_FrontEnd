'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkTokenExpiration, clearExpiredTokens, refreshToken } from '@/store/slices/authSlice';
import { tokenService } from '@/services/tokenService';

export default function TokenRefresh() {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Check token expiration and refresh if needed
    const checkAndRefresh = () => {
      const wasExpired = token && tokenService.isTokenExpired(token);
      dispatch(checkTokenExpiration());

      // If token was expired, clear it from cookies
      if (wasExpired) {
        dispatch(clearExpiredTokens());
      } else if (tokenService.shouldRefreshToken()) {
        dispatch(refreshToken()).catch(console.error);
      }
    };

    // Initial check
    checkAndRefresh();

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated, token]);

  // Listen for cookie changes and focus events for cross-tab synchronization
  useEffect(() => {
    // Listen for focus events to check token status when user returns to tab
    const handleFocus = () => {
      // Re-check auth state from cookies when tab gains focus
      const authState = tokenService.getAuthState();
      if (authState.isAuthenticated !== isAuthenticated) {
        dispatch(checkTokenExpiration());
      }

      const wasExpired = authState.token && tokenService.isTokenExpired(authState.token);
      if (wasExpired) {
        dispatch(clearExpiredTokens());
      } else if (authState.isAuthenticated && tokenService.shouldRefreshToken()) {
        dispatch(refreshToken()).catch(console.error);
      }
    };

    // Listen for visibility change to check token when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const authState = tokenService.getAuthState();
        if (authState.isAuthenticated !== isAuthenticated) {
          dispatch(checkTokenExpiration());
        }

        const wasExpired = authState.token && tokenService.isTokenExpired(authState.token);
        if (wasExpired) {
          dispatch(clearExpiredTokens());
        } else if (authState.isAuthenticated && tokenService.shouldRefreshToken()) {
          dispatch(refreshToken()).catch(console.error);
        }
      }
    };

    // Custom event listener for manual cookie sync across tabs
    const handleCookieSync = () => {
      dispatch(checkTokenExpiration());
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('token-sync', handleCookieSync);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('token-sync', handleCookieSync);
    };
  }, [dispatch, isAuthenticated]);

  return null;
}
