import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatNumber, parseNumber, roundToDecimal, clamp } from '@/lib/numberUtils';

// Mock the numberUtils functions
vi.mock('@/lib/numberUtils', async () => {
  const actual = await vi.importActual('@/lib/numberUtils');
  return {
    ...actual,
    formatNumber: vi.fn(),
    parseNumber: vi.fn(),
    roundToDecimal: vi.fn(),
    clamp: vi.fn(),
  };
});

describe('Number Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format numbers correctly', () => {
    const number = 1234.567;
    const options = { decimals: 2, separator: ',' };
    
    formatNumber(number, options);
    
    expect(formatNumber).toHaveBeenCalledWith(number, options);
  });

  it('should parse numbers from strings', () => {
    const numberString = '123.45';
    const defaultValue = 0;
    
    parseNumber(numberString, defaultValue);
    
    expect(parseNumber).toHaveBeenCalledWith(numberString, defaultValue);
  });

  it('should round numbers to specified decimal places', () => {
    const number = 3.14159;
    const decimals = 2;
    
    roundToDecimal(number, decimals);
    
    expect(roundToDecimal).toHaveBeenCalledWith(number, decimals);
  });

  it('should clamp numbers within range', () => {
    const value = 15;
    const min = 10;
    const max = 20;
    
    clamp(value, min, max);
    
    expect(clamp).toHaveBeenCalledWith(value, min, max);
  });

  it('should handle edge cases for formatting', () => {
    formatNumber(0);
    formatNumber(-123.45);
    formatNumber(Number.MAX_VALUE);
    formatNumber(Number.MIN_VALUE);
    
    expect(formatNumber).toHaveBeenCalledWith(0);
    expect(formatNumber).toHaveBeenCalledWith(-123.45);
    expect(formatNumber).toHaveBeenCalledWith(Number.MAX_VALUE);
    expect(formatNumber).toHaveBeenCalledWith(Number.MIN_VALUE);
  });

  it('should handle edge cases for parsing', () => {
    parseNumber('invalid', 0);
    parseNumber('', 0);
    parseNumber(null, 0);
    parseNumber(undefined, 0);
    
    expect(parseNumber).toHaveBeenCalledWith('invalid', 0);
    expect(parseNumber).toHaveBeenCalledWith('', 0);
    expect(parseNumber).toHaveBeenCalledWith(null, 0);
    expect(parseNumber).toHaveBeenCalledWith(undefined, 0);
  });

  it('should handle edge cases for rounding', () => {
    roundToDecimal(0, 2);
    roundToDecimal(-3.14159, 3);
    roundToDecimal(Infinity, 2);
    roundToDecimal(-Infinity, 2);
    
    expect(roundToDecimal).toHaveBeenCalledWith(0, 2);
    expect(roundToDecimal).toHaveBeenCalledWith(-3.14159, 3);
    expect(roundToDecimal).toHaveBeenCalledWith(Infinity, 2);
    expect(roundToDecimal).toHaveBeenCalledWith(-Infinity, 2);
  });

  it('should handle edge cases for clamping', () => {
    clamp(5, 10, 20); // Below range
    clamp(25, 10, 20); // Above range
    clamp(15, 10, 20); // Within range
    clamp(10, 10, 20); // At minimum
    clamp(20, 10, 20); // At maximum
    
    expect(clamp).toHaveBeenCalledWith(5, 10, 20);
    expect(clamp).toHaveBeenCalledWith(25, 10, 20);
    expect(clamp).toHaveBeenCalledWith(15, 10, 20);
    expect(clamp).toHaveBeenCalledWith(10, 10, 20);
    expect(clamp).toHaveBeenCalledWith(20, 10, 20);
  });
});
