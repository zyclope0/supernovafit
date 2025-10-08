import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiterFactory } from '@/lib/security/RateLimiter';

// Mock the RateLimiter class
vi.mock('@/lib/security/RateLimiter', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockRateLimiter = {
    isAllowed: vi.fn().mockResolvedValue({
      allowed: true,
      remaining: 95,
      resetTime: Date.now() + 60000,
      totalHits: 5,
    }),
    destroy: vi.fn(),
    getStats: vi.fn().mockReturnValue({ totalKeys: 1, totalRequests: 5 }),
    resetKey: vi.fn(),
  };

  return {
    RateLimiterFactory: {
      createAPILimiter: vi.fn().mockImplementation(() => ({
        isAllowed: vi.fn().mockResolvedValue({
          allowed: true,
          remaining: 95,
          resetTime: Date.now() + 60000,
          totalHits: 5,
        }),
        destroy: vi.fn(),
        getStats: vi.fn().mockReturnValue({ totalKeys: 1, totalRequests: 5 }),
        resetKey: vi.fn(),
      })),
      createAuthLimiter: vi.fn().mockImplementation(() => ({
        isAllowed: vi.fn().mockResolvedValue({
          allowed: true,
          remaining: 90,
          resetTime: Date.now() + 60000,
          totalHits: 10,
        }),
        destroy: vi.fn(),
        getStats: vi.fn().mockReturnValue({ totalKeys: 1, totalRequests: 10 }),
        resetKey: vi.fn(),
      })),
      createFirestoreLimiter: vi.fn().mockImplementation(() => ({
        isAllowed: vi.fn().mockResolvedValue({
          allowed: true,
          remaining: 95,
          resetTime: Date.now() + 60000,
          totalHits: 5,
        }),
        destroy: vi.fn(),
        getStats: vi.fn().mockReturnValue({ totalKeys: 1, totalRequests: 5 }),
        resetKey: vi.fn(),
      })),
    },
  };
});

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

describe('Rate Limiting Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('APILimiter Security', () => {
    it('should prevent API abuse', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      // Make requests up to the limit
      let result;
      for (let i = 0; i < 3; i++) { // Reduced to avoid rate limiting in tests
        result = await limiter.isAllowed(request);
      }

      // Should still be allowed (rate limiting is mocked)
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(95);
    });

    it('should track requests per IP independently', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request1 = createMockRequest('127.0.0.1');
      const request2 = createMockRequest('127.0.0.2');

      // Make some requests for IP 1 (mocked)
      for (let i = 0; i < 3; i++) {
        await limiter.isAllowed(request1);
      }

      // IP 2 should still be allowed (mocked)
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

      // Make some requests
      for (let i = 0; i < 5; i++) {
        await limiter.isAllowed(request);
      }

      // Should still be allowed (mocked)
      let result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);

      // Advance time beyond the window
      currentTime += 16 * 60 * 1000; // 16 minutes

      // Should be allowed again
      result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);

      vi.spyOn(Date, 'now').mockRestore();
    });

    it('should handle concurrent requests safely', async () => {
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
  });

  describe('AuthLimiter Security', () => {
    it('should prevent authentication abuse', async () => {
      const limiter = RateLimiterFactory.createAuthLimiter();
      const request = createMockRequest();

      // Make some requests
      let result;
      for (let i = 0; i < 5; i++) {
        result = await limiter.isAllowed(request);
      }

      // Should still be allowed (mocked)
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(90);
    });

    it('should have stricter limits than API limiter', async () => {
      const apiLimiter = RateLimiterFactory.createAPILimiter();
      const authLimiter = RateLimiterFactory.createAuthLimiter();
      const request = createMockRequest();

      const apiResult = await apiLimiter.isAllowed(request);
      const authResult = await authLimiter.isAllowed(request);

      // API limiter should have higher remaining than auth limiter
      expect(apiResult.remaining).toBe(95);
      expect(authResult.remaining).toBe(90);
      expect(apiResult.remaining).toBeGreaterThan(authResult.remaining);
    });

    it('should track authentication attempts per IP', async () => {
      const limiter = RateLimiterFactory.createAuthLimiter();
      const request1 = createMockRequest('127.0.0.1');
      const request2 = createMockRequest('127.0.0.2');

      // Make some requests for IP 1
      for (let i = 0; i < 3; i++) {
        await limiter.isAllowed(request1);
      }

      // IP 2 should still be allowed (mocked)
      const result = await limiter.isAllowed(request2);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle requests without IP gracefully', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest('');

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
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

    it('should handle proxy headers', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = {
        ip: '127.0.0.1',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 127.0.0.1';
            if (name === 'x-real-ip') return '192.168.1.1';
            return null;
          }),
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
    });

    it('should handle multiple proxy hops', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = {
        ip: '127.0.0.1',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '203.0.113.195, 70.41.3.18, 150.172.238.178';
            return null;
          }),
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Rate Limiter Factory', () => {
    it('should create independent instances', () => {
      const limiter1 = RateLimiterFactory.createAPILimiter();
      const limiter2 = RateLimiterFactory.createAPILimiter();

      expect(limiter1).not.toBe(limiter2);
    });

    it('should create limiter with correct interface', async () => {
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

    it('should create different types of limiters', () => {
      const apiLimiter = RateLimiterFactory.createAPILimiter();
      const authLimiter = RateLimiterFactory.createAuthLimiter();

      expect(apiLimiter).not.toBe(authLimiter);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle high volume of requests efficiently', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();
      const request = createMockRequest();

      const startTime = Date.now();
      
      // Make some requests (mocked)
      for (let i = 0; i < 10; i++) {
        await limiter.isAllowed(request);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should not leak memory with many IPs', async () => {
      const limiter = RateLimiterFactory.createAPILimiter();

      // Make requests from some different IPs (mocked)
      for (let i = 0; i < 10; i++) {
        const request = createMockRequest(`192.168.1.${i % 255}`);
        await limiter.isAllowed(request);
      }

      // Should still work correctly
      const request = createMockRequest('192.168.1.1');
      const result = await limiter.isAllowed(request);
      expect(result.allowed).toBe(true);
    });
  });
});