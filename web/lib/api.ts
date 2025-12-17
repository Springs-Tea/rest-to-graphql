const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
  userId: string;
  productId: string;
}

export interface ProductWithReviews extends Product {
  reviews: (Review & { user: User })[];
  averageRating?: number;
  reviewCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// REST API calls
export const restApi = {
  // Products
  async getProducts(limit = 10, offset = 0): Promise<PaginatedResponse<Product>> {
    const res = await fetch(`${API_URL}/api/products?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async getProductWithReviews(id: string): Promise<ProductWithReviews> {
    const res = await fetch(`${API_URL}/api/products/${id}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch product with reviews');
    return res.json();
  },

  // Users
  async getUsers(limit = 10, offset = 0): Promise<PaginatedResponse<User>> {
    const res = await fetch(`${API_URL}/api/users?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getUser(id: string): Promise<User> {
    const res = await fetch(`${API_URL}/api/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Reviews
  async getReviews(limit = 10, offset = 0): Promise<PaginatedResponse<Review>> {
    const res = await fetch(`${API_URL}/api/reviews?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async getProductReviews(productId: string): Promise<PaginatedResponse<Review>> {
    const res = await fetch(`${API_URL}/api/reviews?productId=${productId}`);
    if (!res.ok) throw new Error('Failed to fetch product reviews');
    return res.json();
  },
};

// Fetch multiple products with reviews (REST way - N+1 pattern)
export async function fetchProductsWithReviewsREST(): Promise<{
  products: ProductWithReviews[];
  requestCount: number;
  totalTime: number;
}> {
  const startTime = performance.now();
  let requestCount = 0;

  // First request: Get all products
  requestCount++;
  const productsRes = await restApi.getProducts(10);
  const products = productsRes.data;

  // N more requests: Get reviews for each product
  const productsWithReviews = await Promise.all(
    products.map(async (product) => {
      requestCount++;
      const reviewsRes = await restApi.getProductReviews(product.id);
      const reviews = reviewsRes.data;

      // Calculate stats
      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 0;

      return {
        ...product,
        reviews: reviews as (Review & { user: User })[],
        reviewCount,
        averageRating,
      };
    })
  );

  const totalTime = performance.now() - startTime;

  return {
    products: productsWithReviews,
    requestCount,
    totalTime,
  };
}
