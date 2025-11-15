import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Investment Platform - Secure Investment Management',
  description: 'A secure and user-friendly investment platform for managing your portfolio and discovering investment opportunities.',
  keywords: ['investment', 'portfolio', 'finance', 'wealth management'],
  authors: [{ name: 'Investment Platform' }],
  openGraph: {
    title: 'Investment Platform',
    description: 'Secure Investment Management Platform',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

