import prisma from '../db/prisma.js';
import type { CreateUserInput, UpdateUserInput, PaginationInput } from '../types/schemas.js';

export class UserService {
  async findAll(pagination: PaginationInput) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + users.length < total,
      },
    };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithReviews(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async create(data: CreateUserInput) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
