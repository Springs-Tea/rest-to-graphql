'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductsWithReviewsREST } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { StatsCard } from '@/components/StatsCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function RestDemo() {
  const [fetchTriggered, setFetchTriggered] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rest-products'],
    queryFn: fetchProductsWithReviewsREST,
    enabled: fetchTriggered,
    refetchOnMount: false,
  });

  const handleFetch = () => {
    setFetchTriggered(true);
    refetch();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="badge-rest">REST API</span>
            <h1 className="text-3xl font-bold">REST Demo</h1>
          </div>
          <p className="text-zinc-400">
            Fetching products with reviews using traditional REST endpoints.
            Notice the N+1 request pattern.
          </p>
        </div>
        <button onClick={handleFetch} className="btn-primary whitespace-nowrap" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Requests"
            value={data.requestCount}
            variant="warning"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            }
          />
          <StatsCard
            label="Response Time"
            value={data.totalTime.toFixed(0)}
            unit="ms"
            variant={data.totalTime < 500 ? 'success' : 'warning'}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            label="Products Loaded"
            value={data.products.length}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatsCard
            label="Total Reviews"
            value={data.products.reduce((acc, p) => acc + (p.reviewCount || 0), 0)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Request Pattern Explanation */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          N+1 Request Pattern
        </h2>
        <div className="code-block">
          <pre className="text-zinc-300">
{`// Step 1: Fetch all products (1 request)
GET /api/products

// Step 2: For each product, fetch reviews (N requests)
GET /api/reviews?productId={product1.id}
GET /api/reviews?productId={product2.id}
GET /api/reviews?productId={product3.id}
...

// Total: 1 + N requests`}
          </pre>
        </div>
        {data && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-sm">
              <strong>Result:</strong> To load {data.products.length} products with their reviews,
              we made <strong>{data.requestCount} HTTP requests</strong> in {data.totalTime.toFixed(0)}ms.
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" label="Fetching data via REST..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card border-red-500/30 bg-red-500/5">
          <p className="text-red-400">Error loading data. Make sure the API is running.</p>
        </div>
      )}

      {/* Products Grid */}
      {data && (
        <div>
          <h2 className="font-semibold text-xl mb-4">Products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                reviewCount={product.reviewCount}
                averageRating={product.averageRating}
                variant="rest"
              />
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!fetchTriggered && !isLoading && (
        <div className="card border-dashed border-2 border-zinc-700 flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Ready to Fetch</h3>
          <p className="text-zinc-400 mb-4">Click the &quot;Fetch Data&quot; button to load products using REST API</p>
        </div>
      )}
    </div>
  );
}
