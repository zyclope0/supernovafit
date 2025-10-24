import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toBe('base valid');
  });

  it('should handle empty strings', () => {
    const result = cn('base', '', 'valid');
    expect(result).toBe('base valid');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toBe('class1 class3');
  });

  it('should handle mixed inputs', () => {
    const result = cn(
      'base',
      ['array1', 'array2'],
      {
        'conditional': true,
        'hidden': false,
      },
      'final'
    );
    expect(result).toBe('base array1 array2 conditional final');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle single class', () => {
    const result = cn('single');
    expect(result).toBe('single');
  });

  it('should handle duplicate classes', () => {
    const result = cn('class1 class2', 'class2 class3');
    // The cn utility doesn't deduplicate by default
    expect(result).toBe('class1 class2 class2 class3');
  });
});
