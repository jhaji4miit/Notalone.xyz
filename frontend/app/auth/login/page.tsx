'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      if (magicLinkMode) {
        await authService.requestMagicLink(data.email);
        toast.success('Magic link sent to your email!');
      } else {
        await authService.login(data.email, data.password);
        toast.success('Logged in successfully!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold mb-6">Sign In</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {!magicLinkMode && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : magicLinkMode ? 'Send Magic Link' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMagicLinkMode(!magicLinkMode)}
                className="text-primary-600 hover:underline text-sm"
              >
                {magicLinkMode
                  ? 'Use password instead'
                  : 'Use magic link instead'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/auth/forgot-password"
                className="text-primary-600 hover:underline text-sm"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary-600 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

