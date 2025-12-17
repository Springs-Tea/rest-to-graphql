import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { productService } from '../services/product.service.js';
import { reviewService } from '../services/review.service.js';
import {
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  paginationSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../types/schemas.js';

export async function productRoutes(fastify: FastifyInstance) {
  // GET /products - List all products
  fastify.get('/', {
    schema: {
      description: 'Get all products with pagination',
      tags: ['Products'],
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
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  imageUrl: { type: 'string', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
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
      const result = await productService.findAll(pagination);
      return reply.send(result);
    },
  });

  // GET /products/:id - Get product by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a product by ID',
      tags: ['Products'],
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
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'number' },
            category: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
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
      const { id } = productParamsSchema.parse(request.params);
      const product = await productService.findById(id);

      if (!product) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Product with id ${id} not found`,
        });
      }

      return reply.send(product);
    },
  });

  // GET /products/:id/reviews - Get product's reviews
  fastify.get('/:id/reviews', {
    schema: {
      description: 'Get all reviews for a product',
      tags: ['Products'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = productParamsSchema.parse(request.params);
      const pagination = paginationSchema.parse(request.query);

      const product = await productService.findById(id);
      if (!product) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Product with id ${id} not found`,
        });
      }

      const reviews = await reviewService.findByProductId(id, pagination);
      return reply.send(reviews);
    },
  });

  // GET /products/:id/stats - Get product review statistics
  fastify.get('/:id/stats', {
    schema: {
      description: 'Get review statistics for a product',
      tags: ['Products'],
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
            averageRating: { type: 'number' },
            reviewCount: { type: 'integer' },
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
      const { id } = productParamsSchema.parse(request.params);

      const product = await productService.findById(id);
      if (!product) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Product with id ${id} not found`,
        });
      }

      const stats = await productService.getReviewStats(id);
      return reply.send(stats);
    },
  });

  // POST /products - Create a new product
  fastify.post('/', {
    schema: {
      description: 'Create a new product',
      tags: ['Products'],
      body: {
        type: 'object',
        required: ['name', 'price', 'category'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000 },
          price: { type: 'number', minimum: 0.01 },
          category: { type: 'string', minLength: 1, maxLength: 100 },
          imageUrl: { type: 'string', format: 'uri' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'number' },
            category: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const data = createProductSchema.parse(request.body) as CreateProductInput;
      const product = await productService.create(data);
      return reply.status(201).send(product);
    },
  });

  // PATCH /products/:id - Update a product
  fastify.patch('/:id', {
    schema: {
      description: 'Update a product',
      tags: ['Products'],
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
          name: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', maxLength: 2000, nullable: true },
          price: { type: 'number', minimum: 0.01 },
          category: { type: 'string', minLength: 1, maxLength: 100 },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'number' },
            category: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
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
      const { id } = productParamsSchema.parse(request.params);
      const data = updateProductSchema.parse(request.body) as UpdateProductInput;

      try {
        const product = await productService.update(id, data);
        return reply.send(product);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: `Product with id ${id} not found`,
          });
        }
        throw error;
      }
    },
  });

  // DELETE /products/:id - Delete a product
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a product',
      tags: ['Products'],
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
          description: 'Product deleted successfully',
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
      const { id } = productParamsSchema.parse(request.params);

      try {
        await productService.delete(id);
        return reply.status(204).send();
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: `Product with id ${id} not found`,
          });
        }
        throw error;
      }
    },
  });
}
