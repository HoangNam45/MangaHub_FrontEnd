export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
