/**
 * Utilitaires d'import nutrition pour SuperNovaFit
 * Gère l'import de données nutrition depuis MyFitnessPal, Yazio, Cronometer
 */

import Papa from 'papaparse';
import type { Repas } from '@/types';

export interface ImportConfig {
  format: 'myfitnesspal' | 'yazio' | 'cronometer';
  userId: string;
  dateFormat?: string;
  mealMapping?: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
  warnings: string[];
  data: Repas[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  sampleData: Repas[];
  errors: ImportError[];
  warnings: string[];
}

/**
 * Parse un fichier CSV/JSON et retourne un aperçu des données
 */
export async function parseNutritionFile(
  file: File,
  config: ImportConfig,
): Promise<ImportPreview> {
  try {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return await parseCSVFile(file, config);
    } else if (extension === 'json') {
      return await parseJSONFile(file, config);
    } else {
      throw new Error('Format de fichier non supporté. Utilisez CSV ou JSON.');
    }
  } catch (err) {
    throw new Error(
      `Erreur lors du parsing: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
    );
  }
}

/**
 * Parse un fichier CSV
 */
async function parseCSVFile(
  file: File,
  config: ImportConfig,
): Promise<ImportPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const preview = processCSVData(results.data, config);
          resolve(preview);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Erreur CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Parse un fichier JSON
 */
async function parseJSONFile(
  file: File,
  config: ImportConfig,
): Promise<ImportPreview> {
  try {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    return processJSONData(jsonData, config);
  } catch (error) {
    throw new Error(
      `Erreur JSON: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    );
  }
}

/**
 * Traite les données CSV selon le format
 */
function processCSVData(data: any[], config: ImportConfig): ImportPreview {
  const errors: ImportError[] = [];
  const warnings: string[] = [];
  const validRows: Repas[] = [];

  data.forEach((row, index) => {
    try {
      const repas = parseCSVRow(row, config, index + 1);
      if (repas) {
        validRows.push(repas);
      }
    } catch (error) {
      errors.push({
        row: index + 1,
        field: 'general',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        value: JSON.stringify(row),
      });
    }
  });

  return {
    totalRows: data.length,
    validRows: validRows.length,
    sampleData: validRows.slice(0, 10), // 10 premiers repas pour aperçu
    errors,
    warnings,
  };
}

/**
 * Traite les données JSON selon le format
 */
function processJSONData(data: any, config: ImportConfig): ImportPreview {
  const errors: ImportError[] = [];
  const warnings: string[] = [];
  const validRows: Repas[] = [];

  try {
    const repasList = parseJSONData(data, config);
    validRows.push(...repasList);
  } catch (error) {
    errors.push({
      row: 1,
      field: 'general',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      value: JSON.stringify(data),
    });
  }

  return {
    totalRows: Array.isArray(data) ? data.length : 1,
    validRows: validRows.length,
    sampleData: validRows.slice(0, 10),
    errors,
    warnings,
  };
}

/**
 * Parse une ligne CSV selon le format
 */
