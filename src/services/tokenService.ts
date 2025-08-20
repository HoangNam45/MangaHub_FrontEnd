import jwt from 'jsonwebtoken';
import { cookieService } from '@/lib/cookie';
import { TokenPayload, User } from '@/types/auth';

class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_MINUTES = 60 * 24; // 24 hours for access token
  private readonly REFRESH_TOKEN_EXPIRY_MINUTES = 60 * 24 * 7; // 7 days for refresh token

  /**
   * Dispatch custom event for cross-tab synchronization
   */
  private dispatchTokenChangeEvent(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('token-sync'));
    }
  }

  /**
   * Store access token in cookie
   */
  setAccessToken(token: string): void {
    cookieService.set(this.ACCESS_TOKEN_KEY, token, this.TOKEN_EXPIRY_MINUTES, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: false, // Set to true if you want to prevent XSS, but you'll need server-side handling
    });
    this.dispatchTokenChangeEvent();
  }

  /**
   * Store refresh token in cookie
   */
  setRefreshToken(token: string): void {
    cookieService.set(this.REFRESH_TOKEN_KEY, token, this.REFRESH_TOKEN_EXPIRY_MINUTES, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: false,
    });
    this.dispatchTokenChangeEvent();
  }

  /**
   * Get access token from cookie
   */
  getAccessToken(): string | null {
    return cookieService.get(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from cookie
   */
  getRefreshToken(): string | null {
    return cookieService.get(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Remove access token from cookie
   */
  removeAccessToken(): void {
    cookieService.remove(this.ACCESS_TOKEN_KEY);
    this.dispatchTokenChangeEvent();
  }

  /**
   * Remove refresh token from cookie
   */
  removeRefreshToken(): void {
    cookieService.remove(this.REFRESH_TOKEN_KEY);
    this.dispatchTokenChangeEvent();
  }

  /**
   * Remove all tokens from cookies
   */
  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    // Only dispatch once for both removals
  }

  /**
   * Decode JWT token
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Date.now() / 1000;
      // Add 5 minutes buffer to prevent edge cases
      return decoded.exp < currentTime + 300;
    } catch (error) {
      return true;
    }
  }

  /**
   * Check if access token is valid and not expired
   */
  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /**
   * Check if refresh token is valid and not expired
   */
  isRefreshTokenValid(): boolean {
    const token = this.getRefreshToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /**
   * Get user data from access token
   */
  getUserFromToken(): User | null {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      isEmailVerified: decoded.isEmailVerified,
    };
  }

  /**
   * Get token expiration time in milliseconds
   */
  getTokenExpirationTime(token: string): number | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    return decoded.exp * 1000; // Convert to milliseconds
  }

  /**
   * Get time remaining until token expires (in milliseconds)
   */
  getTimeUntilExpiration(token: string): number | null {
    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) return null;

    const now = Date.now();
    return Math.max(0, expirationTime - now);
  }

  /**
   * Store both access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    // Event is already dispatched by individual setters
  }

  /**
   * Get current authentication state
   */
  getAuthState(): {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  } {
    const token = this.getAccessToken();

    if (!token || this.isTokenExpired(token)) {
      this.clearTokens(); // Clean up expired tokens
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    const user = this.getUserFromToken();
    return {
      isAuthenticated: true,
      user,
      token,
    };
  }

  /**
   * Check if token needs refresh (expires in next 5 minutes)
   */
  shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const timeUntilExpiration = this.getTimeUntilExpiration(token);
    if (!timeUntilExpiration) return true;

    // Refresh if token expires in next 5 minutes (300000 ms)
    return timeUntilExpiration < 300000;
  }

  /**
   * Set token with custom expiration
   */
  setAccessTokenWithExpiration(token: string, expirationMinutes: number): void {
    cookieService.set(this.ACCESS_TOKEN_KEY, token, expirationMinutes, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: false,
    });
    this.dispatchTokenChangeEvent();
  }

  /**
   * Get all token information for debugging
   */
  getTokenInfo(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    accessTokenExpired: boolean;
    refreshTokenExpired: boolean;
    accessTokenPayload: TokenPayload | null;
    refreshTokenPayload: TokenPayload | null;
  } {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpired: accessToken ? this.isTokenExpired(accessToken) : true,
      refreshTokenExpired: refreshToken ? this.isTokenExpired(refreshToken) : true,
      accessTokenPayload: accessToken ? this.decodeToken(accessToken) : null,
      refreshTokenPayload: refreshToken ? this.decodeToken(refreshToken) : null,
    };
  }
}

export const tokenService = new TokenService();
export default tokenService;
