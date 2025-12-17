import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'REST vs GraphQL Comparison',
  description: 'A proof of concept demonstrating the differences between REST and GraphQL APIs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
