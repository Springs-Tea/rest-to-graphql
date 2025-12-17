import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { reviewService } from '../services/review.service.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  paginationSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
} from '../types/schemas.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  // GET /reviews - List all reviews
  fastify.get('/', {
    schema: {
      description: 'Get all reviews with pagination',
      tags: ['Reviews'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string', nullable: true },
                  userId: { type: 'string', format: 'uuid' },
                  productId: { type: 'string', format: 'uuid' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                      price: { type: 'number' },
                    },
                  },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                hasMore: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const pagination = paginationSchema.parse(request.query);
      const result = await reviewService.findAll(pagination);
      return reply.send(result);
    },
  });

  // GET /reviews/:id - Get review by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a review by ID',
      tags: ['Reviews'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
            userId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
            product: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                price: { type: 'number' },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = reviewParamsSchema.parse(request.params);
      const review = await reviewService.findById(id);

      if (!review) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Review with id ${id} not found`,
        });
      }

      return reply.send(review);
    },
  });

  // POST /reviews - Create a new review
  fastify.post('/', {
    schema: {
      description: 'Create a new review',
      tags: ['Reviews'],
      body: {
        type: 'object',
        required: ['rating', 'userId', 'productId'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', maxLength: 1000 },
          userId: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
            userId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = createReviewSchema.parse(request.body) as CreateReviewInput;
        const review = await reviewService.create(data);
        return reply.status(201).send(review);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === 'P2002') {
            return reply.status(400).send({
              error: 'Bad Request',
              message: 'User has already reviewed this product',
            });
          }
          if (error.code === 'P2003') {
            return reply.status(400).send({
              error: 'Bad Request',
              message: 'User or product not found',
            });
          }
        }
        throw error;
      }
    },
  });

  // PATCH /reviews/:id - Update a review
  fastify.patch('/:id', {
    schema: {
      description: 'Update a review',
      tags: ['Reviews'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
            userId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = reviewParamsSchema.parse(request.params);
      const data = updateReviewSchema.parse(request.body) as UpdateReviewInput;

      try {
        const review = await reviewService.update(id, data);
        return reply.send(review);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: `Review with id ${id} not found`,
          });
        }
        throw error;
      }
    },
  });

  // DELETE /reviews/:id - Delete a review
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a review',
      tags: ['Reviews'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      response: {
        204: {
          type: 'null',
          description: 'Review deleted successfully',
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = reviewParamsSchema.parse(request.params);

      try {
        await reviewService.delete(id);
        return reply.status(204).send();
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: `Review with id ${id} not found`,
          });
        }
        throw error;
      }
    },
  });
}
