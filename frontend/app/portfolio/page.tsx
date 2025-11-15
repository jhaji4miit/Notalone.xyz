'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';

interface PortfolioItem {
  id: string;
  amount: number;
  currency: string;
  purchasePrice: number;
  currentValue: number;
  purchasedAt: string;
  product: {
    id: string;
    name: string;
    riskLevel: string;
  };
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<{
    portfolios: PortfolioItem[];
    summary: {
      totalInvestments: number;
      totalValue: number;
      currency: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const response = await api.get('/portfolio');
        setPortfolio(response.data);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>

          {loading ? (
            <p>Loading portfolio...</p>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Investments</p>
                    <p className="text-2xl font-bold">
                      {portfolio?.summary.totalInvestments || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {portfolio?.summary.totalValue.toFixed(2) || '0.00'}{' '}
                      {portfolio?.summary.currency}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Investments</h2>
                </div>
                {portfolio?.portfolios.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <p>No investments yet.</p>
                    <a
                      href="/products"
                      className="text-primary-600 hover:underline mt-2 inline-block"
                    >
                      Browse products to get started
                    </a>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Current Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Purchase Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {portfolio?.portfolios.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium">
                                  {item.product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.product.riskLevel}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.amount.toFixed(2)} {item.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.currentValue.toFixed(2)} {item.currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.purchasedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

