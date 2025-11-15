import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Investment Platform',
  description: 'Welcome to the Investment Platform',
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Investment Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your secure gateway to investment opportunities
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Secure</h2>
            <p className="text-gray-600">
              Bank-level security with KYC/AML compliance
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Easy to Use</h2>
            <p className="text-gray-600">
              Intuitive interface for managing your investments
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Diverse Products</h2>
            <p className="text-gray-600">
              Access to a wide range of investment opportunities
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

