![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-4.28-000000?logo=fastify&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-Yoga%205-E10098?logo=graphql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

# REST vs GraphQL Comparison PoC

A comprehensive proof of concept demonstrating the differences between REST and GraphQL API architectures. This project showcases both approaches side-by-side with the same data model, allowing for direct comparison of request patterns, data fetching efficiency, and overall developer experience.

## Overview

This PoC implements a simple e-commerce domain with **Users**, **Products**, and **Reviews**. Both REST and GraphQL endpoints are available for the same data, making it easy to compare:

- **Request patterns**: REST's N+1 problem vs GraphQL's single query
- **Data fetching**: Over-fetching/under-fetching comparison
- **Performance**: Response times and request counts
- **Developer experience**: Query flexibility and type safety

## Architecture

```
rest-to-graphql/
├── api/                    # Backend (Fastify + GraphQL Yoga)
│   ├── src/
│   │   ├── graphql/        # GraphQL schema, resolvers, DataLoader
│   │   ├── routes/         # REST endpoints
│   │   ├── services/       # Business logic
│   │   └── db/             # Prisma client
│   └── prisma/             # Database schema and migrations
├── web/                    # Frontend (Next.js 14)
│   ├── app/                # App router pages
│   ├── components/         # React components
│   └── lib/                # API clients (REST & GraphQL)
└── compose.yml             # Docker Compose configuration
```

## Features

### REST API
- RESTful endpoints for Users, Products, and Reviews
- Offset-based pagination (`?limit=10&offset=0`)
- OpenAPI/Swagger documentation at `/docs`
- Standard HTTP methods (GET, POST, PUT, DELETE)

### GraphQL API
- Single endpoint at `/graphql`
- GraphQL Yoga with interactive playground
- **DataLoader** implementation to solve N+1 queries
- **Cursor-based pagination** (Relay-style connections)
- Nested data fetching in single requests

### Frontend Demo
- **REST Demo Page**: Shows N+1 request pattern
- **GraphQL Demo Page**: Shows single query pattern
- **Comparison Page**: Side-by-side benchmark

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd rest-to-graphql

# Start all services
docker compose up --build

# Seed the database (first time only)
docker compose exec api npx tsx prisma/seed.ts

# Services will be available at:
# - API: http://localhost:3000
# - GraphQL Playground: http://localhost:3000/graphql
# - Swagger Docs: http://localhost:3000/docs
# - Frontend: http://localhost:3001
```

### Local Development

#### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

#### API Setup

```bash
cd api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## API Documentation

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/:id/reviews` | Get product with reviews |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/reviews` | List all reviews |
| GET | `/api/reviews/:id` | Get review by ID |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### GraphQL Schema

```graphql
type Query {
  # Users
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!

  # Products
  product(id: ID!): Product
  products(first: Int, after: String, category: String): ProductConnection!

  # Reviews
  review(id: ID!): Review
  reviews(first: Int, after: String, productId: ID, userId: ID): ReviewConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!

  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!

  createReview(input: CreateReviewInput!): Review!
  updateReview(id: ID!, input: UpdateReviewInput!): Review!
  deleteReview(id: ID!): Boolean!
}
```

### Example GraphQL Query

```graphql
query ProductsWithReviews {
  products(first: 10) {
    edges {
      node {
        id
        name
        price
        category
        reviewCount
        averageRating
        reviews {
          id
          rating
          comment
          user {
            id
            name
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

## REST vs GraphQL Comparison

### Request Pattern

| Scenario | REST | GraphQL |
|----------|------|---------|
| List 10 products with reviews | 11 requests (1 + N) | 1 request |
| Get product with user reviews | 2+ requests | 1 request |
| Custom field selection | Not possible | Built-in |

### N+1 Problem

**REST Approach:**
```
GET /api/products              -> 1 request
GET /api/reviews?productId=1   -> 1 request
GET /api/reviews?productId=2   -> 1 request
GET /api/reviews?productId=3   -> 1 request
...
Total: N + 1 requests
```

**GraphQL Approach (with DataLoader):**
```graphql
query {
  products {
    reviews { ... }  # Batched into single DB query
  }
}
# Total: 1 HTTP request, ~2 DB queries
```

### When to Use What

| Use REST when... | Use GraphQL when... |
|------------------|---------------------|
| Simple CRUD operations | Complex nested data |
| HTTP caching is critical | Multiple clients with different needs |
| Public APIs | Reducing over/under-fetching |
| Team is familiar with REST | Rapid frontend development |

## DataLoader Implementation

The GraphQL layer uses DataLoader to batch and cache database queries:

```typescript
// Without DataLoader (N+1):
SELECT * FROM reviews WHERE product_id = '1'
SELECT * FROM reviews WHERE product_id = '2'
SELECT * FROM reviews WHERE product_id = '3'

// With DataLoader (batched):
SELECT * FROM reviews WHERE product_id IN ('1', '2', '3')
```

DataLoaders are created per-request to ensure proper caching and prevent data leaks between users.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | API server port | `3000` |
| `HOST` | API server host | `0.0.0.0` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS origin | `*` |
| `NEXT_PUBLIC_API_URL` | API URL for frontend | `http://localhost:3000` |

## Scripts

### API Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Web Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting
```

## Docker Commands

```bash
# Start all services
docker compose up --build

# Start in detached mode
docker compose up -d --build

# View logs
docker compose logs -f api
docker compose logs -f web

# Stop all services
docker compose down

# Stop and remove volumes (clean start)
docker compose down -v

# Seed database
docker compose exec api npx tsx prisma/seed.ts
```

## Milestones

- [x] **Milestone 1**: Domain + REST API
  - Prisma schema for User, Product, Review
  - REST endpoints with Fastify
  - OpenAPI/Swagger documentation
  - Docker setup with auto-migration

- [x] **Milestone 2**: GraphQL Layer + DataLoader
  - GraphQL Yoga integration
  - Schema and resolvers for all entities
  - DataLoader for N+1 prevention
  - Cursor-based pagination

- [x] **Milestone 3**: Next.js Demo Pages
  - REST demo page (shows N+1 pattern)
  - GraphQL demo page (single query)
  - Comparison/benchmark page

- [x] **Milestone 4**: Documentation
  - Comprehensive README
  - REST vs GraphQL comparison
  - Performance benchmarks

## Testing

```bash
# Run API tests
cd api
npm test

# Run linting
npm run lint
```

## Project Structure

### API (`/api`)

- **`src/graphql/schema.ts`**: GraphQL type definitions
- **`src/graphql/resolvers.ts`**: Query and mutation resolvers
- **`src/graphql/dataloaders.ts`**: DataLoader implementations
- **`src/routes/`**: REST endpoint handlers
- **`src/services/`**: Business logic layer
- **`prisma/schema.prisma`**: Database schema

### Frontend (`/web`)

- **`app/page.tsx`**: Home page
- **`app/rest/page.tsx`**: REST API demo
- **`app/graphql/page.tsx`**: GraphQL demo
- **`app/comparison/page.tsx`**: Side-by-side comparison
- **`lib/api.ts`**: REST API client
- **`lib/graphql.ts`**: GraphQL client

## License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with Fastify, GraphQL Yoga, Prisma, and Next.js 14.
