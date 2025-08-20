'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthService from '@/services/authService';
import { cookieService } from '@/lib/cookie';

interface VerificationCodeProps {
  email: string;
  onVerificationSuccess: (accessToken?: string) => void;
  onBack: () => void;
}

export default function VerificationCode({
  email,
  onVerificationSuccess,
  onBack,
}: VerificationCodeProps) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last character
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 5);

    if (digits.length > 0) {
      const newCode = ['', '', '', '', ''];
      for (let i = 0; i < digits.length && i < 5; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(digits.length, 4);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 5) {
      setError('Please enter all 5 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.verifyEmail(email, verificationCode);

      // Chỉ lưu accessToken vào cookie (15 phút)
      if (response.accessToken) {
        cookieService.set('accessToken', response.accessToken, 15);
      }

      // Lưu user info vào localStorage (tùy chọn)
      // if (response.user) {
      //   localStorage.setItem('user', JSON.stringify(response.user));
      // }

      // Gọi callback để chuyển step và truyền accessToken
      onVerificationSuccess(response.accessToken);
    } catch (error: any) {
      setError(error?.message || 'Invalid verification code. Please try again.');
      // Clear the code on error
      setCode(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.resendVerificationCode(email);
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      setError(error?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Verify Your Email</CardTitle>
          <p className="text-center text-sm text-gray-600">
            We have sent a 5-digit verification code to
            <br />
            <span className="font-medium">{email}</span>
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-12 w-12 text-center text-lg font-semibold"
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.join('').length !== 5}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Registration
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
