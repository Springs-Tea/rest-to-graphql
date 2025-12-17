import { describe, it, expect } from '@jest/globals';
import {
  createUserSchema,
  createProductSchema,
  createReviewSchema,
  paginationSchema,
} from '../types/schemas.js';

describe('Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate a valid user', () => {
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'not-an-email',
        name: 'Test User',
      };
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidUser = {
        email: 'test@example.com',
        name: '',
      };
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('createProductSchema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
      };
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const invalidProduct = {
        name: 'Test Product',
        price: -10,
        category: 'Electronics',
      };
      const result = createProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it('should accept optional description', () => {
      const validProduct = {
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        description: 'A great product',
      };
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });
  });

  describe('createReviewSchema', () => {
    it('should validate a valid review', () => {
      const validReview = {
        rating: 5,
        comment: 'Great product!',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
      };
      const result = createReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should reject rating above 5', () => {
      const invalidReview = {
        rating: 6,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
      };
      const result = createReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
    });

    it('should reject rating below 1', () => {
      const invalidReview = {
        rating: 0,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
      };
      const result = createReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should use defaults when empty', () => {
      const result = paginationSchema.parse({});
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should accept valid pagination', () => {
      const pagination = { limit: 20, offset: 10 };
      const result = paginationSchema.parse(pagination);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(10);
    });

    it('should coerce string to number', () => {
      const pagination = { limit: '15', offset: '5' };
      const result = paginationSchema.parse(pagination);
      expect(result.limit).toBe(15);
      expect(result.offset).toBe(5);
    });
  });
});
