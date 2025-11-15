'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';

interface SignupForm {
  email: string;
  password?: string;
  otp?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      if (!emailSent) {
        await authService.signup(data.email, data.password);
        setEmail(data.email);
        setEmailSent(true);
        toast.success('OTP sent to your email!');
      } else {
        await authService.verifyEmail(email, data.otp!);
        toast.success('Email verified! Please login.');
        router.push('/auth/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
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
            <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!emailSent ? (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
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
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium mb-1"
                    >
                      Password (Optional - can use magic link)
                    </label>
                    <input
                      id="password"
                      type="password"
                      {...register('password', {
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <p className="mb-4 text-sm text-gray-600">
                    We've sent an OTP to {email}. Please enter it below.
                  </p>
                  <label htmlFor="otp" className="block text-sm font-medium mb-1">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    {...register('otp', {
                      required: 'OTP is required',
                      minLength: { value: 6, message: 'OTP must be 6 digits' },
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  {errors.otp && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading
                  ? 'Loading...'
                  : emailSent
                  ? 'Verify Email'
                  : 'Sign Up'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:underline">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

