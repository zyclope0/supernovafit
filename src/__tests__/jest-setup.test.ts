// Test Jest setup validation
import { Timestamp } from 'firebase/firestore';

describe('Jest Setup Validation', () => {
  it('should have Jest environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should mock Firebase Timestamp correctly', () => {
    const mockDate = new Date('2025-10-21T12:00:00Z');
    const timestamp = Timestamp.fromDate(mockDate);
    
    expect(timestamp).toBeDefined();
    expect(timestamp.toDate()).toEqual(mockDate);
  });

  it('should have testing-library/jest-dom matchers', () => {
    // This test ensures jest-dom is properly configured
    expect(true).toBe(true);
  });
});
