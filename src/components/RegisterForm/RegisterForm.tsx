'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import AuthService from '@/services/authService';
import OAuthService from '@/services/oauthService';
import VerificationCode from '@/components/VerificationCode/VerificationCode';
import { useAuth } from '@/hooks/useAuth';

type FormStep = 'register' | 'verify' | 'success';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const result = await AuthService.register(data);

      setUserEmail(data.email);
      setCurrentStep('verify');
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (accessToken?: string) => {
    try {
      if (accessToken) {
        // Auto-login the user with the token from verification
        await login(accessToken);

        // Redirect to home page
        router.push('/');
      } else {
        // Fallback: try to get token from auth service
        const storedToken = AuthService.getAccessToken();

        if (storedToken) {
          await login(storedToken);

          router.push('/');
        } else {
          console.error('No access token found after verification');
          setCurrentStep('success');
        }
      }
    } catch (error) {
      console.error('Auto-login failed after verification:', error);
      // Fallback to success step if auto-login fails
      setCurrentStep('success');
    }
  };

  const handleBackToRegister = () => {
    setCurrentStep('register');
    setUserEmail('');
    setSubmitError(null);
  };

  const handleGoogleRegister = () => {
    setOauthLoading('google');
    OAuthService.initiateGoogleAuth();
  };

  const handleFacebookRegister = () => {
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

  // Show verification code input
  if (currentStep === 'verify') {
    return (
      <VerificationCode
        email={userEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToRegister}
      />
    );
  }

  // Show success message (fallback if auto-login fails)
  if (currentStep === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl text-green-600">
              Registration Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600">
                Your email has been verified successfully!
                <br />
                Please sign in to your account.
              </p>
            </div>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show registration form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{submitError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

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

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Or continue with</span>
          </div>
          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-1/2"
              onClick={handleGoogleRegister}
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
              onClick={handleFacebookRegister}
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
        </CardContent>
      </Card>
    </div>
  );
}
