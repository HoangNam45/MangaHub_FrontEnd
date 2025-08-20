/**
 * Token Service Usage Examples
 *
 * This file demonstrates how to use the new TokenService with cookie storage
 * and all token-related functionality.
 */

import { tokenService } from '@/services/tokenService';
import authService from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';

// Example 1: Basic token management
export const basicTokenUsage = () => {
  // Store tokens
  const accessToken = 'your-access-token';
  const refreshToken = 'your-refresh-token';

  tokenService.setAccessToken(accessToken);
  tokenService.setRefreshToken(refreshToken);

  // Get tokens
  const currentAccessToken = tokenService.getAccessToken();
  const currentRefreshToken = tokenService.getRefreshToken();

  // Check token validity
  const isValid = tokenService.isAccessTokenValid();
  const shouldRefresh = tokenService.shouldRefreshToken();

  // Get user from token
  const user = tokenService.getUserFromToken();

  // Clear tokens
  tokenService.clearTokens();
};

// Example 2: Using with React component
export const TokenAwareComponent = () => {
  const { isAuthenticated, user, token, login, logout, getTokenInfo } = useAuth();

  const handleLogin = async (token: string) => {
    try {
      await login(token);
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful!');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkTokenStatus = () => {
    const tokenInfo = getTokenInfo();
    console.log('Token Info:', tokenInfo);
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Welcome, {user?.name}!</h2>
          <p>Email: {user?.email}</p>
          <p>Verified: {user?.isEmailVerified ? 'Yes' : 'No'}</p>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={checkTokenStatus}>Check Token Status</button>
        </div>
      ) : (
        <div>
          <h2>Please login</h2>
          <button onClick={() => handleLogin('demo-token')}>Login</button>
        </div>
      )}
    </div>
  );
};

// Example 3: Auth service with automatic token management
export const authServiceUsage = async () => {
  try {
    // Login - tokens are automatically stored in cookies
    const loginData = { email: 'user@example.com', password: 'password' };
    const loginResponse = await authService.login(loginData);
    console.log('Login response:', loginResponse);

    // Check authentication status
    const isAuthenticated = authService.isAuthenticated();
    console.log('Is authenticated:', isAuthenticated);

    // Get current user
    const currentUser = authService.getCurrentUser();
    console.log('Current user:', currentUser);

    // Check if token needs refresh
    const shouldRefresh = authService.shouldRefreshToken();
    if (shouldRefresh) {
      await authService.refreshTokens();
      console.log('Token refreshed successfully');
    }

    // Logout - tokens are automatically cleared
    await authService.logout();
    console.log('Logout successful');
  } catch (error) {
    console.error('Auth operation failed:', error);
  }
};

// Example 4: Advanced token management
export const advancedTokenUsage = () => {
  // Get detailed token information
  const tokenInfo = tokenService.getTokenInfo();
  console.log('Token Information:', {
    hasAccessToken: tokenInfo.hasAccessToken,
    hasRefreshToken: tokenInfo.hasRefreshToken,
    accessTokenExpired: tokenInfo.accessTokenExpired,
    refreshTokenExpired: tokenInfo.refreshTokenExpired,
  });

  // Get token expiration times
  const accessToken = tokenService.getAccessToken();
  if (accessToken) {
    const expirationTime = tokenService.getTokenExpirationTime(accessToken);
    const timeUntilExpiration = tokenService.getTimeUntilExpiration(accessToken);

    console.log('Token expires at:', new Date(expirationTime || 0));
    console.log('Time until expiration:', timeUntilExpiration, 'ms');
  }

  // Set token with custom expiration
  tokenService.setAccessTokenWithExpiration('custom-token', 30); // 30 minutes

  // Get current auth state
  const authState = tokenService.getAuthState();
  console.log('Auth State:', authState);
};

// Example 5: Middleware for protected routes
export const withAuth = (WrappedComponent: React.ComponentType) => {
  return function AuthenticatedComponent(props: any) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      // Redirect to login or show login form
      return <div>Please login to access this page</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

// Example 6: Token refresh with error handling
export const handleTokenRefresh = async () => {
  try {
    if (!tokenService.isRefreshTokenValid()) {
      throw new Error('No valid refresh token available');
    }

    const refreshResponse = await authService.refreshTokens();
    console.log('Token refresh successful:', refreshResponse);

    return refreshResponse;
  } catch (error) {
    console.error('Token refresh failed:', error);

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw error;
  }
};

// Example 7: API call with automatic token handling
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = tokenService.getAccessToken();

  if (!token || tokenService.isTokenExpired(token)) {
    throw new Error('No valid access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token might be expired, try to refresh
    try {
      await authService.refreshTokens();

      // Retry the request with new token
      const newToken = tokenService.getAccessToken();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (refreshError) {
      // Refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw refreshError;
    }
  }

  return response;
};
