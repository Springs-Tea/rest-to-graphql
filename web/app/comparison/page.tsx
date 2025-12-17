'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductsWithReviewsREST } from '@/lib/api';
import { fetchProductsWithReviewsGraphQL } from '@/lib/graphql';
import { StatsCard } from '@/components/StatsCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface BenchmarkResult {
  requestCount: number;
  totalTime: number;
  productCount: number;
  totalReviews: number;
}

export default function ComparisonPage() {
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [restResults, setRestResults] = useState<BenchmarkResult | null>(null);
  const [graphqlResults, setGraphqlResults] = useState<BenchmarkResult | null>(null);

  const restQuery = useQuery({
    queryKey: ['benchmark-rest'],
    queryFn: async () => {
      const result = await fetchProductsWithReviewsREST();
      return {
        requestCount: result.requestCount,
        totalTime: result.totalTime,
        productCount: result.products.length,
        totalReviews: result.products.reduce((acc, p) => acc + (p.reviewCount || 0), 0),
      };
    },
    enabled: false,
  });

  const graphqlQuery = useQuery({
    queryKey: ['benchmark-graphql'],
    queryFn: async () => {
      const result = await fetchProductsWithReviewsGraphQL();
      return {
        requestCount: result.requestCount,
        totalTime: result.totalTime,
        productCount: result.products.length,
        totalReviews: result.products.reduce((acc, p) => acc + (p.reviewCount || 0), 0),
      };
    },
    enabled: false,
  });

  const runBenchmark = async () => {
    setBenchmarkRunning(true);
    setRestResults(null);
    setGraphqlResults(null);

    try {
      // Run REST benchmark
      const restResult = await restQuery.refetch();
      if (restResult.data) setRestResults(restResult.data);

      // Run GraphQL benchmark
      const graphqlResult = await graphqlQuery.refetch();
      if (graphqlResult.data) setGraphqlResults(graphqlResult.data);
    } finally {
      setBenchmarkRunning(false);
    }
  };

  const getImprovement = (rest: number, graphql: number) => {
    if (rest === 0) return '0';
    return ((1 - graphql / rest) * 100).toFixed(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            REST vs GraphQL Benchmark
          </span>
        </h1>
        <p className="text-zinc-400 mb-6">
          Compare the performance of fetching products with reviews using both approaches.
          Click the button below to run the benchmark.
        </p>
        <button
          onClick={runBenchmark}
          disabled={benchmarkRunning}
          className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"
        >
          {benchmarkRunning ? (
            <>
              <LoadingSpinner size="sm" />
              Running Benchmark...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Benchmark
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {(restResults || graphqlResults) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* REST Results */}
          <div className="card border-orange-500/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="badge-rest">REST</span>
              <h2 className="text-xl font-semibold">REST API Results</h2>
            </div>
            {restResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatsCard label="HTTP Requests" value={restResults.requestCount} variant="warning" />
                  <StatsCard label="Total Time" value={restResults.totalTime.toFixed(0)} unit="ms" />
                  <StatsCard label="Products" value={restResults.productCount} />
                  <StatsCard label="Reviews" value={restResults.totalReviews} />
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-orange-300">
                    Made <strong>{restResults.requestCount}</strong> separate HTTP requests
                    (1 for products + {restResults.productCount} for reviews)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner label="Running REST benchmark..." />
              </div>
            )}
          </div>

          {/* GraphQL Results */}
          <div className="card border-pink-500/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="badge-graphql">GraphQL</span>
              <h2 className="text-xl font-semibold">GraphQL Results</h2>
            </div>
            {graphqlResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatsCard label="HTTP Requests" value={graphqlResults.requestCount} variant="success" />
                  <StatsCard label="Total Time" value={graphqlResults.totalTime.toFixed(0)} unit="ms" />
                  <StatsCard label="Products" value={graphqlResults.productCount} />
                  <StatsCard label="Reviews" value={graphqlResults.totalReviews} />
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-emerald-300">
                    Made just <strong>{graphqlResults.requestCount}</strong> HTTP request
                    with all nested data included
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <LoadingSpinner label="Running GraphQL benchmark..." />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Improvement Summary */}
      {restResults && graphqlResults && (
        <div className="card bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border-indigo-500/20">
          <h2 className="text-xl font-semibold mb-6 text-center">Performance Comparison</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {getImprovement(restResults.requestCount, graphqlResults.requestCount)}%
              </div>
              <p className="text-sm text-zinc-400">Fewer HTTP Requests</p>
              <p className="text-xs text-zinc-500 mt-1">
                {restResults.requestCount} vs {graphqlResults.requestCount}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">
                {restResults.totalTime > graphqlResults.totalTime ? (
                  <>-{getImprovement(restResults.totalTime, graphqlResults.totalTime)}%</>
                ) : (
                  <>+{getImprovement(graphqlResults.totalTime, restResults.totalTime)}%</>
                )}
              </div>
              <p className="text-sm text-zinc-400">
                {restResults.totalTime > graphqlResults.totalTime ? 'Faster' : 'Response Time'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {restResults.totalTime.toFixed(0)}ms vs {graphqlResults.totalTime.toFixed(0)}ms
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">1</div>
              <p className="text-sm text-zinc-400">Single Query</p>
              <p className="text-xs text-zinc-500 mt-1">All nested data in one request</p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 font-medium text-zinc-400">Feature</th>
                <th className="text-center py-3 px-4 font-medium text-orange-400">REST</th>
                <th className="text-center py-3 px-4 font-medium text-pink-400">GraphQL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td className="py-3 px-4 text-zinc-300">Data Fetching</td>
                <td className="py-3 px-4 text-center text-zinc-400">Multiple endpoints</td>
                <td className="py-3 px-4 text-center text-zinc-400">Single endpoint</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Request Pattern</td>
                <td className="py-3 px-4 text-center text-zinc-400">N+1 requests</td>
                <td className="py-3 px-4 text-center text-zinc-400">1 request</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Over-fetching</td>
                <td className="py-3 px-4 text-center text-amber-400">Common</td>
                <td className="py-3 px-4 text-center text-emerald-400">Minimal</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Under-fetching</td>
                <td className="py-3 px-4 text-center text-amber-400">Requires extra calls</td>
                <td className="py-3 px-4 text-center text-emerald-400">Resolved in query</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Caching</td>
                <td className="py-3 px-4 text-center text-emerald-400">HTTP cache friendly</td>
                <td className="py-3 px-4 text-center text-amber-400">Needs client-side cache</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Learning Curve</td>
                <td className="py-3 px-4 text-center text-emerald-400">Low</td>
                <td className="py-3 px-4 text-center text-amber-400">Medium</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Pagination</td>
                <td className="py-3 px-4 text-center text-zinc-400">Offset-based</td>
                <td className="py-3 px-4 text-center text-zinc-400">Cursor-based</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-zinc-300">Real-time</td>
                <td className="py-3 px-4 text-center text-zinc-400">WebSocket/SSE</td>
                <td className="py-3 px-4 text-center text-zinc-400">Subscriptions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Conclusion */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">When to Use What?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-orange-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full" />
              Use REST when...
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Simple CRUD operations
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                HTTP caching is important
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Public APIs with predictable usage
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Team is familiar with REST
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-pink-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-400 rounded-full" />
              Use GraphQL when...
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Complex, nested data requirements
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Multiple clients with different needs
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Reducing over/under-fetching
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Rapid frontend development
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
