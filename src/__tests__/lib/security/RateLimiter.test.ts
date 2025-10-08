import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiterFactory } from '@/lib/security/RateLimiter';

// Mock NextRequest
const createMockRequest = (ip: string = '127.0.0.1') => ({
  ip,
  headers: {
    get: vi.fn((name: string) => {
      if (name === 'x-forwarded-for') return ip;
      if (name === 'x-real-ip') return ip;
      return null;
    }),
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('APILimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests exceeding limit', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      // Make multiple requests to exceed the limit
      for (let i = 0; i < 100; i++) {
        await limiter.isAllowed(request);
      }

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track requests per IP separately', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request1 = createMockRequest('127.0.0.1');
      const request2 = createMockRequest('127.0.0.2');

      // Exceed limit for IP 1
      for (let i = 0; i < 100; i++) {
        await limiter.isAllowed(request1);
      }

      // IP 2 should still be allowed
      const result = await limiter.isAllowed(request2);
      expect(result.allowed).toBe(true);
    });

    it('should reset limits after time window', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      // Mock Date.now to control time
      const originalNow = Date.now;
      let currentTime = originalNow();
      
      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Exceed limit
      for (let i = 0; i < 100; i++) {
        await limiter.isAllowed(request);
      }

      // Should be blocked
      let result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(false);

      // Advance time beyond the window
      currentTime += 16 * 60 * 1000; // 16 minutes

      // Should be allowed again
      result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);

      vi.spyOn(Date, 'now').mockRestore();
    });
  });

  describe('AuthLimiter', () => {
    it('should allow authentication requests within limit', async () => {
      const limiter = RateLimiterFactory.createAuthLimiter();
      const request = createMockRequest();

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block authentication requests exceeding limit', async () => {
      const limiter = RateLimiterFactory.createAuthLimiter();
      const request = createMockRequest();

      // Make multiple requests to exceed the auth limit (lower than API limit)
      for (let i = 0; i < 10; i++) {
        await limiter.isAllowed(request);
      }

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should have different limits than API limiter', async () => {
      const apiLimiter = RateLimiterFactory.createAPILimiter();
      const authLimiter = RateLimiterFactory.createAuthLimiter();
      const request = createMockRequest();

      const apiResult = await apiLimiter.isAllowed(request);
      const authResult = await authLimiter.isAllowed(request);

      expect(apiResult.remaining).not.toBe(authResult.remaining);
    });
  });

  describe('RateLimiterFactory', () => {
    it('should create different instances', () => {
      const limiter1 = RateLimiterFactory.createAPILimiter();
      const limiter2 = RateLimiterFactory.createAPILimiter();

      expect(limiter1).not.toBe(limiter2);
    });

    it('should create limiter with correct configuration', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      const result = await limiter.isAllowed(request);
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.resetTime).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests without IP', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest('');

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
    });

    it('should handle concurrent requests', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      // Make concurrent requests
      const promises = Array.from({ length: 50 }, () => limiter.isAllowed(request));
      const results = await Promise.all(promises);

      // All should be allowed initially
      results.forEach(result => {
        expect(result.allowed).toBe(true);
      });
    });

    it('should handle malformed IP addresses', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest('invalid-ip');

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
    });

    it('should handle IPv6 addresses', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest('2001:db8::1');

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
    });
  });
});
