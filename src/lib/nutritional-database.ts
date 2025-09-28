/**
 * Base de données nutritionnelle scientifiquement validée
 * Sources: USDA Food Database, Open Food Facts, recommandations nutritionnelles officielles
 */

export interface NutritionalData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface SmartFood {
  id: string;
  name: string;
  category: 'protein' | 'carbs' | 'fat' | 'balanced' | 'snack';
  per100g: NutritionalData;
  benefits: string[];
  idealQuantity: string;
  priority: 'high' | 'medium' | 'low';
  userGoal: ('weight_loss' | 'muscle_gain' | 'maintenance')[];
}

export interface NutritionalGap {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SmartSuggestion {
  food: SmartFood;
  quantity: string;
  nutritionalValue: NutritionalData;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCalories: number;
}

/**
 * Base de données d'aliments scientifiquement validés
 * Données nutritionnelles par 100g
 */
export const SMART_FOODS: SmartFood[] = [
  // PROTÉINES - Priorité haute pour musculation
  {
    id: 'chicken_breast',
    name: 'Blanc de poulet',
    category: 'protein',
    per100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
    },
    benefits: [
      'Protéines complètes',
      'Faible en gras',
      'Riche en B12',
      'Sélénium',
    ],
    idealQuantity: '100g',
    priority: 'high',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },
  {
    id: 'salmon',
    name: 'Saumon',
    category: 'protein',
    per100g: {
      calories: 208,
      protein: 25,
      carbs: 0,
      fat: 12,
      fiber: 0,
      sugar: 0,
      sodium: 44,
    },
    benefits: ['Oméga-3', 'Protéines complètes', 'Vitamine D', 'B12'],
    idealQuantity: '120g',
    priority: 'high',
    userGoal: ['muscle_gain', 'maintenance'],
  },
  {
    id: 'greek_yogurt',
    name: 'Yaourt grec 0%',
    category: 'protein',
    per100g: {
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
      fiber: 0,
      sugar: 3.6,
      sodium: 36,
    },
    benefits: [
      'Protéines rapides',
      'Probiotiques',
      'Calcium',
      'Faible en calories',
    ],
    idealQuantity: '150g',
    priority: 'high',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },
  {
    id: 'eggs',
    name: 'Œufs entiers',
    category: 'protein',
    per100g: {
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      sugar: 1.1,
      sodium: 124,
    },
    benefits: ['Protéines complètes', 'Choline', 'Lutéine', 'Vitamine D'],
    idealQuantity: '2 œufs (100g)',
    priority: 'high',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },

  // GLUCIDES - Priorité pour énergie
  {
    id: 'brown_rice',
    name: 'Riz complet',
    category: 'carbs',
    per100g: {
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.4,
      sodium: 5,
    },
    benefits: ['Glucides complexes', 'Fibres', 'Magnésium', 'Énergie durable'],
    idealQuantity: '80g cru',
    priority: 'medium',
    userGoal: ['muscle_gain', 'maintenance'],
  },
  {
    id: 'sweet_potato',
    name: 'Patate douce',
    category: 'carbs',
    per100g: {
      calories: 86,
      protein: 1.6,
      carbs: 20,
      fat: 0.1,
      fiber: 3,
      sugar: 4.2,
      sodium: 54,
    },
    benefits: ['Bêta-carotène', 'Fibres', 'Potassium', 'Vitamine C'],
    idealQuantity: '150g',
    priority: 'medium',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },
  {
    id: 'oats',
    name: "Flocons d'avoine",
    category: 'carbs',
    per100g: {
      calories: 389,
      protein: 17,
      carbs: 66,
      fat: 7,
      fiber: 11,
      sugar: 1,
      sodium: 2,
    },
    benefits: [
      'Bêta-glucanes',
      'Fibres solubles',
      'Protéines végétales',
      'Satiété',
    ],
    idealQuantity: '50g',
    priority: 'high',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },

