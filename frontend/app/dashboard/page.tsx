'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  wallet: {
    balance: number;
    currency: string;
  };
  portfolio: {
    portfolios: any[];
    summary: {
      totalInvestments: number;
      totalValue: number;
      currency: string;
    };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [walletRes, portfolioRes] = await Promise.all([
          api.get('/wallet/balance'),
          api.get('/portfolio'),
        ]);

        setData({
          wallet: walletRes.data,
          portfolio: portfolioRes.data,
        });
      } catch (error) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <p>Loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Wallet Balance</h2>
              <p className="text-3xl font-bold text-primary-600">
                {data?.wallet.balance.toFixed(2)} {data?.wallet.currency}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/wallet/deposit"
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Deposit
                </Link>
                <Link
                  href="/wallet/withdraw"
                  className="border border-primary-600 text-primary-600 px-4 py-2 rounded hover:bg-primary-50"
                >
                  Withdraw
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
              <p className="text-3xl font-bold text-primary-600">
                {data?.portfolio.summary.totalValue.toFixed(2)}{' '}
                {data?.portfolio.summary.currency}
              </p>
              <p className="text-gray-600 mt-2">
                {data?.portfolio.summary.totalInvestments} active investments
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/products"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <h3 className="font-semibold">Browse Products</h3>
                <p className="text-sm text-gray-600">Discover investment opportunities</p>
              </Link>
              <Link
                href="/portfolio"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <h3 className="font-semibold">View Portfolio</h3>
                <p className="text-sm text-gray-600">Manage your investments</p>
              </Link>
              <Link
                href="/profile"
                className="p-4 border rounded-lg hover:bg-gray-50 text-center"
              >
                <h3 className="font-semibold">Update Profile</h3>
                <p className="text-sm text-gray-600">Complete your profile</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

