import { GraphQLClient, gql } from 'graphql-request';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const graphqlClient = new GraphQLClient(`${API_URL}/graphql`);

// Types
export interface GraphQLProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  reviews: GraphQLReview[];
  reviewCount: number;
  averageRating: number | null;
}

export interface GraphQLUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
}

export interface GraphQLReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: GraphQLUser;
  product?: GraphQLProduct;
}

export interface ProductConnection {
  edges: Array<{
    cursor: string;
    node: GraphQLProduct;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

// Queries
export const PRODUCTS_WITH_REVIEWS_QUERY = gql`
  query ProductsWithReviews($first: Int) {
    products(first: $first) {
      edges {
        node {
          id
          name
          description
          price
          category
          imageUrl
          createdAt
          reviewCount
          averageRating
          reviews {
            id
            rating
            comment
            createdAt
            user {
              id
              name
              email
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
`;

export const PRODUCT_DETAIL_QUERY = gql`
  query ProductDetail($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      category
      imageUrl
      createdAt
      reviewCount
      averageRating
      reviews {
        id
        rating
        comment
        createdAt
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const USERS_QUERY = gql`
  query Users($first: Int, $after: String) {
    users(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          email
          createdAt
          reviewCount
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// Fetch products with reviews using GraphQL (single request)
export async function fetchProductsWithReviewsGraphQL(): Promise<{
  products: GraphQLProduct[];
  requestCount: number;
  totalTime: number;
}> {
  const startTime = performance.now();

  // Single request gets everything
  const data = await graphqlClient.request<{ products: ProductConnection }>(
    PRODUCTS_WITH_REVIEWS_QUERY,
    { first: 10 }
  );

  const totalTime = performance.now() - startTime;

  return {
    products: data.products.edges.map((edge) => edge.node),
    requestCount: 1, // Always 1 with GraphQL
    totalTime,
  };
}
