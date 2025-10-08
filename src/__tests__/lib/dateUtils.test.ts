import { describe, it, expect, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import {
  dateToTimestamp,
  timestampToDateString,
  isTimestamp,
  compareDates,
} from '@/lib/dateUtils';

// Mock Timestamp de Firebase pour les tests
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  
  // Créer une classe Timestamp mockée
  class MockTimestamp {
    constructor(public seconds: number, public nanoseconds: number) {}
    
    toDate(): Date {
      return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
    }
    
    static fromDate(date: Date): MockTimestamp {
      return new MockTimestamp(
        Math.floor(date.getTime() / 1000),
        (date.getTime() % 1000) * 1000000
      );
    }
    
    static now(): MockTimestamp {
      return MockTimestamp.fromDate(new Date());
    }
  }
  
  return {
    ...actual,
    Timestamp: MockTimestamp,
  };
});

describe('dateUtils', () => {
  describe('dateToTimestamp', () => {
    it('should convert date string to Timestamp', () => {
      const dateString = '2025-01-15';
      const result = dateToTimestamp(dateString);
      
      expect(result).toBeInstanceOf(Timestamp);
      expect(result.toDate().toISOString().split('T')[0]).toBe(dateString);
    });

    it('should handle undefined input', () => {
      const result = dateToTimestamp(undefined);
      
      expect(result).toBeInstanceOf(Timestamp);
      // Should default to today
      const today = new Date().toISOString().split('T')[0];
      expect(result.toDate().toISOString().split('T')[0]).toBe(today);
    });

    it('should handle invalid date string', () => {
      const invalidDate = 'invalid-date';
      const result = dateToTimestamp(invalidDate);
      
      expect(result).toBeInstanceOf(Timestamp);
      // Should default to today
      const today = new Date().toISOString().split('T')[0];
      expect(result.toDate().toISOString().split('T')[0]).toBe(today);
    });
  });

  describe('timestampToDateString', () => {
    it('should convert Timestamp to date string', () => {
      const dateString = '2025-01-15';
      const timestamp = Timestamp.fromDate(new Date(dateString + 'T12:00:00'));
      const result = timestampToDateString(timestamp);
      
      expect(result).toBe(dateString);
    });

    it('should handle string input', () => {
      const dateString = '2025-01-15';
      const result = timestampToDateString(dateString);
      
      expect(result).toBe(dateString);
    });

    it('should handle undefined input', () => {
      const result = timestampToDateString(undefined);
      
      const today = new Date().toISOString().split('T')[0];
      expect(result).toBe(today);
    });

    it('should handle invalid Timestamp', () => {
      const invalidTimestamp = {
        toDate: () => new Date('invalid'),
        seconds: 0,
        nanoseconds: 0
      } as unknown as Timestamp;
      
      const result = timestampToDateString(invalidTimestamp);
      
      const today = new Date().toISOString().split('T')[0];
      expect(result).toBe(today);
    });
  });

  describe('isTimestamp', () => {
    it('should identify Timestamp objects', () => {
      const timestamp = Timestamp.fromDate(new Date());
      expect(isTimestamp(timestamp)).toBe(true);
    });

    it('should reject non-Timestamp objects', () => {
      expect(isTimestamp('2025-01-15')).toBe(false);
      expect(isTimestamp(new Date())).toBe(false);
      expect(isTimestamp(null)).toBe(false);
      expect(isTimestamp(undefined)).toBe(false);
      expect(isTimestamp({})).toBe(false);
      expect(isTimestamp(123)).toBe(false);
    });

    it('should reject objects with partial Timestamp structure', () => {
      expect(isTimestamp({ toDate: () => new Date() })).toBe(false); // Manque seconds
      expect(isTimestamp({ seconds: 123 })).toBe(false); // Manque toDate
      expect(isTimestamp({ toDate: () => new Date(), seconds: 'invalid' })).toBe(false); // ← CORRECTION : seconds invalide
    });
  });

  describe('compareDates', () => {
    const createMockItem = (date: Timestamp | string) => ({ date });

    it('should sort Timestamps in descending order by default', () => {
      const items = [
        createMockItem('2025-01-15'),
        createMockItem('2025-01-17'),
        createMockItem('2025-01-16'),
      ];
      
      const sorted = items.sort(compareDates('desc'));
      
      expect(sorted[0].date).toBe('2025-01-17');
      expect(sorted[1].date).toBe('2025-01-16');
      expect(sorted[2].date).toBe('2025-01-15');
    });

    it('should sort Timestamps in ascending order', () => {
      const items = [
        createMockItem('2025-01-17'),
        createMockItem('2025-01-15'),
        createMockItem('2025-01-16'),
      ];
      
      const sorted = items.sort(compareDates('asc'));
      
      expect(sorted[0].date).toBe('2025-01-15');
      expect(sorted[1].date).toBe('2025-01-16');
      expect(sorted[2].date).toBe('2025-01-17');
    });

    it('should handle mixed Timestamp and string dates', () => {
      const items = [
        createMockItem('2025-01-15'),
        createMockItem(Timestamp.fromDate(new Date('2025-01-17T12:00:00'))),
        createMockItem('2025-01-16'),
      ];
      
      const sorted = items.sort(compareDates('desc'));
      
      expect(timestampToDateString(sorted[0].date)).toBe('2025-01-17');
      expect(sorted[1].date).toBe('2025-01-16');
      expect(sorted[2].date).toBe('2025-01-15');
    });

    it('should handle invalid dates gracefully', () => {
      const items = [
        createMockItem('Invalid Date'),
        createMockItem('2025-01-15'),
        createMockItem('Invalid Date'),
      ];
      
      const sorted = items.sort(compareDates('desc'));
      
      // Should not throw and should handle gracefully
      expect(sorted).toHaveLength(3);
    });

    it('should handle undefined dates', () => {
      const items = [
        createMockItem(undefined as unknown),
        createMockItem('2025-01-15'),
        createMockItem(undefined as unknown),
      ];
      
      const sorted = items.sort(compareDates('desc'));
      
      // Should not throw and should handle gracefully
      expect(sorted).toHaveLength(3);
    });

    it('should return 0 for identical dates', () => {
      const compare = compareDates('desc');
      const result = compare(
        createMockItem('2025-01-15'),
        createMockItem('2025-01-15')
      );
      
      expect(result).toBe(0);
    });
  });
});
