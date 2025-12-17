import prisma from '../db/prisma.js';
import type { GraphQLContext } from './dataloaders.js';
import type { User, Product, Review } from '@prisma/client';

// Helper function to encode cursor (base64 encoding of ID)
const encodeCursor = (id: string): string => Buffer.from(id).toString('base64');
const decodeCursor = (cursor: string): string => Buffer.from(cursor, 'base64').toString('utf-8');

// Helper to build cursor-based pagination
interface PaginationArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

interface Connection<T> {
  edges: Array<{ cursor: string; node: T }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

export const resolvers = {
  Query: {
    // User queries
    user: async (_: unknown, { id }: { id: string }) => {
      return prisma.user.findUnique({ where: { id } });
    },

    users: async (
      _: unknown,
      { first, after, last, before }: PaginationArgs
    ): Promise<Connection<User>> => {
      const take = first || last || 10;
      const cursor = after ? decodeCursor(after) : before ? decodeCursor(before) : undefined;

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          take: take + 1, // Fetch one extra to check if there are more
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1, // Skip the cursor itself
          }),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ]);

      const hasMore = users.length > take;
      const edges = users.slice(0, take).map((user) => ({
        cursor: encodeCursor(user.id),
        node: user,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: hasMore,
          hasPreviousPage: !!after,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount,
      };
    },

    // Product queries
    product: async (_: unknown, { id }: { id: string }) => {
      return prisma.product.findUnique({ where: { id } });
    },

    products: async (
      _: unknown,
      { first, after, category }: PaginationArgs & { category?: string }
    ): Promise<Connection<Product>> => {
      const take = first || 10;
      const cursor = after ? decodeCursor(after) : undefined;

      const where = category ? { category } : {};

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          take: take + 1,
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
          }),
          where,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      const hasMore = products.length > take;
      const edges = products.slice(0, take).map((product) => ({
        cursor: encodeCursor(product.id),
        node: product,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: hasMore,
          hasPreviousPage: !!after,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount,
      };
    },

    // Review queries
    review: async (_: unknown, { id }: { id: string }) => {
      return prisma.review.findUnique({ where: { id } });
    },

    reviews: async (
      _: unknown,
      { first, after, productId, userId }: PaginationArgs & { productId?: string; userId?: string }
    ): Promise<Connection<Review>> => {
      const take = first || 10;
      const cursor = after ? decodeCursor(after) : undefined;

      const where: Record<string, string> = {};
      if (productId) where.productId = productId;
      if (userId) where.userId = userId;

      const [reviews, totalCount] = await Promise.all([
        prisma.review.findMany({
          take: take + 1,
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
          }),
          where,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.review.count({ where }),
      ]);

      const hasMore = reviews.length > take;
      const edges = reviews.slice(0, take).map((review) => ({
        cursor: encodeCursor(review.id),
        node: review,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: hasMore,
          hasPreviousPage: !!after,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
        totalCount,
      };
    },

    // Demo query - single request for nested data
    productWithDetails: async (_: unknown, { id }: { id: string }) => {
      return prisma.product.findUnique({ where: { id } });
    },
  },

  Mutation: {
    // User mutations
    createUser: async (_: unknown, { input }: { input: { email: string; name: string } }) => {
      return prisma.user.create({ data: input });
    },

    updateUser: async (
      _: unknown,
      { id, input }: { id: string; input: { email?: string; name?: string } }
    ) => {
      return prisma.user.update({ where: { id }, data: input });
    },

    deleteUser: async (_: unknown, { id }: { id: string }) => {
      await prisma.user.delete({ where: { id } });
      return true;
    },

    // Product mutations
    createProduct: async (
      _: unknown,
      { input }: { input: { name: string; description?: string; price: number; category: string; imageUrl?: string } }
    ) => {
      return prisma.product.create({ data: input });
    },

    updateProduct: async (
      _: unknown,
      { id, input }: { id: string; input: { name?: string; description?: string; price?: number; category?: string; imageUrl?: string } }
    ) => {
      return prisma.product.update({ where: { id }, data: input });
    },

    deleteProduct: async (_: unknown, { id }: { id: string }) => {
      await prisma.product.delete({ where: { id } });
      return true;
    },

    // Review mutations
    createReview: async (
      _: unknown,
      { input }: { input: { rating: number; comment?: string; userId: string; productId: string } }
    ) => {
      return prisma.review.create({ data: input });
    },

    updateReview: async (
      _: unknown,
      { id, input }: { id: string; input: { rating?: number; comment?: string } }
    ) => {
      return prisma.review.update({ where: { id }, data: input });
    },

    deleteReview: async (_: unknown, { id }: { id: string }) => {
      await prisma.review.delete({ where: { id } });
      return true;
    },
  },

  // Field resolvers with DataLoader
  User: {
    reviews: async (parent: User, _: unknown, context: GraphQLContext) => {
      return context.loaders.reviewsByUserLoader.load(parent.id);
    },
    reviewCount: async (parent: User, _: unknown, context: GraphQLContext) => {
      return context.loaders.reviewCountByUserLoader.load(parent.id);
    },
    createdAt: (parent: User) => parent.createdAt.toISOString(),
    updatedAt: (parent: User) => parent.updatedAt.toISOString(),
  },

  Product: {
    reviews: async (parent: Product, _: unknown, context: GraphQLContext) => {
      return context.loaders.reviewsByProductLoader.load(parent.id);
    },
    reviewCount: async (parent: Product, _: unknown, context: GraphQLContext) => {
      return context.loaders.reviewCountByProductLoader.load(parent.id);
    },
    averageRating: async (parent: Product, _: unknown, context: GraphQLContext) => {
      return context.loaders.averageRatingByProductLoader.load(parent.id);
    },
    price: (parent: Product) => Number(parent.price),
    createdAt: (parent: Product) => parent.createdAt.toISOString(),
    updatedAt: (parent: Product) => parent.updatedAt.toISOString(),
  },

  Review: {
    user: async (parent: Review, _: unknown, context: GraphQLContext) => {
      return context.loaders.userLoader.load(parent.userId);
    },
    product: async (parent: Review, _: unknown, context: GraphQLContext) => {
      return context.loaders.productLoader.load(parent.productId);
    },
    createdAt: (parent: Review) => parent.createdAt.toISOString(),
    updatedAt: (parent: Review) => parent.updatedAt.toISOString(),
  },
};
