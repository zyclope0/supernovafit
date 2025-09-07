import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formater une date au format français
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

// Fonctions calculateMetabolicAge, formatDateShort, calculateBMI, getBMICategory supprimées - non utilisées

// Formater un nombre avec des espaces pour les milliers
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Obtenir le nom du repas
export function getMealName(mealType: string): string {
  const meals: Record<string, string> = {
    'petit_dej': 'Petit-déjeuner',
    'collation_matin': 'Collation matin',
    'dejeuner': 'Déjeuner',
    'collation_apres_midi': 'Collation après-midi',
    'diner': 'Dîner',
    'collation_soir': 'Collation soir'
  };
  return meals[mealType] || mealType;
}

// Générer un ID unique
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Fonction isValidEmail supprimée - non utilisée

// Fonction getColorByValue supprimée - non utilisée 