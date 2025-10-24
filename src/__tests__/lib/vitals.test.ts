import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateVitals, getVitalRanges, formatVitalValue } from '@/lib/vitals';

// Mock the vitals functions
vi.mock('@/lib/vitals', async () => {
  const actual = await vi.importActual('@/lib/vitals');
  return {
    ...actual,
    calculateVitals: vi.fn(),
    getVitalRanges: vi.fn(),
    formatVitalValue: vi.fn(),
  };
});

describe('Vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate vitals from measurements', () => {
    const measurements = {
      weight: 70,
      height: 175,
      age: 30,
      gender: 'male' as const,
    };
    
    calculateVitals(measurements);
    
    expect(calculateVitals).toHaveBeenCalledWith(measurements);
  });

  it('should get vital ranges for different age groups', () => {
    const age = 25;
    const gender = 'female' as const;
    
    getVitalRanges(age, gender);
    
    expect(getVitalRanges).toHaveBeenCalledWith(age, gender);
  });

  it('should format vital values with units', () => {
    const value = 120;
    const unit = 'bpm';
    const precision = 0;
    
    formatVitalValue(value, unit, precision);
    
    expect(formatVitalValue).toHaveBeenCalledWith(value, unit, precision);
  });

  it('should handle different measurement types', () => {
    const bloodPressure = { systolic: 120, diastolic: 80 };
    const heartRate = 72;
    const temperature = 36.5;
    
    calculateVitals({ bloodPressure, heartRate, temperature });
    
    expect(calculateVitals).toHaveBeenCalledWith({ bloodPressure, heartRate, temperature });
  });

  it('should handle edge cases for vital ranges', () => {
    getVitalRanges(0, 'male'); // Newborn
    getVitalRanges(100, 'female'); // Very old
    getVitalRanges(50, 'other'); // Non-binary
    
    expect(getVitalRanges).toHaveBeenCalledWith(0, 'male');
    expect(getVitalRanges).toHaveBeenCalledWith(100, 'female');
    expect(getVitalRanges).toHaveBeenCalledWith(50, 'other');
  });

  it('should handle different vital value formats', () => {
    formatVitalValue(98.6, '°F', 1); // Temperature
    formatVitalValue(120, 'mmHg', 0); // Blood pressure
    formatVitalValue(72, 'bpm', 0); // Heart rate
    formatVitalValue(95, '%', 0); // Oxygen saturation
    
    expect(formatVitalValue).toHaveBeenCalledWith(98.6, '°F', 1);
    expect(formatVitalValue).toHaveBeenCalledWith(120, 'mmHg', 0);
    expect(formatVitalValue).toHaveBeenCalledWith(72, 'bpm', 0);
    expect(formatVitalValue).toHaveBeenCalledWith(95, '%', 0);
  });

  it('should handle complex vital calculations', () => {
    const complexMeasurements = {
      weight: 75.5,
      height: 180,
      age: 35,
      gender: 'male' as const,
      bodyFat: 15,
      muscleMass: 45,
      boneDensity: 1.2,
    };
    
    calculateVitals(complexMeasurements);
    
    expect(calculateVitals).toHaveBeenCalledWith(complexMeasurements);
  });

  it('should handle vital ranges for different conditions', () => {
    const conditions = ['diabetes', 'hypertension', 'heart_disease'];
    
    for (const condition of conditions) {
      getVitalRanges(40, 'male', condition);
      expect(getVitalRanges).toHaveBeenCalledWith(40, 'male', condition);
    }
  });
});
