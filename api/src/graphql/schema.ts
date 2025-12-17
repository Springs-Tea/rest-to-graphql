import { createSchema } from 'graphql-yoga';
import { resolvers } from './resolvers.js';

const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    updatedAt: String!
    reviews: [Review!]!
    reviewCount: Int!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: String!
    imageUrl: String
    createdAt: String!
    updatedAt: String!
    reviews: [Review!]!
    reviewCount: Int!
    averageRating: Float
  }

  type Review {
    id: ID!
    rating: Int!
    comment: String
    createdAt: String!
    updatedAt: String!
    user: User!
    product: Product!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    cursor: String!
    node: Product!
  }

  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReviewEdge {
    cursor: String!
    node: Review!
  }

  type ReviewConnection {
    edges: [ReviewEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    # User queries
    user(id: ID!): User
    users(first: Int, after: String, last: Int, before: String): UserConnection!

    # Product queries
    product(id: ID!): Product
    products(first: Int, after: String, last: Int, before: String, category: String): ProductConnection!

    # Review queries
    review(id: ID!): Review
    reviews(first: Int, after: String, productId: ID, userId: ID): ReviewConnection!

    # Demo query - fetch product with reviews and user info in single request
    productWithDetails(id: ID!): Product
  }

  input CreateUserInput {
    email: String!
    name: String!
  }

  input UpdateUserInput {
    email: String
    name: String
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    category: String!
    imageUrl: String
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    category: String
    imageUrl: String
  }

  input CreateReviewInput {
    rating: Int!
    comment: String
    userId: ID!
    productId: ID!
  }

  input UpdateReviewInput {
    rating: Int
    comment: String
  }

  type Mutation {
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Product mutations
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Review mutations
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
  }
`;

export const schema = createSchema({
  typeDefs,
  resolvers,
});
