import prisma from '../db/prisma.js';
import type { CreateProductInput, UpdateProductInput, PaginationInput } from '../types/schemas.js';

export class ProductService {
  async findAll(pagination: PaginationInput) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ]);

    return {
      data: products,
      meta: {
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + products.length < total,
      },
    };
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  async findByIdWithReviews(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async create(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        ...data,
        price: data.price,
      },
    });
  }

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async getReviewStats(id: string) {
    const stats = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      averageRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    };
  }
}

export const productService = new ProductService();
