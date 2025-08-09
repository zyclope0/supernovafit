// Types pour l'authentification et les utilisateurs
export type UserRole = 'sportif' | 'coach';

export interface User {
  id: string;
  role: UserRole;
  nom: string;
  email: string;
  date_invitation: Date;
  dernier_acces: Date;
  
  // Profil personnel étendu
  age?: number;
  sexe?: 'M' | 'F';
  taille?: number; // cm
  poids_initial?: number; // kg
  objectif?: 'maintien' | 'prise_masse' | 'seche' | 'performance';
  niveau_activite?: 'sedentaire' | 'leger' | 'modere' | 'intense' | 'tres_intense';
  
  // Préférences
  unite_poids?: 'kg' | 'lbs';
  unite_taille?: 'cm' | 'ft';
  langue?: 'fr' | 'en';
  
  // Métadonnées
  profil_complete?: boolean;
  created_at?: any;
  updated_at?: any;
}

// Types pour les repas
export type MealType = 'petit_dej' | 'collation_matin' | 'dejeuner' | 'collation_apres_midi' | 'diner' | 'collation_soir';

export interface Aliment {
  id: string;
  nom: string;
  quantite: number;
  unite: string; // g, ml, unité
  openfoodfacts_id?: string;
  macros?: Macros;
  macros_base?: Macros; // Valeurs pour 100g/100ml (référence)
}

export interface Macros {
  kcal: number;
  prot: number;
  glucides: number;
  lipides: number;
}

export interface Repas {
  id: string;
  user_id: string;
  date: string; // Format YYYY-MM-DD
  repas: MealType;
  aliments: Aliment[];
  macros: Macros;
}

// Types pour les entraînements
export type TrainingSource = 'manuel' | 'garmin' | 'import';

export interface Entrainement {
  id: string;
  user_id: string;
  date: string;
  type: string;
  duree: number; // en minutes
  commentaire?: string;
  source: TrainingSource;
  
  // Données basiques
  calories?: number;
  
  // Données cardio style Garmin
  fc_moyenne?: number; // Fréquence cardiaque moyenne
  fc_max?: number; // Fréquence cardiaque max
  fc_min?: number; // Fréquence cardiaque min
  
  // Distance et vitesse
  distance?: number; // en km
  vitesse_moy?: number; // en km/h
  vitesse_max?: number; // en km/h
  
  // Données avancées
  elevation_gain?: number; // dénivelé positif en mètres
  cadence_moy?: number; // cadence moyenne (course/vélo)
  puissance_moy?: number; // puissance moyenne en watts (vélo)
  
  // Zones d'entraînement
  zone1_time?: number; // temps en zone 1 (minutes)
  zone2_time?: number; // temps en zone 2 (minutes)
  zone3_time?: number; // temps en zone 3 (minutes)
  zone4_time?: number; // temps en zone 4 (minutes)
  zone5_time?: number; // temps en zone 5 (minutes)
  
  // Ressenti subjectif
  effort_percu?: number; // RPE 1-10
  fatigue_avant?: number; // 1-10
  fatigue_apres?: number; // 1-10
  
  // Métadonnées import
  fichier_original?: string; // nom fichier .fit/.gpx
  device?: string; // appareil utilisé
  garmin_id?: string; // Identifiant unique Garmin pour éviter doublons
}

// Types pour les mesures
export interface Mesure {
  id: string;
  user_id: string;
  date: string;
  poids?: number; // kg
  masse_grasse?: number; // %
  masse_musculaire?: number; // %
  tour_taille?: number; // cm
  tour_hanches?: number; // cm
  tour_bras?: number; // cm
  tour_cuisses?: number; // cm
  tour_cou?: number; // cm
  tour_poitrine?: number; // cm
  taille?: number; // cm (pour IMC)
  imc?: number; // calculé automatiquement
  commentaire?: string;
  photos?: string[]; // URLs multiples
  created_at?: any; // Timestamp Firebase
}

