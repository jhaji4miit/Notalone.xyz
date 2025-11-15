'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  minInvestment: number;
  maxInvestment?: number;
  currency: string;
  expectedReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Investment Products</h1>

          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Min Investment:</span>
                      <span className="text-sm font-medium">
                        {product.minInvestment} {product.currency}
                      </span>
                    </div>
                    {product.expectedReturn && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expected Return:</span>
                        <span className="text-sm font-medium">
                          {product.expectedReturn}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Risk Level:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getRiskColor(
                          product.riskLevel
                        )}`}
                      >
                        {product.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full bg-primary-600 text-white text-center py-2 rounded hover:bg-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