  // LIPIDES - Priorité pour santé
  {
    id: 'avocado',
    name: 'Avocat',
    category: 'fat',
    per100g: {
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 15,
      fiber: 7,
      sugar: 0.7,
      sodium: 7,
    },
    benefits: ['Acides gras monoinsaturés', 'Fibres', 'Potassium', 'Folates'],
    idealQuantity: '1/2 avocat (75g)',
    priority: 'medium',
    userGoal: ['weight_loss', 'maintenance'],
  },
  {
    id: 'almonds',
    name: 'Amandes',
    category: 'fat',
    per100g: {
      calories: 579,
      protein: 21,
      carbs: 22,
      fat: 50,
      fiber: 12,
      sugar: 4.4,
      sodium: 1,
    },
    benefits: ['Vitamine E', 'Magnésium', 'Protéines végétales', 'Fibres'],
    idealQuantity: '30g',
    priority: 'medium',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },
  {
    id: 'olive_oil',
    name: "Huile d'olive",
    category: 'fat',
    per100g: {
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0,
      sugar: 0,
      sodium: 2,
    },
    benefits: [
      'Acides gras monoinsaturés',
      'Antioxydants',
      'Vitamine E',
      'Anti-inflammatoire',
    ],
    idealQuantity: '1 cuillère à soupe (15ml)',
    priority: 'low',
    userGoal: ['weight_loss', 'maintenance'],
  },

  // ÉQUILIBRÉ - Pour combler plusieurs macros
  {
    id: 'quinoa',
    name: 'Quinoa',
    category: 'balanced',
    per100g: {
      calories: 120,
      protein: 4.4,
      carbs: 22,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9,
      sodium: 7,
    },
    benefits: ['Protéines complètes', 'Fibres', 'Fer', 'Magnésium'],
    idealQuantity: '80g cru',
    priority: 'high',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },
  {
    id: 'lentils',
    name: 'Lentilles',
    category: 'balanced',
    per100g: {
      calories: 116,
      protein: 9,
      carbs: 20,
      fat: 0.4,
      fiber: 8,
      sugar: 1.8,
      sodium: 2,
    },
    benefits: ['Protéines végétales', 'Fibres', 'Fer', 'Folates'],
    idealQuantity: '100g cuites',
    priority: 'medium',
    userGoal: ['muscle_gain', 'weight_loss', 'maintenance'],
  },

  // COLLATIONS - Pour petits gaps
  {
    id: 'banana',
    name: 'Banane',
    category: 'snack',
    per100g: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12,
      sodium: 1,
    },
    benefits: ['Potassium', 'Vitamine B6', 'Énergie rapide', 'Magnésium'],
    idealQuantity: '1 banane (120g)',
    priority: 'low',
    userGoal: ['muscle_gain', 'maintenance'],
  },
  {
    id: 'apple',
    name: 'Pomme',
    category: 'snack',
    per100g: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10,
      sodium: 1,
    },
    benefits: ['Fibres', 'Vitamine C', 'Antioxydants', 'Faible en calories'],
    idealQuantity: '1 pomme (150g)',
    priority: 'low',
    userGoal: ['weight_loss', 'maintenance'],
  },
];

/**
 * Calcule les gaps nutritionnels entre objectifs et consommation actuelle
 */
export function calculateNutritionalGap(
  current: NutritionalData,
  target: NutritionalData,
): NutritionalGap {
  return {
    calories: Math.max(0, target.calories - current.calories),
    protein: Math.max(0, target.protein - current.protein),
    carbs: Math.max(0, target.carbs - current.carbs),
    fat: Math.max(0, target.fat - current.fat),
  };
}

/**
 * Génère des suggestions intelligentes basées sur les gaps nutritionnels
 */
