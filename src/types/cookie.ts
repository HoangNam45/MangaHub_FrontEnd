export interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export interface CookieRemoveOptions {
  path?: string;
  domain?: string;
}

export type CookieValue = string | number | boolean | object;
