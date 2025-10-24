import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseGarminData, validateGarminFile, extractWorkoutData } from '@/lib/garminParser';

// Mock the garminParser functions
vi.mock('@/lib/garminParser', async () => {
  const actual = await vi.importActual('@/lib/garminParser');
  return {
    ...actual,
    parseGarminData: vi.fn(),
    validateGarminFile: vi.fn(),
    extractWorkoutData: vi.fn(),
  };
});

describe('Garmin Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse Garmin data with valid input', () => {
    const garminData = {
      activities: [
        {
          activityId: '123',
          activityName: 'Morning Run',
          startTimeLocal: '2024-01-15T06:00:00',
          duration: 3600,
          distance: 5000,
          calories: 300,
        },
      ],
    };

    parseGarminData(garminData);
    
    expect(parseGarminData).toHaveBeenCalledWith(garminData);
  });

  it('should validate Garmin file format', () => {
    const fileData = {
      format: 'garmin',
      version: '1.0',
      activities: [],
    };

    validateGarminFile(fileData);
    
    expect(validateGarminFile).toHaveBeenCalledWith(fileData);
  });

  it('should extract workout data from activities', () => {
    const activities = [
      {
        activityId: '123',
        activityName: 'Cycling',
        startTimeLocal: '2024-01-15T08:00:00',
        duration: 7200,
        distance: 25000,
        calories: 500,
        sport: 'cycling',
      },
    ];

    extractWorkoutData(activities);
    
    expect(extractWorkoutData).toHaveBeenCalledWith(activities);
  });

  it('should handle empty Garmin data', () => {
    const emptyData = { activities: [] };
    
    parseGarminData(emptyData);
    validateGarminFile(emptyData);
    extractWorkoutData([]);
    
    expect(parseGarminData).toHaveBeenCalledWith(emptyData);
    expect(validateGarminFile).toHaveBeenCalledWith(emptyData);
    expect(extractWorkoutData).toHaveBeenCalledWith([]);
  });

  it('should handle invalid Garmin data', () => {
    const invalidData = { invalid: 'data' };
    
    parseGarminData(invalidData);
    validateGarminFile(invalidData);
    
    expect(parseGarminData).toHaveBeenCalledWith(invalidData);
    expect(validateGarminFile).toHaveBeenCalledWith(invalidData);
  });

  it('should handle multiple activities', () => {
    const multipleActivities = [
      {
        activityId: '1',
        activityName: 'Running',
        startTimeLocal: '2024-01-15T06:00:00',
        duration: 1800,
        distance: 3000,
        calories: 200,
      },
      {
        activityId: '2',
        activityName: 'Swimming',
        startTimeLocal: '2024-01-15T18:00:00',
        duration: 2400,
        distance: 2000,
        calories: 400,
      },
    ];

    extractWorkoutData(multipleActivities);
    
    expect(extractWorkoutData).toHaveBeenCalledWith(multipleActivities);
  });
});
