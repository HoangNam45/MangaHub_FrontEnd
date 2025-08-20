'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginWithToken,
  logoutUser,
  checkTokenExpiration,
  refreshToken,
  initializeAuth,
} from '@/store/slices/authSlice';
import { tokenService } from '@/services/tokenService';
import authService from '@/services/authService';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  useEffect(() => {
    // Initialize auth state from cookies on mount
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Only run token checks if we have been authenticated
    if (!isAuthenticated) return;

    // Check token expiration on mount and periodically
    dispatch(checkTokenExpiration());

    // Auto-refresh token if needed
    if (tokenService.shouldRefreshToken()) {
      dispatch(refreshToken());
    }

    // Check token expiration and refresh needs every minute
    const interval = setInterval(() => {
      dispatch(checkTokenExpiration());

      if (tokenService.shouldRefreshToken()) {
        dispatch(refreshToken());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  const login = async (token: string) => {
    try {
      await dispatch(loginWithToken(token)).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    await dispatch(logoutUser());
  };

  const getCurrentUser = () => {
    return tokenService.getUserFromToken();
  };

  const getAccessToken = () => {
    return tokenService.getAccessToken();
  };

  const isTokenValid = () => {
    return tokenService.isAccessTokenValid();
  };

  const getTokenInfo = () => {
    return tokenService.getTokenInfo();
  };

  const forceRefreshToken = async () => {
    try {
      await dispatch(refreshToken()).unwrap();
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  return {
    // State
    isAuthenticated,
    user,
    token,
    isLoading,
    error,

    // Actions
    login,
    logout,
    forceRefreshToken,

    // Utility functions
    getCurrentUser,
    getAccessToken,
    isTokenValid,
    getTokenInfo,
  };
}
