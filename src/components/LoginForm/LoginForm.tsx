'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import AuthService from '@/services/authService';
import OAuthService from '@/services/oauthService';
import { useAuth } from '@/hooks/useAuth';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const router = useRouter();
  const { login, error: authError } = useAuth();

  // Clear submit error when auth error changes (successful login)
  useEffect(() => {
    if (!authError && submitError) {
      setSubmitError(null);
    }
  }, [authError, submitError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login data:', data);
    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await AuthService.login(data);
      console.log('Login success:', result);

      const accessToken = result.accessToken;

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Use the login function from useAuth hook (Redux) to update state
      await login(accessToken);

      // Redirect về trang chủ
      router.push('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error?.message || 'Login failed. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setOauthLoading('google');
    OAuthService.initiateGoogleAuth();
  };

  const handleFacebookLogin = () => {
    setOauthLoading('facebook');
    OAuthService.initiateFacebookAuth();
  };

  const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.8V14.4H17.5C17.1 16.3 15.2 18.4 12 18.4C8.6 18.4 6 15.8 6 12.4C6 9 8.6 6.4 12 6.4C13.8 6.4 15.1 7.1 15.9 7.8L18.4 5.3C16.8 3.9 14.6 3 12 3C6.9 3 2.8 7.1 2.8 12.2C2.8 17.3 6.9 21.4 12 21.4C17.1 21.4 21.2 17.3 21.2 12.2C21.2 11.5 21.1 10.9 21 10.2H12Z"
      />
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
      <path
        fill="currentColor"
        d="M22.675 0h-21.35C.596 0 0 .597 0 1.333v21.333C0 23.403.596 24 1.325 24h11.494v-9.294H9.69V11.14h3.129V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.466.098 2.798.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.31h3.59l-.467 3.566h-3.123V24h6.116c.73 0 1.325-.597 1.325-1.334V1.333C24 .597 23.405 0 22.675 0z"
      />
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Sign In to Your Account</CardTitle>
          <p className="text-center text-sm text-gray-600">
            Welcome back! Please enter your details
          </p>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{submitError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={handleGoogleLogin}
                disabled={oauthLoading === 'google'}
              >
                {oauthLoading === 'google' ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                ) : (
                  <GoogleIcon />
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={handleFacebookLogin}
                disabled={oauthLoading === 'facebook'}
              >
                {oauthLoading === 'facebook' ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                ) : (
                  <FacebookIcon />
                )}
                Facebook
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
