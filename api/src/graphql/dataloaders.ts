import DataLoader from 'dataloader';
import prisma from '../db/prisma.js';
import type { User, Product, Review } from '@prisma/client';

// User DataLoader - batches user fetches by ID
export const createUserLoader = () => {
  return new DataLoader<string, User | null>(async (userIds) => {
    console.log(`[DataLoader] Batching ${userIds.length} user(s): ${userIds.join(', ')}`);

    const users = await prisma.user.findMany({
      where: {
        id: { in: [...userIds] },
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return userIds.map((id) => userMap.get(id) || null);
  });
};

// Product DataLoader - batches product fetches by ID
export const createProductLoader = () => {
  return new DataLoader<string, Product | null>(async (productIds) => {
    console.log(`[DataLoader] Batching ${productIds.length} product(s): ${productIds.join(', ')}`);

    const products = await prisma.product.findMany({
      where: {
        id: { in: [...productIds] },
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    return productIds.map((id) => productMap.get(id) || null);
  });
};

// Reviews by User ID DataLoader
export const createReviewsByUserLoader = () => {
  return new DataLoader<string, Review[]>(async (userIds) => {
    console.log(`[DataLoader] Batching reviews for ${userIds.length} user(s)`);

    const reviews = await prisma.review.findMany({
      where: {
        userId: { in: [...userIds] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviewMap = new Map<string, Review[]>();
    userIds.forEach((id) => reviewMap.set(id, []));
    reviews.forEach((review) => {
      const existing = reviewMap.get(review.userId) || [];
      existing.push(review);
      reviewMap.set(review.userId, existing);
    });

    return userIds.map((id) => reviewMap.get(id) || []);
  });
};

// Reviews by Product ID DataLoader
export const createReviewsByProductLoader = () => {
  return new DataLoader<string, Review[]>(async (productIds) => {
    console.log(`[DataLoader] Batching reviews for ${productIds.length} product(s)`);

    const reviews = await prisma.review.findMany({
      where: {
        productId: { in: [...productIds] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviewMap = new Map<string, Review[]>();
    productIds.forEach((id) => reviewMap.set(id, []));
    reviews.forEach((review) => {
      const existing = reviewMap.get(review.productId) || [];
      existing.push(review);
      reviewMap.set(review.productId, existing);
    });

    return productIds.map((id) => reviewMap.get(id) || []);
  });
};

// Review count by Product ID DataLoader
export const createReviewCountByProductLoader = () => {
  return new DataLoader<string, number>(async (productIds) => {
    console.log(`[DataLoader] Batching review counts for ${productIds.length} product(s)`);

    const counts = await prisma.review.groupBy({
      by: ['productId'],
      where: {
        productId: { in: [...productIds] },
      },
      _count: {
        id: true,
      },
    });

    const countMap = new Map(counts.map((c) => [c.productId, c._count.id]));
    return productIds.map((id) => countMap.get(id) || 0);
  });
};

// Review count by User ID DataLoader
export const createReviewCountByUserLoader = () => {
  return new DataLoader<string, number>(async (userIds) => {
    console.log(`[DataLoader] Batching review counts for ${userIds.length} user(s)`);

    const counts = await prisma.review.groupBy({
      by: ['userId'],
      where: {
        userId: { in: [...userIds] },
      },
      _count: {
        id: true,
      },
    });

    const countMap = new Map(counts.map((c) => [c.userId, c._count.id]));
    return userIds.map((id) => countMap.get(id) || 0);
  });
};

// Average rating by Product ID DataLoader
export const createAverageRatingByProductLoader = () => {
  return new DataLoader<string, number | null>(async (productIds) => {
    console.log(`[DataLoader] Batching average ratings for ${productIds.length} product(s)`);

    const ratings = await prisma.review.groupBy({
      by: ['productId'],
      where: {
        productId: { in: [...productIds] },
      },
      _avg: {
        rating: true,
      },
    });

    const ratingMap = new Map(ratings.map((r) => [r.productId, r._avg.rating]));
    return productIds.map((id) => ratingMap.get(id) || null);
  });
};

// Context type for GraphQL
export interface GraphQLContext {
  loaders: {
    userLoader: ReturnType<typeof createUserLoader>;
    productLoader: ReturnType<typeof createProductLoader>;
    reviewsByUserLoader: ReturnType<typeof createReviewsByUserLoader>;
    reviewsByProductLoader: ReturnType<typeof createReviewsByProductLoader>;
    reviewCountByProductLoader: ReturnType<typeof createReviewCountByProductLoader>;
    reviewCountByUserLoader: ReturnType<typeof createReviewCountByUserLoader>;
    averageRatingByProductLoader: ReturnType<typeof createAverageRatingByProductLoader>;
  };
}

// Create all loaders for a request
export const createLoaders = () => ({
  userLoader: createUserLoader(),
  productLoader: createProductLoader(),
  reviewsByUserLoader: createReviewsByUserLoader(),
  reviewsByProductLoader: createReviewsByProductLoader(),
  reviewCountByProductLoader: createReviewCountByProductLoader(),
  reviewCountByUserLoader: createReviewCountByUserLoader(),
  averageRatingByProductLoader: createAverageRatingByProductLoader(),
});
