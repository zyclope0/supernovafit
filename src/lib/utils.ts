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

// Formater une date pour l'affichage court
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).format(d);
}

// Calculer l'âge métabolique (exemple simplifié)
export function calculateMetabolicAge(weight: number, height: number, age: number, gender: 'M' | 'F'): number {
  // Formule simplifiée - à améliorer avec de vraies données
  const bmr = gender === 'M' 
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  
  // Convertir en âge métabolique (approximation)
  const metabolicAge = age * (2000 / bmr);
  return Math.round(metabolicAge);
}

// Calculer l'IMC
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// Obtenir la catégorie IMC
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Insuffisance pondérale';
  if (bmi < 25) return 'Corpulence normale';
  if (bmi < 30) return 'Surpoids';
  if (bmi < 35) return 'Obésité modérée';
  if (bmi < 40) return 'Obésité sévère';
  return 'Obésité morbide';
}

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

// Valider un email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Obtenir la couleur selon la valeur (pour les graphiques)
export function getColorByValue(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min);
  if (ratio < 0.33) return 'text-neon-green';
  if (ratio < 0.66) return 'text-neon-cyan';
  return 'text-neon-purple';
} 