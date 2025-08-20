import { CookieOptions, CookieValue, CookieRemoveOptions } from '@/types/cookie';

class CookieService {
  private defaultOptions: CookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  /**
   * Set a cookie with specified name, value, and expiration time
   */
  set(name: string, value: string, minutes: number = 60, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return; // SSR check

    const expires = new Date();
    expires.setTime(expires.getTime() + minutes * 60 * 1000);

    const cookieOptions = { ...this.defaultOptions, ...options };

    let cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()}`;

    if (cookieOptions.path) cookieString += `;path=${cookieOptions.path}`;
    if (cookieOptions.domain) cookieString += `;domain=${cookieOptions.domain}`;
    if (cookieOptions.secure) cookieString += ';secure';
    if (cookieOptions.sameSite) cookieString += `;samesite=${cookieOptions.sameSite}`;
    if (cookieOptions.httpOnly) cookieString += ';httponly';

    document.cookie = cookieString;
  }

  /**
   * Get cookie value by name
   */
  get(name: string): string | null {
    if (typeof document === 'undefined') return null; // SSR check

    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Check if a cookie exists
   */
  has(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Delete a cookie by name
   */
  remove(name: string, options: CookieRemoveOptions = {}): void {
    if (typeof document === 'undefined') return; // SSR check

    const cookieOptions = { ...this.defaultOptions, ...options };

    let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC`;

    if (cookieOptions.path) cookieString += `;path=${cookieOptions.path}`;
    if (cookieOptions.domain) cookieString += `;domain=${cookieOptions.domain}`;

    document.cookie = cookieString;
  }

  /**
   * Get all cookies as an object
   */
  getAll(): Record<string, string> {
    if (typeof document === 'undefined') return {}; // SSR check

    const cookies: Record<string, string> = {};

    if (document.cookie) {
      document.cookie.split(';').forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      });
    }

    return cookies;
  }

  /**
   * Clear all cookies
   */
  clear(): void {
    const cookies = this.getAll();
    Object.keys(cookies).forEach((name) => {
      this.remove(name);
    });
  }

  /**
   * Set cookie with JSON value
   */
  setJSON(
    name: string,
    value: CookieValue,
    minutes: number = 60,
    options: CookieOptions = {}
  ): void {
    try {
      const jsonString = JSON.stringify(value);
      this.set(name, jsonString, minutes, options);
    } catch (error) {
      console.error('Error setting JSON cookie:', error);
    }
  }

  /**
   * Get cookie with JSON value
   */
  getJSON<T = any>(name: string): T | null {
    const value = this.get(name);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing JSON cookie:', error);
      return null;
    }
  }

  /**
   * Set cookie with custom expiration date
   */
  setWithDate(
    name: string,
    value: string,
    expirationDate: Date,
    options: CookieOptions = {}
  ): void {
    if (typeof document === 'undefined') return;

    const cookieOptions = { ...this.defaultOptions, ...options };

    let cookieString = `${name}=${encodeURIComponent(value)};expires=${expirationDate.toUTCString()}`;

    if (cookieOptions.path) cookieString += `;path=${cookieOptions.path}`;
    if (cookieOptions.domain) cookieString += `;domain=${cookieOptions.domain}`;
    if (cookieOptions.secure) cookieString += ';secure';
    if (cookieOptions.sameSite) cookieString += `;samesite=${cookieOptions.sameSite}`;

    document.cookie = cookieString;
  }

  /**
   * Set session cookie (expires when browser closes)
   */
  setSession(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    const cookieOptions = { ...this.defaultOptions, ...options };

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (cookieOptions.path) cookieString += `;path=${cookieOptions.path}`;
    if (cookieOptions.domain) cookieString += `;domain=${cookieOptions.domain}`;
    if (cookieOptions.secure) cookieString += ';secure';
    if (cookieOptions.sameSite) cookieString += `;samesite=${cookieOptions.sameSite}`;

    document.cookie = cookieString;
  }

  /**
   * Check if cookies are enabled in the browser
   */
  isEnabled(): boolean {
    if (typeof document === 'undefined') return false;

    try {
      const testKey = 'cookie_test';
      this.set(testKey, 'test', 1);
      const result = this.get(testKey) === 'test';
      this.remove(testKey);
      return result;
    } catch {
      return false;
    }
  }
}

export const cookieService = new CookieService();