export function generateSmartSuggestions(
  gap: NutritionalGap,
  userGoal: 'weight_loss' | 'muscle_gain' | 'maintenance',
  maxSuggestions: number = 3,
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  // Filtrer les aliments selon l'objectif utilisateur
  const availableFoods = SMART_FOODS.filter((food) =>
    food.userGoal.includes(userGoal),
  );

  // Priorité 1: Protéines (si gap > 20g)
  if (gap.protein > 20) {
    const proteinFoods = availableFoods.filter(
      (food) => food.category === 'protein' && food.priority === 'high',
    );

    for (const food of proteinFoods.slice(0, 2)) {
      const quantity = calculateOptimalQuantity(food, gap.protein, 'protein');
      const nutritionalValue = calculateNutritionalValue(food, quantity);

      suggestions.push({
        food,
        quantity,
        nutritionalValue,
        reason: `Pour compléter vos protéines (${Math.round(gap.protein)}g restants)`,
        priority: 'high',
        estimatedCalories: nutritionalValue.calories,
      });
    }
  }

  // Priorité 2: Glucides (si gap > 50g)
  if (gap.carbs > 50) {
    const carbFoods = availableFoods.filter(
      (food) => food.category === 'carbs' && food.priority === 'high',
    );

    for (const food of carbFoods.slice(0, 1)) {
      const quantity = calculateOptimalQuantity(food, gap.carbs, 'carbs');
      const nutritionalValue = calculateNutritionalValue(food, quantity);

      suggestions.push({
        food,
        quantity,
        nutritionalValue,
        reason: `Pour compléter vos glucides (${Math.round(gap.carbs)}g restants)`,
        priority: 'medium',
        estimatedCalories: nutritionalValue.calories,
      });
    }
  }

  // Priorité 3: Lipides (si gap > 20g)
  if (gap.fat > 20) {
    const fatFoods = availableFoods.filter(
      (food) => food.category === 'fat' && food.priority === 'medium',
    );

    for (const food of fatFoods.slice(0, 1)) {
      const quantity = calculateOptimalQuantity(food, gap.fat, 'fat');
      const nutritionalValue = calculateNutritionalValue(food, quantity);

      suggestions.push({
        food,
        quantity,
        nutritionalValue,
        reason: `Pour compléter vos lipides (${Math.round(gap.fat)}g restants)`,
        priority: 'medium',
        estimatedCalories: nutritionalValue.calories,
      });
    }
  }

  // Si pas assez de suggestions, ajouter des aliments équilibrés
  if (suggestions.length < maxSuggestions) {
    const balancedFoods = availableFoods.filter(
      (food) =>
        food.category === 'balanced' &&
        !suggestions.some((s) => s.food.id === food.id),
    );

    for (const food of balancedFoods.slice(
      0,
      maxSuggestions - suggestions.length,
    )) {
      const quantity = food.idealQuantity;
      const nutritionalValue = calculateNutritionalValue(food, quantity);

      suggestions.push({
        food,
        quantity,
        nutritionalValue,
        reason: `Aliment équilibré pour compléter vos macros`,
        priority: 'low',
        estimatedCalories: nutritionalValue.calories,
      });
    }
  }

  return suggestions.slice(0, maxSuggestions);
}

/**
 * Calcule la quantité optimale d'un aliment pour combler un gap spécifique
 */
function calculateOptimalQuantity(
  food: SmartFood,
  gap: number,
  macro: 'protein' | 'carbs' | 'fat',
): string {
  const macroValue = food.per100g[macro];
  const neededGrams = Math.min(200, Math.max(50, (gap / macroValue) * 100));

  // Arrondir à des quantités pratiques
  if (neededGrams < 75) return '50g';
  if (neededGrams < 125) return '100g';
  if (neededGrams < 175) return '150g';
  return '200g';
}

/**
 * Calcule la valeur nutritionnelle pour une quantité donnée
 */
function calculateNutritionalValue(
  food: SmartFood,
  quantity: string,
): NutritionalData {
  const quantityGrams = parseQuantity(quantity);
  const multiplier = quantityGrams / 100;

  return {
    calories: Math.round(food.per100g.calories * multiplier),
    protein: Math.round(food.per100g.protein * multiplier * 10) / 10,
    carbs: Math.round(food.per100g.carbs * multiplier * 10) / 10,
    fat: Math.round(food.per100g.fat * multiplier * 10) / 10,
    fiber: food.per100g.fiber
      ? Math.round(food.per100g.fiber * multiplier * 10) / 10
      : undefined,
    sugar: food.per100g.sugar
      ? Math.round(food.per100g.sugar * multiplier * 10) / 10
      : undefined,
    sodium: food.per100g.sodium
      ? Math.round(food.per100g.sodium * multiplier)
      : undefined,
  };
}

/**
 * Parse une quantité en grammes
 */
function parseQuantity(quantity: string): number {
  const match = quantity.match(/(\d+)/);
  return match ? parseInt(match[1]) : 100;
}
