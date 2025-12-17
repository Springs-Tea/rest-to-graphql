'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductsWithReviewsGraphQL } from '@/lib/graphql';
import { ProductCard } from '@/components/ProductCard';
import { StatsCard } from '@/components/StatsCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function GraphQLDemo() {
  const [fetchTriggered, setFetchTriggered] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['graphql-products'],
    queryFn: fetchProductsWithReviewsGraphQL,
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
            <span className="badge-graphql">GraphQL</span>
            <h1 className="text-3xl font-bold">GraphQL Demo</h1>
          </div>
          <p className="text-zinc-400">
            Fetching products with reviews using a single GraphQL query.
            All nested data in one request.
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
            variant="success"
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

      {/* Query Explanation */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Single Query Pattern
        </h2>
        <div className="code-block">
          <pre className="text-zinc-300">
{`query ProductsWithReviews {
  products(first: 10) {
    edges {
      node {
        id
        name
        price
        category
        reviewCount
        averageRating
        reviews {
          id
          rating
          comment
          user {
            id
            name
          }
        }
      }
    }
  }
}

// Total: 1 request (with DataLoader batching on server)`}
          </pre>
        </div>
        {data && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-400 text-sm">
              <strong>Result:</strong> Loaded {data.products.length} products with all their reviews and user data
              in just <strong>{data.requestCount} HTTP request</strong> in {data.totalTime.toFixed(0)}ms.
            </p>
          </div>
        )}
      </div>

      {/* DataLoader Explanation */}
      <div className="card border-indigo-500/20">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          DataLoader: Solving N+1 on the Server
        </h2>
        <p className="text-zinc-400 text-sm mb-4">
          Even though GraphQL resolves fields individually, DataLoader batches and caches database queries
          to prevent the N+1 problem on the server side.
        </p>
        <div className="code-block text-sm">
          <pre className="text-zinc-300">
{`// Without DataLoader (N+1 problem):
SELECT * FROM reviews WHERE product_id = '1'
SELECT * FROM reviews WHERE product_id = '2'
SELECT * FROM reviews WHERE product_id = '3'
...

// With DataLoader (batched):
SELECT * FROM reviews WHERE product_id IN ('1', '2', '3', ...)`}
          </pre>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" label="Fetching data via GraphQL..." />
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
                variant="graphql"
              />
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!fetchTriggered && !isLoading && (
        <div className="card border-dashed border-2 border-zinc-700 flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Ready to Fetch</h3>
          <p className="text-zinc-400 mb-4">Click the &quot;Fetch Data&quot; button to load products using GraphQL</p>
        </div>
      )}
    </div>
  );
}
