import axiosClient from '@/lib/axiosClient';
import { RegisterFormData, LoginFormData } from '@/lib/validations/auth.schema';
import { tokenService } from './tokenService';

class AuthService {
  async register(data: RegisterFormData) {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginFormData) {
    const response = await axiosClient.post('/auth/login', data);

    // Store tokens in cookies if login is successful
    if (response.data.access_token) {
      tokenService.setAccessToken(response.data.access_token);

      if (response.data.refresh_token) {
        tokenService.setRefreshToken(response.data.refresh_token);
      }
    }

    return response.data;
  }

  async logout() {
    try {
      // Call logout endpoint if available
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens from cookies
      tokenService.clearTokens();
    }
  }

  async refreshTokens() {
    try {
      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken || tokenService.isTokenExpired(refreshToken)) {
        throw new Error('No valid refresh token available');
      }

      const response = await axiosClient.post('/auth/refresh-token', {
        refresh_token: refreshToken,
      });

      // Store new tokens
      if (response.data.access_token) {
        tokenService.setAccessToken(response.data.access_token);

        if (response.data.refresh_token) {
          tokenService.setRefreshToken(response.data.refresh_token);
        }
      }

      return response.data;
    } catch (error) {
      // Clear tokens if refresh fails
      tokenService.clearTokens();
      throw error;
    }
  }

  async verifyEmail(email: string, code: string) {
    const response = await axiosClient.post('/auth/verify-email', {
      email,
      verificationCode: code,
    });
    return response.data;
  }

  async resendVerificationCode(email: string) {
    const response = await axiosClient.post('/auth/resend-verification', {
      email,
    });
    return response.data;
  }

  // Get current user from token
  getCurrentUser() {
    return tokenService.getUserFromToken();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return tokenService.isAccessTokenValid();
  }

  // Get current access token
  getAccessToken() {
    return tokenService.getAccessToken();
  }

  // Check if token needs refresh
  shouldRefreshToken() {
    return tokenService.shouldRefreshToken();
  }
}

export default new AuthService();
