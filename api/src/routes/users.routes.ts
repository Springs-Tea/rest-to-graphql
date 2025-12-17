import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service.js';
import {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
  paginationSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '../types/schemas.js';

export async function userRoutes(fastify: FastifyInstance) {
  // GET /users - List all users
  fastify.get('/', {
    schema: {
      description: 'Get all users with pagination',
      tags: ['Users'],
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
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
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
      const result = await userService.findAll(pagination);
      return reply.send(result);
    },
  });

  // GET /users/:id - Get user by ID
  fastify.get('/:id', {
    schema: {
      description: 'Get a user by ID',
      tags: ['Users'],
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
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
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
      const { id } = userParamsSchema.parse(request.params);
      const user = await userService.findById(id);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `User with id ${id} not found`,
        });
      }

      return reply.send(user);
    },
  });

  // GET /users/:id/reviews - Get user's reviews
  fastify.get('/:id/reviews', {
    schema: {
      description: 'Get all reviews by a user',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
        required: ['id'],
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = userParamsSchema.parse(request.params);
      const user = await userService.findByIdWithReviews(id);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `User with id ${id} not found`,
        });
      }

      return reply.send(user);
    },
  });

  // POST /users - Create a new user
  fastify.post('/', {
    schema: {
      description: 'Create a new user',
      tags: ['Users'],
      body: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
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
        const data = createUserSchema.parse(request.body) as CreateUserInput;
        const user = await userService.create(data);
        return reply.status(201).send(user);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Email already exists',
          });
        }
        throw error;
      }
    },
  });

  // PATCH /users/:id - Update a user
  fastify.patch('/:id', {
    schema: {
      description: 'Update a user',
      tags: ['Users'],
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
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
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
      const { id } = userParamsSchema.parse(request.params);
      const data = updateUserSchema.parse(request.body) as UpdateUserInput;

      try {
        const user = await userService.update(id, data);
        return reply.send(user);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: `User with id ${id} not found`,
          });
        }
        throw error;
      }
    },
  });

  // DELETE /users/:id - Delete a user
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a user',
      tags: ['Users'],
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
          description: 'User deleted successfully',
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
      const { id } = userParamsSchema.parse(request.params);

      try {
        await userService.delete(id);
        return reply.status(204).send();
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: `User with id ${id} not found`,
          });
        }
        throw error;
      }
    },
  });
}