// Type pour les statistiques calculées
export interface MesureStats {
  imc: number;
  evolution_poids: number; // % depuis dernière mesure
  evolution_masse_grasse: number;
  poids_ideal_min: number; // selon IMC
  poids_ideal_max: number;
  tendance_7j: 'hausse' | 'baisse' | 'stable';
  tendance_30j: 'hausse' | 'baisse' | 'stable';
}

// Type pour les photos de progression
export interface PhotoProgression {
  id: string;
  user_id: string;
  date: string;
  type: 'face' | 'profil' | 'dos' | 'libre';
  url: string;
  mesure_id?: string; // lié à une mesure spécifique
  commentaire?: string;
  created_at?: any;
}

// Types pour le journal - Badge défini plus bas

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  note?: string;
  humeur?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  fatigue?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  motivation?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  energie?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  sommeil_duree?: number; // heures
  sommeil_qualite?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  stress?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  photos_libres?: string[]; // URLs des photos libres
  objectifs_accomplis?: string[]; // IDs des objectifs accomplis ce jour
  badges_obtenus?: string[]; // IDs des badges obtenus
  meteo?: 'soleil' | 'nuage' | 'pluie' | 'orage' | 'neige';
  activites_annexes?: string[]; // Activités hors sport (marche, jardinage, etc.)
  created_at?: any; // Timestamp Firebase
  updated_at?: any; // Timestamp Firebase
}

export interface Badge {
  id: string;
  user_id: string;
  type: 'streak' | 'objectif' | 'performance' | 'special';
  nom: string;
  description: string;
  icone: string;
  condition: string; // Description de la condition
  date_obtenu: string;
  created_at?: any;
}

export interface Objectif {
  id: string;
  user_id: string;
  type: 'nutrition' | 'entrainement' | 'mesures' | 'journal' | 'custom';
  titre: string;
  description?: string;
  cible_valeur: number;
  cible_unite: string;
  valeur_actuelle: number;
  date_creation: string;
  date_limite?: string;
  statut: 'actif' | 'accompli' | 'abandonne' | 'pause';
  progression: number; // 0-100
  created_at?: any;
  completed_at?: any;
}

export interface PhotoLibre {
  id: string;
  user_id: string;
  url: string;
  fileName: string;
  date: string;
  titre?: string;
  description?: string;
  tags?: string[]; // Tags libres pour catégoriser
  favoris: boolean;
  created_at?: any;
}

// Types pour les menus-type (coach)
export interface MenuType {
  id: string;
  coach_id: string;
  nom: string;
  description?: string;
  structure: {
    [key in MealType]?: Aliment[];
  };
  macros_cibles?: Macros;
}

// Types pour les plans diète coach (indications nutritionnelles)
export interface CoachDietPlan {
  id: string;
  coach_id: string;
  athlete_id: string;
  date_creation: string; // YYYY-MM-DD
  petit_dej: string;
  collation_matin: string;
  dejeuner: string;
  collation_apres_midi: string;
  diner: string;
  collation_soir: string;
  notes_generales?: string;
  created_at?: any;
  updated_at?: any;
}

// Types pour l'API Open Food Facts
export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriments: {
    energy_100g: number;
    proteins_100g: number;
    carbohydrates_100g: number;
    fat_100g: number;
  };
}

// Types pour les statistiques et graphiques
export interface StatsPeriode {
  debut: Date;
  fin: Date;
  moyennes: {
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
    poids?: number;
  };
  evolution_poids?: number;
  nb_entrainements: number;
  minutes_entrainement: number;
} 

// Types pour les commentaires coach
export type CoachCommentModule = 'diete' | 'entrainements' | 'journal' | 'mesures'

export interface CoachComment {
  id: string
  coach_id: string
  athlete_id: string
  module: CoachCommentModule
  // Contexte facultatif selon module
  date?: string // pour diete
  training_id?: string // pour entrainements
  entry_id?: string // pour journal
  mesure_id?: string // réservé pour évolutions futures
  comment: string
  created_at?: any
  read_by_athlete?: boolean
}