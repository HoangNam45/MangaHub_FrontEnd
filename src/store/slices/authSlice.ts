import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types/auth';
import { tokenService } from '@/services/tokenService';
import authService from '@/services/authService';

// Load initial state from cookies using token service
const loadAuthFromStorage = (): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  try {
    return tokenService.getAuthState();
  } catch (error) {
    console.error('Error loading auth from storage:', error);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

const initialState: AuthState = {
  ...loadAuthFromStorage(),
  isLoading: false,
  error: null,
};

// Async thunk for login with token decode
export const loginWithToken = createAsyncThunk(
  'auth/loginWithToken',
  async (token: string, { rejectWithValue }) => {
    try {
      if (tokenService.isTokenExpired(token)) {
        throw new Error('Token has expired');
      }

      const decoded = tokenService.decodeToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        isEmailVerified: decoded.isEmailVerified,
      };

      // Save to cookies using token service
      tokenService.setAccessToken(token);

      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  // Clear tokens from cookies
  tokenService.clearTokens();
  return null;
});

// Async thunk for refreshing token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = tokenService.getRefreshToken();
      if (!refreshTokenValue || tokenService.isTokenExpired(refreshTokenValue)) {
        throw new Error('No valid refresh token available');
      }

      // Here you would typically make an API call to refresh the token
      // For now, we'll just check if the current access token is still valid
      // const currentToken = tokenService.getAccessToken();
      // if (currentToken && !tokenService.isTokenExpired(currentToken)) {
      //   const user = tokenService.getUserFromToken();
      //   return { user, token: currentToken };
      // }

      // Sử dụng authService để refresh token
      const result = await authService.refreshTokens();

      // Lưu token mới
      tokenService.setAccessToken(result.accessToken);
      // if (result.refreshToken) {
      //   tokenService.setRefreshToken(result.refreshToken);
      // }

      // Decode user từ token mới
      const user = tokenService.getUserFromToken();

      return { user, token: result.accessToken };

      throw new Error('Token refresh failed');
    } catch (error: any) {
      tokenService.clearTokens();
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// Async thunk for initializing auth state from cookies
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const authState = tokenService.getAuthState();
  return authState;
});

// Async thunk for clearing expired tokens
export const clearExpiredTokens = createAsyncThunk('auth/clearExpiredTokens', async () => {
  tokenService.clearTokens();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    checkTokenExpiration: (state) => {
      if (state.token && tokenService.isTokenExpired(state.token)) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Token đã hết hạn, cần dispatch clearExpiredTokens để clear cookies
        // Không thể gọi trực tiếp ở đây vì đây là reducer
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with token
      .addCase(loginWithToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithToken.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // Initialize auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isLoading = false;
      })

      // Clear expired tokens
      .addCase(clearExpiredTokens.fulfilled, (_state) => {
        // State đã được clear trong checkTokenExpiration reducer
        // Thunk này chỉ để clear cookies
      });
  },
});

export const { clearError, setLoading, checkTokenExpiration } = authSlice.actions;
export default authSlice.reducer;