function parseCSVRow(
  row: any,
  config: ImportConfig,
  rowNumber: number,
): Repas | null {
  try {
    switch (config.format) {
      case 'myfitnesspal':
        return parseMyFitnessPalRow(row, config, rowNumber);
      case 'yazio':
        return parseYazioRow(row, config, rowNumber);
      default:
        throw new Error(`Format non supporté: ${config.format}`);
    }
  } catch (error) {
    throw new Error(
      `Ligne ${rowNumber}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    );
  }
}

/**
 * Parse une ligne MyFitnessPal
 */
function parseMyFitnessPalRow(
  row: any,
  config: ImportConfig,
  rowNumber: number,
): Repas {
  // Format MyFitnessPal: Date,Meal,Food,Calories,Protein,Carbs,Fat
  const requiredFields = ['Date', 'Meal', 'Food', 'Calories'];

  for (const field of requiredFields) {
    if (!row[field]) {
      throw new Error(`Champ requis manquant: ${field}`);
    }
  }

  const date = parseDate(row.Date, config.dateFormat);
  const meal = mapMealType(row.Meal, config.mealMapping);
  const food = row.Food;
  const calories = parseNumber(row.Calories, 'Calories');
  const protein = parseNumber(row.Protein || '0', 'Protein');
  const carbs = parseNumber(row.Carbs || '0', 'Carbs');
  const fat = parseNumber(row.Fat || '0', 'Fat');

  return {
    id: `import_${Date.now()}_${rowNumber}`,
    user_id: config.userId,
    date: date.toISOString().split('T')[0],
    repas: meal,
    aliments: [
      {
        id: `aliment_${Date.now()}_${rowNumber}`,
        nom: food,
        quantite: 100, // Quantité par défaut
        unite: 'g',
      },
    ],
    macros: {
      kcal: calories,
      prot: protein,
      glucides: carbs,
      lipides: fat,
    },
  };
}

/**
 * Parse une ligne Yazio
 */
function parseYazioRow(
  row: any,
  config: ImportConfig,
  rowNumber: number,
): Repas {
  // Format Yazio: date;meal_type;product;kcal;protein;carbs;fat
  const requiredFields = ['date', 'meal_type', 'product', 'kcal'];

  for (const field of requiredFields) {
    if (!row[field]) {
      throw new Error(`Champ requis manquant: ${field}`);
    }
  }

  const date = parseDate(row.date, config.dateFormat || 'dd.MM.yyyy');
  const meal = mapMealType(row.meal_type, config.mealMapping);
  const product = row.product;
  const kcal = parseNumber(row.kcal, 'kcal');
  const protein = parseNumber(row.protein || '0', 'protein');
  const carbs = parseNumber(row.carbs || '0', 'carbs');
  const fat = parseNumber(row.fat || '0', 'fat');

  return {
    id: `import_${Date.now()}_${rowNumber}`,
    user_id: config.userId,
    date: date.toISOString().split('T')[0],
    repas: meal,
    aliments: [
      {
        id: `aliment_${Date.now()}_${rowNumber}`,
        nom: product,
        quantite: 100, // Quantité par défaut
        unite: 'g',
      },
    ],
    macros: {
      kcal,
      prot: protein,
      glucides: carbs,
      lipides: fat,
    },
  };
}

/**
 * Parse les données JSON Cronometer
 */
function parseJSONData(data: any, config: ImportConfig): Repas[] {
  if (!data.date || !Array.isArray(data.foods)) {
    throw new Error(
      'Format JSON invalide. Attendu: { date: string, foods: array }',
    );
  }

  const date = parseDate(data.date, config.dateFormat);
  const repas: Repas[] = [];

  data.foods.forEach((food: any, index: number) => {
    if (!food.name || !food.kcal) {
      throw new Error(`Aliment ${index + 1}: nom ou calories manquants`);
    }

    repas.push({
      id: `import_${Date.now()}_${index}`,
      user_id: config.userId,
      date: date.toISOString().split('T')[0],
      repas: 'dejeuner', // Par défaut
      aliments: [
        {
          id: `aliment_${Date.now()}_${index}`,
          nom: food.name,
          quantite: food.quantity || 100,
          unite: food.unit || 'g',
        },
      ],
      macros: {
        kcal: parseNumber(food.kcal, 'kcal'),
        prot: parseNumber(food.protein || '0', 'protein'),
        glucides: parseNumber(food.carbs || '0', 'carbs'),
        lipides: parseNumber(food.fat || '0', 'fat'),
      },
    });
  });

  return repas;
}

/**
 * Parse une date selon le format
 */
function parseDate(dateStr: string, format?: string): Date {
  try {
    if (format === 'dd.MM.yyyy') {
      // Format Yazio: 14.10.2025
      const [day, month, year] = dateStr.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Format ISO ou autre
      return new Date(dateStr);
    }
  } catch {
    throw new Error(`Date invalide: ${dateStr}`);
  }
}

/**
 * Parse un nombre
 */
function parseNumber(value: string, field: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`${field} invalide: ${value}`);
  }
  return num;
}

/**
 * Mappe le type de repas
 */
function mapMealType(
  meal: string,
  mapping?: Record<string, string>,
):
  | 'petit_dej'
  | 'collation_matin'
  | 'dejeuner'
  | 'collation_apres_midi'
  | 'diner'
  | 'collation_soir' {
  const defaultMapping: Record<string, string> = {
    // MyFitnessPal
    Breakfast: 'petit_dej',
    Lunch: 'dejeuner',
    Dinner: 'diner',
    Snacks: 'collation_apres_midi',

    // Yazio
    Frühstück: 'petit_dej',
    Mittagessen: 'dejeuner',
    Abendessen: 'diner',

    // Générique
    'Petit-déjeuner': 'petit_dej',
    Déjeuner: 'dejeuner',
    Dîner: 'diner',
    Collation: 'collation_apres_midi',
  };

  const finalMapping = { ...defaultMapping, ...mapping };
  const mappedMeal = finalMapping[meal] || 'dejeuner';

  // Validation du type de retour
  const validMeals = [
    'petit_dej',
    'collation_matin',
    'dejeuner',
    'collation_apres_midi',
    'diner',
    'collation_soir',
  ];
  if (validMeals.includes(mappedMeal)) {
    return mappedMeal as
      | 'petit_dej'
      | 'collation_matin'
      | 'dejeuner'
      | 'collation_apres_midi'
      | 'diner'
      | 'collation_soir';
  }
  return 'dejeuner';
}

/**
 * Valide les données importées
 */
export function validateImportedData(data: Repas[]): ImportResult {
  const errors: ImportError[] = [];
  const warnings: string[] = [];
  const validData: Repas[] = [];

  data.forEach((repas, index) => {
    const validationErrors = validateRepas(repas, index);

    if (validationErrors.length === 0) {
      validData.push(repas);
    } else {
      errors.push(...validationErrors);
    }
  });

  // Warnings
  if (data.length > 1000) {
    warnings.push(
      "Import de plus de 1000 repas détecté. L'opération peut prendre du temps.",
    );
  }

  const duplicateDates = findDuplicateDates(data);
  if (duplicateDates.length > 0) {
    warnings.push(`${duplicateDates.length} dates dupliquées détectées.`);
  }

  return {
    success: errors.length === 0,
    imported: validData.length,
    errors,
    warnings,
    data: validData,
  };
}

/**
 * Valide un repas individuel
 */
function validateRepas(repas: Repas, index: number): ImportError[] {
  const errors: ImportError[] = [];

  if (!repas.date) {
    errors.push({
      row: index + 1,
      field: 'date',
      message: 'Date manquante',
      value: '',
    });
  }

  if (!repas.repas) {
    errors.push({
      row: index + 1,
      field: 'repas',
      message: 'Type de repas manquant',
      value: '',
    });
  }

  if (!repas.aliments || repas.aliments.length === 0) {
    errors.push({
      row: index + 1,
      field: 'aliments',
      message: 'Aucun aliment spécifié',
      value: '',
    });
  }

  if (!repas.macros || repas.macros.kcal <= 0) {
    errors.push({
      row: index + 1,
      field: 'macros.kcal',
      message: 'Calories manquantes ou invalides',
      value: repas.macros?.kcal?.toString() || '0',
    });
  }

  return errors;
}

/**
 * Trouve les dates dupliquées
 */
function findDuplicateDates(data: Repas[]): string[] {
  const dates = new Set<string>();
  const duplicates = new Set<string>();

  data.forEach((repas) => {
    if (repas.date) {
      if (dates.has(repas.date)) {
        duplicates.add(repas.date);
      } else {
        dates.add(repas.date);
      }
    }
  });

  return Array.from(duplicates);
}
