import { cookieService } from '@/lib/cookie';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'local' | 'google' | 'facebook';
}

export class AuthUtils {
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = cookieService.get('accessToken');
    const user = this.getCurrentUser();

    return !!token && !!user;
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static logout(): void {
    if (typeof window === 'undefined') return;

    cookieService.remove('accessToken');
    localStorage.removeItem('user');

    // Redirect to login
    window.location.href = '/login';
  }

  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    return cookieService.get('accessToken');
  }

  static setAuthData(token: string, user: User): void {
    if (typeof window === 'undefined') return;

    cookieService.set('accessToken', token, 15); // 15 minutes
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default AuthUtils;
