'use client';

interface ProductCardProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  reviewCount?: number;
  averageRating?: number | null;
  variant?: 'rest' | 'graphql';
}

export function ProductCard({
  name,
  description,
  price,
  category,
  reviewCount = 0,
  averageRating,
  variant = 'rest',
}: ProductCardProps) {
  const badgeClass = variant === 'rest' ? 'badge-rest' : 'badge-graphql';
  const accentColor = variant === 'rest' ? 'orange' : 'pink';

  return (
    <div className="card group hover:border-zinc-700 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className={badgeClass}>{category}</span>
        {averageRating !== undefined && averageRating !== null && (
          <div className="flex items-center gap-1">
            <svg className={`w-4 h-4 text-${accentColor}-400`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-zinc-300">
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-indigo-400 transition-colors">
        {name}
      </h3>

      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
        {description || 'No description available'}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          ${price.toFixed(2)}
        </span>
        <span className="text-sm text-zinc-500">
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    </div>
  );
}
