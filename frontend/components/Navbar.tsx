'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/auth';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Investment Platform
          </Link>

          <div className="flex items-center gap-4">
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Products
                </Link>
                <Link
                  href="/portfolio"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Portfolio
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-primary-600"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

