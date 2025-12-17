import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { userRoutes } from './routes/users.routes.js';
import { productRoutes } from './routes/products.routes.js';
import { reviewRoutes } from './routes/reviews.routes.js';
import { yoga } from './graphql/index.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

async function buildApp() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'REST to GraphQL PoC - REST API',
        description: 'REST API endpoints for Products, Users, and Reviews',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Products', description: 'Product management endpoints' },
        { name: 'Reviews', description: 'Review management endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Health check endpoint
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    },
  });

  // Register routes
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(productRoutes, { prefix: '/api/products' });
  await fastify.register(reviewRoutes, { prefix: '/api/reviews' });

  // GraphQL endpoint using GraphQL Yoga
  fastify.route({
    url: '/graphql',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: async (req, reply) => {
      // Convert Fastify request to a standard Request object
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }

      const request = new Request(url.toString(), {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
      });

      const response = await yoga.fetch(request);

      // Set response headers
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      reply.status(response.status);

      const body = await response.text();
      reply.send(body);

      return reply;
    },
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Swagger docs available at http://${host}:${port}/docs`);
    console.log(`GraphQL playground available at http://${host}:${port}/graphql`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
