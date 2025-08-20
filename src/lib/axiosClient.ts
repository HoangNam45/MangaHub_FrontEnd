import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { tokenService } from '@/services/tokenService';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MANGA_HUB_API_URL,
  withCredentials: true,
});

// Flag to prevent infinite loops during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add access token to headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token && !tokenService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefreshToken();

        if (!refreshToken || tokenService.isTokenExpired(refreshToken)) {
          throw new Error('No valid refresh token');
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_MANGA_HUB_API_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store new tokens
        tokenService.setAccessToken(access_token);
        if (newRefreshToken) {
          tokenService.setRefreshToken(newRefreshToken);
        }

        // Update the failed request with new token
        if (originalRequest && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);

        // Retry the original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Clear tokens and redirect to login
        tokenService.clearTokens();

        // You might want to dispatch a logout action or redirect here
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      console.error('API error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response from API:', error.request);
    } else {
      console.error('Axios error:', error.message);
    }

    // Return a proper error object
    const errorMessage = error.response?.data || {
      message: error.message || 'Unknown error occurred',
    };
    return Promise.reject(errorMessage);
  }
);

export default axiosClient;
