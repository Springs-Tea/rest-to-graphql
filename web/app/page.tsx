import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-400 mb-6">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Proof of Concept
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            REST vs GraphQL
          </span>
        </h1>

        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
          A comprehensive comparison of REST and GraphQL API architectures.
          Explore the differences in data fetching, request patterns, and performance.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/comparison" className="btn-primary inline-flex items-center gap-2 text-lg px-6 py-3">
            View Comparison
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link href="/rest" className="btn-secondary inline-flex items-center gap-2 text-lg px-6 py-3">
            Explore Demos
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="card group hover:border-orange-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2">REST API</h3>
          <p className="text-zinc-400 text-sm">
            Traditional resource-based architecture with multiple endpoints. Simple and widely adopted.
          </p>
          <Link href="/rest" className="inline-block mt-4 text-orange-400 text-sm hover:underline">
            View REST Demo
          </Link>
        </div>

        <div className="card group hover:border-pink-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2">GraphQL</h3>
          <p className="text-zinc-400 text-sm">
            Query language for APIs with a single endpoint. Request exactly what you need.
          </p>
          <Link href="/graphql" className="inline-block mt-4 text-pink-400 text-sm hover:underline">
            View GraphQL Demo
          </Link>
        </div>

        <div className="card group hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2">Comparison</h3>
          <p className="text-zinc-400 text-sm">
            Side-by-side benchmark showing request counts, response times, and data efficiency.
          </p>
          <Link href="/comparison" className="inline-block mt-4 text-indigo-400 text-sm hover:underline">
            View Comparison
          </Link>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mt-16 pt-8 border-t border-zinc-800 w-full max-w-5xl">
        <p className="text-center text-sm text-zinc-500 mb-4">Built with</p>
        <div className="flex flex-wrap justify-center gap-4">
          {['Fastify', 'GraphQL Yoga', 'Prisma', 'Next.js 14', 'TypeScript', 'PostgreSQL'].map((tech) => (
            <span key={tech} className="px-3 py-1.5 bg-zinc-800/50 rounded-lg text-sm text-zinc-400 border border-zinc-700">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
