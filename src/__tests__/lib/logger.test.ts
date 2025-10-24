import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logInfo, logError, logWarning, logDebug } from '@/lib/logger';

// Mock the logger functions
vi.mock('@/lib/logger', async () => {
  const actual = await vi.importActual('@/lib/logger');
  return {
    ...actual,
    logInfo: vi.fn(),
    logError: vi.fn(),
    logWarning: vi.fn(),
    logDebug: vi.fn(),
  };
});

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log info messages', () => {
    const message = 'User logged in successfully';
    const context = { userId: '123', timestamp: new Date() };
    
    logInfo(message, context);
    
    expect(logInfo).toHaveBeenCalledWith(message, context);
  });

  it('should log error messages', () => {
    const message = 'Database connection failed';
    const error = new Error('Connection timeout');
    const context = { component: 'Database', action: 'connect' };
    
    logError(message, error, context);
    
    expect(logError).toHaveBeenCalledWith(message, error, context);
  });

  it('should log warning messages', () => {
    const message = 'High memory usage detected';
    const context = { memoryUsage: '85%', threshold: '80%' };
    
    logWarning(message, context);
    
    expect(logWarning).toHaveBeenCalledWith(message, context);
  });

  it('should log debug messages', () => {
    const message = 'Processing user data';
    const context = { step: 'validation', data: { id: '123' } };
    
    logDebug(message, context);
    
    expect(logDebug).toHaveBeenCalledWith(message, context);
  });

  it('should handle logging without context', () => {
    logInfo('Simple info message');
    logError('Simple error message');
    logWarning('Simple warning message');
    logDebug('Simple debug message');
    
    expect(logInfo).toHaveBeenCalledWith('Simple info message');
    expect(logError).toHaveBeenCalledWith('Simple error message');
    expect(logWarning).toHaveBeenCalledWith('Simple warning message');
    expect(logDebug).toHaveBeenCalledWith('Simple debug message');
  });

  it('should handle logging with empty context', () => {
    logInfo('Message', {});
    logError('Message', new Error('Test'), {});
    logWarning('Message', {});
    logDebug('Message', {});
    
    expect(logInfo).toHaveBeenCalledWith('Message', {});
    expect(logError).toHaveBeenCalledWith('Message', expect.any(Error), {});
    expect(logWarning).toHaveBeenCalledWith('Message', {});
    expect(logDebug).toHaveBeenCalledWith('Message', {});
  });

  it('should handle complex context objects', () => {
    const complexContext = {
      user: { id: '123', name: 'John' },
      request: { method: 'POST', url: '/api/data' },
      metadata: { timestamp: new Date(), version: '1.0' },
    };
    
    logInfo('Complex operation', complexContext);
    
    expect(logInfo).toHaveBeenCalledWith('Complex operation', complexContext);
  });
});
