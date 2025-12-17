import prisma from '../db/prisma.js';
import type { CreateReviewInput, UpdateReviewInput, PaginationInput } from '../types/schemas.js';

export class ReviewService {
  async findAll(pagination: PaginationInput) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          product: true,
        },
      }),
      prisma.review.count(),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + reviews.length < total,
      },
    };
  }

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        product: true,
      },
    });
  }

  async findByProductId(productId: string, pagination: PaginationInput) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + reviews.length < total,
      },
    };
  }

  async findByUserId(userId: string, pagination: PaginationInput) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        },
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + reviews.length < total,
      },
    };
  }

  async create(data: CreateReviewInput) {
    return prisma.review.create({
      data,
      include: {
        user: true,
        product: true,
      },
    });
  }

  async update(id: string, data: UpdateReviewInput) {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: true,
        product: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }
}

export const reviewService = new ReviewService();
