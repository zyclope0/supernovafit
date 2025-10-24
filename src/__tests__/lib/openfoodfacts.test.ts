import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFood, getFoodDetails, getNutritionData } from '@/lib/openfoodfacts';

// Mock the openfoodfacts functions
vi.mock('@/lib/openfoodfacts', async () => {
  const actual = await vi.importActual('@/lib/openfoodfacts');
  return {
    ...actual,
    searchFood: vi.fn(),
    getFoodDetails: vi.fn(),
    getNutritionData: vi.fn(),
  };
});

describe('OpenFoodFacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search for food items', async () => {
    const query = 'apple';
    const options = { limit: 10, page: 1 };
    
    await searchFood(query, options);
    
    expect(searchFood).toHaveBeenCalledWith(query, options);
  });

  it('should get food details by barcode', async () => {
    const barcode = '1234567890123';
    
    await getFoodDetails(barcode);
    
    expect(getFoodDetails).toHaveBeenCalledWith(barcode);
  });

  it('should get nutrition data for a food item', async () => {
    const foodId = 'food123';
    const options = { includeAllergens: true, includeAdditives: false };
    
    await getNutritionData(foodId, options);
    
    expect(getNutritionData).toHaveBeenCalledWith(foodId, options);
  });

  it('should handle search with default options', async () => {
    const query = 'banana';
    
    await searchFood(query);
    
    expect(searchFood).toHaveBeenCalledWith(query);
  });

  it('should handle food details without options', async () => {
    const barcode = '9876543210987';
    
    await getFoodDetails(barcode);
    
    expect(getFoodDetails).toHaveBeenCalledWith(barcode);
  });

  it('should handle nutrition data with minimal options', async () => {
    const foodId = 'food456';
    
    await getNutritionData(foodId);
    
    expect(getNutritionData).toHaveBeenCalledWith(foodId);
  });

  it('should handle complex search queries', async () => {
    const complexQuery = 'organic whole wheat bread';
    const complexOptions = {
      limit: 20,
      page: 2,
      sortBy: 'popularity',
      filters: { category: 'bread', brand: 'organic' },
    };
    
    await searchFood(complexQuery, complexOptions);
    
    expect(searchFood).toHaveBeenCalledWith(complexQuery, complexOptions);
  });

  it('should handle different barcode formats', async () => {
    const barcodes = [
      '1234567890123', // 13 digits
      '123456789012',  // 12 digits
      '12345678901',   // 11 digits
      '1234567890',    // 10 digits
    ];
    
    for (const barcode of barcodes) {
      await getFoodDetails(barcode);
      expect(getFoodDetails).toHaveBeenCalledWith(barcode);
    }
  });

  it('should handle nutrition data with various options', async () => {
    const foodId = 'food789';
    const options = {
      includeAllergens: true,
      includeAdditives: true,
      includeIngredients: true,
      includeNutritionFacts: true,
    };
    
    await getNutritionData(foodId, options);
    
    expect(getNutritionData).toHaveBeenCalledWith(foodId, options);
  });
});
