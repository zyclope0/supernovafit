// Classification des challenges selon leur implémentation
import { CHALLENGE_DEFINITIONS } from './challenges';

// Challenges déjà implémentés avec tracking automatique
export const IMPLEMENTED_CHALLENGES = [
  // Nutrition
  'Repas Complet',
  'Marathon des Protéines',
  'Défi Calories',
  '7 Jours de Nutrition Parfaite',
  'Défi Variété',
  // Training
  'Streak Entraînement',
  'Force Pure',
  'Marathon du Temps',
  'Explosif',
  'Cardio Intense',
  'Endurance Extrême',
  'Séance Express',
  'Marathon Mensuel',
  'Consistance',
  'Matin Productif',
  'Warrior Streak', // ✨ Phase 2.1
  'Volume Monstre', // ✨ Phase 2.1
  // Tracking
  'Journalier Assidu',
  'Suivi Parfait',
  'Humeur Positive',
  'Énergie Maximale',
  'Sommeil de Qualité',
  'Pesée Quotidienne', // ✨ Phase 2.1
  'Journal Quotidien', // ✨ Phase 2.1
  'Transformation du Mois', // ✨ Phase 2.1
];

// Challenges nécessitant des fonctionnalités manquantes
export const UNIMPLEMENTABLE_CHALLENGES = {
  // Nécessitent tracking de l'hydratation (eau)
  'Hydratation Parfaite':
    "Nécessite tracking de l'eau bue (fonctionnalité à développer)",
  'Hydratation Express':
    "Nécessite tracking de l'eau bue (fonctionnalité à développer)",

  // Nécessitent analyse nutritionnelle avancée
  'Défi Fibres': 'Nécessite tracking des fibres dans Open Food Facts',
  'Zéro Sucres Ajoutés': 'Nécessite détection des sucres ajoutés',
  'Défi Légumes': 'Nécessite comptage des portions de légumes',
  'Petit-Déjeuner Royal': "Nécessite analyse de l'équilibre nutritionnel",
  'Défi Équilibre': 'Nécessite calcul des ratios macros optimaux',

  // Nécessitent détection automatique des types d'entraînement
  'Défi HIIT': 'Nécessite détection automatique des séances HIIT',
  'Variété Sportive': 'Nécessite catégorisation automatique des sports',
  'Matin Productif': "Nécessite tracking de l'heure d'entraînement",

  // Nécessitent compteur de pas
  'Marche Active': 'Nécessite intégration compteur de pas/podomètre',

  // Nécessitent fonctionnalités sociales
  'Mentor du Mois': 'Nécessite système de conseils entre utilisateurs',
  'Partage de Progrès': 'Nécessite fonctionnalité de partage social',
  Ambassadeur: "Nécessite système d'invitations d'amis",

  // Nécessitent système de badges/achievements
  'Premier Pas': 'Nécessite système de completion de challenges',
  Collectionneur: 'Nécessite système de badges',
  Perfectionniste: 'Nécessite historique des échecs/succès',
  Explorateur: "Nécessite tracking d'utilisation des fonctionnalités",
  'Maître du Temps': 'Nécessite tracking de durée de completion',
  'Légende Vivante': 'Nécessite système de niveaux XP',
  'Maître Absolu': 'Nécessite compteur de challenges complétés',
  'Défenseur de la Santé': 'Nécessite système de streak global',

  // Nécessitent tracking de récupération avancée
  Récupération:
    'Nécessite analyse des jours de repos entre entraînements intenses',
  'Récupération Active':
    'Nécessite détection automatique des séances yoga/stretching',

  // Nécessitent système de streak global
  'Streak de 30 Jours': 'Nécessite tracking de connexion quotidienne',
  'Consistance Parfaite': "Nécessite tracking d'activité quotidienne",

  // Nécessitent analyse de contenu textuel
  Gratitude: 'Nécessite analyse du contenu du journal',
  Méditation: 'Nécessite tracking du temps de méditation',
};

// Fonction pour vérifier si un challenge est implémenté
export function isChallengeImplemented(challengeTitle: string): boolean {
  return IMPLEMENTED_CHALLENGES.includes(challengeTitle);
}

// Fonction pour vérifier si un challenge est implémentable
export function isChallengeImplementable(challengeTitle: string): boolean {
  return !Object.keys(UNIMPLEMENTABLE_CHALLENGES).includes(challengeTitle);
}

// Fonction pour obtenir la raison de non-implémentation
export function getUnimplementationReason(
  challengeTitle: string,
): string | null {
  return (
    UNIMPLEMENTABLE_CHALLENGES[
      challengeTitle as keyof typeof UNIMPLEMENTABLE_CHALLENGES
    ] || null
  );
}

// Statistiques des challenges
export function getChallengeStats() {
  const total = CHALLENGE_DEFINITIONS.length;
  const implemented = IMPLEMENTED_CHALLENGES.length;
  const unimplementable = Object.keys(UNIMPLEMENTABLE_CHALLENGES).length;
  const implementable = total - unimplementable;

  return {
    total,
    implemented,
    implementable,
    unimplementable,
    implementedPercentage: Math.round((implemented / implementable) * 100),
    totalPercentage: Math.round((implemented / total) * 100),
  };
}

// Challenges implémentables mais pas encore fait (TODO)
export function getImplementableTodos(): string[] {
  return CHALLENGE_DEFINITIONS.map((def) => def.title).filter(
    (title) =>
      isChallengeImplementable(title) && !isChallengeImplemented(title),
  );
}

// Mise à jour de la liste des challenges trackables pour l'interface
export function getTrackableChallengeDefinitions() {
  return CHALLENGE_DEFINITIONS.filter((def) =>
    IMPLEMENTED_CHALLENGES.includes(def.title),
  );
}
