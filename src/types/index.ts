import { Timestamp } from 'firebase/firestore';

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
  niveau_activite?:
    | 'sedentaire'
    | 'leger'
    | 'modere'
    | 'intense'
    | 'tres_intense';

  // Préférences
  unite_poids?: 'kg' | 'lbs';
  unite_taille?: 'cm' | 'ft';
  langue?: 'fr' | 'en';

  // Métadonnées
  profil_complete?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;

  // Relation coach-athlète (v1 mono-coach)
  ownerCoachId?: string; // ID du coach propriétaire
}

// Types pour les invitations coach-athlète
export type InviteStatus = 'active' | 'used' | 'revoked';

export interface Invite {
  code: string; // Code à 6 caractères A-Z/2-9
  coachId: string; // ID du coach qui génère l'invitation
  createdAt: Date;
  expiresAt: Date; // TTL 72h
  status: InviteStatus;
  usedByAthleteId?: string; // ID de l'athlète qui a utilisé le code
  usedAt?: Date; // Date d'utilisation
  revokedAt?: Date; // Date de révocation (si applicable)
}

// Types pour les repas
export type MealType =
  | 'petit_dej'
  | 'collation_matin'
  | 'dejeuner'
  | 'collation_apres_midi'
  | 'diner'
  | 'collation_soir';

export interface Aliment {
  id: string;
  nom: string;
  nom_lower: string; // ⚠️ OBLIGATOIRE (search)
  quantite: number;
  unite: string; // g, ml, unité
  user_id: string; // ⚠️ OBLIGATOIRE
  created_at: Timestamp; // ⚠️ OBLIGATOIRE
  openfoodfacts_id?: string;
  macros: Macros; // ⚠️ OBLIGATOIRE
  macros_base: Macros; // ⚠️ OBLIGATOIRE (pour 100g/ml)
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
  date: Timestamp; // ⚠️ CRITIQUE: Timestamp Firestore!
  repas: MealType;
  aliments: Aliment[];
  macros: Macros;
  created_at: Timestamp;
}

// Types pour les entraînements
export type TrainingSource = 'manuel' | 'garmin' | 'import';

export interface Entrainement {
  id: string;
  user_id: string;
  date: Timestamp; // ⚠️ CRITIQUE: Timestamp Firestore!
  type: 'cardio' | 'musculation'; // ⚠️ CRITIQUE: lowercase!
  duree: number; // en minutes
  calories: number;
  source: TrainingSource;
  commentaire?: string;

  // Champs universels (TOUS les types)
  effort_percu?: number; // 1-10
  fatigue_avant?: number; // 1-10
  fatigue_apres?: number; // 1-10
  fc_min?: number; // BPM
  fc_max?: number; // BPM
  fc_moyenne?: number; // BPM

  // ⚠️ Champs CONDITIONNELS (type === 'cardio')
  distance?: number; // km
  vitesse_moy?: number; // km/h
  vitesse_max?: number; // km/h
  cadence_moy?: number; // rpm
  elevation_gain?: number; // m

  // ⚠️ Champs CONDITIONNELS (type === 'musculation')
  puissance_moy?: number; // W
  exercices?: Array<{
    nom: string;
    series: number;
    repetitions: number;
    poids?: number;
  }>;

  // Propriétés étendues pour compatibilité
  garmin_id?: string; // ID Garmin
  device?: string; // Appareil utilisé
  fichier_original?: string; // Nom du fichier original
  zone1_time?: number; // Temps en zone 1
  zone2_time?: number; // Temps en zone 2
  zone3_time?: number; // Temps en zone 3
  zone4_time?: number; // Temps en zone 4
  zone5_time?: number; // Temps en zone 5
  updated_at?: Timestamp;

  created_at: Timestamp;
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
  created_at?: Date | string; // Timestamp Firebase
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
  created_at?: Date | string;
}

// Types pour le journal - Badge défini plus bas

export interface JournalEntry {
  id: string;
  user_id: string;
  date: Timestamp; // ⚠️ CRITIQUE: Timestamp Firestore!
  humeur: number; // 1-10
  energie: number; // 1-10
  sommeil?: number; // heures
  stress?: number; // 1-10
  note?: string;
  created_at: Timestamp;

  // Propriétés étendues pour compatibilité
  motivation?: number; // 1-10
  sommeil_duree?: number; // heures
  sommeil_qualite?: number; // 1-10
  meteo?: string; // 'soleil', 'nuage', 'pluie', 'orage', 'neige'
  activites_annexes?: string[]; // Activités annexes
  photos_libres?: string[]; // URLs photos
  fatigue?: number; // 1-10
  device?: string; // Appareil utilisé
  updated_at?: Timestamp;
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
  created_at?: Date | string;
}

// Types pour le système de Challenges & Gamification
export interface Challenge {
  id: string;
  user_id: string;
  type: 'nutrition' | 'training' | 'streak' | 'social' | 'special';
  title: string;
  description: string;
  icon: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  target: number;
  current: number;
  unit: string; // 'jours', 'repas', 'calories', 'km', etc.
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired' | 'paused';
  xpReward: number;
  badgeReward?: string; // ID du badge à débloquer
  isRepeatable: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  created_at?: Date | string;
  completed_at?: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: 'milestone' | 'streak' | 'performance' | 'social' | 'special';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  condition: string;
  unlockedAt?: string;
  created_at?: Date | string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  badgesCount: number;
  challengesCompleted: number;
  achievementsUnlocked: number;
  streakDays: number;
  lastActivity: string;
  created_at?: Date | string;
  updated_at?: Date | string;
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
  created_at?: Date | string;
  completed_at?: Date | string;
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
  created_at?: Date | string;
}

// Interface MenuType supprimée - non utilisée

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
  created_at?: Date | string;
  updated_at?: Date | string;
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

// Interface StatsPeriode supprimée - non utilisée

// Types pour les commentaires coach
export type CoachCommentModule =
  | 'diete'
  | 'entrainements'
  | 'journal'
  | 'mesures';

export interface CoachComment {
  id: string;
  coach_id: string;
  athlete_id: string;
  module: CoachCommentModule;
  // Contexte facultatif selon module
  date?: string; // pour diete
  training_id?: string; // pour entrainements
  entry_id?: string; // pour journal
  mesure_id?: string; // réservé pour évolutions futures
  comment: string;
  created_at?: Date | string;
  read_by_athlete?: boolean;
}
