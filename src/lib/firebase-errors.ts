// Gestion centralisée des erreurs Firebase
// Mappe les codes d'erreur techniques vers des messages utilisateur compréhensibles

export interface FirebaseErrorInfo {
  userMessage: string;
  technicalCode: string;
  category:
    | 'auth'
    | 'firestore'
    | 'storage'
    | 'network'
    | 'permission'
    | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
}

// Mapping des erreurs Firebase Auth
const AUTH_ERRORS: Record<string, FirebaseErrorInfo> = {
  'auth/user-not-found': {
    userMessage: 'Aucun compte trouvé avec cet email',
    technicalCode: 'auth/user-not-found',
    category: 'auth',
    severity: 'medium',
    retryable: false,
  },
  'auth/wrong-password': {
    userMessage: 'Mot de passe incorrect',
    technicalCode: 'auth/wrong-password',
    category: 'auth',
    severity: 'medium',
    retryable: true,
  },
  'auth/email-already-in-use': {
    userMessage: 'Cet email est déjà utilisé par un autre compte',
    technicalCode: 'auth/email-already-in-use',
    category: 'auth',
    severity: 'medium',
    retryable: false,
  },
  'auth/weak-password': {
    userMessage: 'Le mot de passe doit contenir au moins 6 caractères',
    technicalCode: 'auth/weak-password',
    category: 'auth',
    severity: 'low',
    retryable: true,
  },
  'auth/invalid-email': {
    userMessage: "Format d'email invalide",
    technicalCode: 'auth/invalid-email',
    category: 'auth',
    severity: 'low',
    retryable: true,
  },
  'auth/too-many-requests': {
    userMessage: 'Trop de tentatives. Veuillez réessayer dans quelques minutes',
    technicalCode: 'auth/too-many-requests',
    category: 'auth',
    severity: 'medium',
    retryable: true,
  },
  'auth/network-request-failed': {
    userMessage: 'Erreur de connexion. Vérifiez votre connexion internet',
    technicalCode: 'auth/network-request-failed',
    category: 'network',
    severity: 'medium',
    retryable: true,
  },
};

// Mapping des erreurs Firestore
const FIRESTORE_ERRORS: Record<string, FirebaseErrorInfo> = {
  'permission-denied': {
    userMessage: "Vous n'avez pas les permissions pour effectuer cette action",
    technicalCode: 'permission-denied',
    category: 'permission',
    severity: 'high',
    retryable: false,
  },
  unavailable: {
    userMessage: 'Service temporairement indisponible. Veuillez réessayer',
    technicalCode: 'unavailable',
    category: 'network',
    severity: 'medium',
    retryable: true,
  },
  'deadline-exceeded': {
    userMessage: 'La requête a pris trop de temps. Veuillez réessayer',
    technicalCode: 'deadline-exceeded',
    category: 'network',
    severity: 'medium',
    retryable: true,
  },
  'resource-exhausted': {
    userMessage: 'Limite de requêtes atteinte. Veuillez réessayer plus tard',
    technicalCode: 'resource-exhausted',
    category: 'firestore',
    severity: 'medium',
    retryable: true,
  },
  'failed-precondition': {
    userMessage: "Opération impossible dans l'état actuel",
    technicalCode: 'failed-precondition',
    category: 'firestore',
    severity: 'medium',
    retryable: false,
  },
  aborted: {
    userMessage: 'Opération annulée. Veuillez réessayer',
    technicalCode: 'aborted',
    category: 'firestore',
    severity: 'low',
    retryable: true,
  },
  'out-of-range': {
    userMessage: 'Données hors limites',
    technicalCode: 'out-of-range',
    category: 'firestore',
    severity: 'medium',
    retryable: false,
  },
  unimplemented: {
    userMessage: 'Fonctionnalité non implémentée',
    technicalCode: 'unimplemented',
    category: 'firestore',
    severity: 'high',
    retryable: false,
  },
  internal: {
    userMessage: 'Erreur interne. Veuillez réessayer',
    technicalCode: 'internal',
    category: 'firestore',
    severity: 'medium',
    retryable: true,
  },
  'data-loss': {
    userMessage: 'Perte de données détectée',
    technicalCode: 'data-loss',
    category: 'firestore',
    severity: 'critical',
    retryable: false,
  },
};

// Mapping des erreurs Storage
const STORAGE_ERRORS: Record<string, FirebaseErrorInfo> = {
  'storage/object-not-found': {
    userMessage: 'Fichier introuvable',
    technicalCode: 'storage/object-not-found',
    category: 'storage',
    severity: 'medium',
    retryable: false,
  },
  'storage/bucket-not-found': {
    userMessage: 'Erreur de configuration du stockage',
    technicalCode: 'storage/bucket-not-found',
    category: 'storage',
    severity: 'high',
    retryable: false,
  },
  'storage/project-not-found': {
    userMessage: 'Erreur de configuration du projet',
    technicalCode: 'storage/project-not-found',
    category: 'storage',
    severity: 'high',
    retryable: false,
  },
  'storage/quota-exceeded': {
    userMessage: 'Espace de stockage insuffisant',
    technicalCode: 'storage/quota-exceeded',
    category: 'storage',
    severity: 'high',
    retryable: false,
  },
  'storage/unauthenticated': {
    userMessage: 'Vous devez être connecté pour uploader des fichiers',
    technicalCode: 'storage/unauthenticated',
    category: 'auth',
    severity: 'medium',
    retryable: true,
  },
  'storage/unauthorized': {
    userMessage: "Vous n'avez pas les permissions pour uploader des fichiers",
    technicalCode: 'storage/unauthorized',
    category: 'permission',
    severity: 'high',
    retryable: false,
  },
  'storage/retry-limit-exceeded': {
    userMessage: "Échec de l'upload après plusieurs tentatives",
    technicalCode: 'storage/retry-limit-exceeded',
    category: 'storage',
    severity: 'medium',
    retryable: true,
  },
  'storage/invalid-checksum': {
    userMessage: "Fichier corrompu lors de l'upload",
    technicalCode: 'storage/invalid-checksum',
    category: 'storage',
    severity: 'medium',
    retryable: true,
  },
  'storage/canceled': {
    userMessage: 'Upload annulé',
    technicalCode: 'storage/canceled',
    category: 'storage',
    severity: 'low',
    retryable: true,
  },
  'storage/invalid-event-name': {
    userMessage: "Erreur technique lors de l'upload",
    technicalCode: 'storage/invalid-event-name',
    category: 'storage',
    severity: 'medium',
    retryable: true,
  },
  'storage/invalid-url': {
    userMessage: 'URL de fichier invalide',
    technicalCode: 'storage/invalid-url',
    category: 'storage',
    severity: 'medium',
    retryable: false,
  },
  'storage/invalid-argument': {
    userMessage: "Paramètres d'upload invalides",
    technicalCode: 'storage/invalid-argument',
    category: 'storage',
    severity: 'medium',
    retryable: false,
  },
  'storage/no-default-bucket': {
    userMessage: 'Erreur de configuration du stockage',
    technicalCode: 'storage/no-default-bucket',
    category: 'storage',
    severity: 'high',
    retryable: false,
  },
  'storage/cannot-slice-blob': {
    userMessage: 'Type de fichier non supporté',
    technicalCode: 'storage/cannot-slice-blob',
    category: 'storage',
    severity: 'medium',
    retryable: false,
  },
  'storage/server-file-wrong-size': {
    userMessage: "Erreur lors de l'upload du fichier",
    technicalCode: 'storage/server-file-wrong-size',
    category: 'storage',
    severity: 'medium',
    retryable: true,
  },
};

// Erreur par défaut pour les erreurs non mappées
const DEFAULT_ERROR: FirebaseErrorInfo = {
  userMessage: "Une erreur inattendue s'est produite. Veuillez réessayer",
  technicalCode: 'unknown',
  category: 'unknown',
  severity: 'medium',
  retryable: true,
};

/**
 * Analyse une erreur Firebase et retourne des informations utilisateur appropriées
 */
export function analyzeFirebaseError(error: unknown): FirebaseErrorInfo {
  // Debug: Log l'erreur originale
  console.log('🔍 ANALYZE FIREBASE ERROR:', {
    error,
    type: typeof error,
    isObject: typeof error === 'object',
    hasCode: error && typeof error === 'object' && 'code' in error,
    hasMessage: error && typeof error === 'object' && 'message' in error,
  });

  if (!error || typeof error !== 'object') {
    console.log('❌ Error is not an object, returning DEFAULT_ERROR');
    return DEFAULT_ERROR;
  }

  const firebaseError = error as { code?: string; message?: string };
  const errorCode = firebaseError.code || 'unknown';

  console.log('🔍 Firebase error details:', {
    code: firebaseError.code,
    message: firebaseError.message,
    errorCode,
  });

  // Chercher dans les mappings d'erreurs
  const authError = AUTH_ERRORS[errorCode];
  if (authError) return authError;

  const firestoreError = FIRESTORE_ERRORS[errorCode];
  if (firestoreError) return firestoreError;

  const storageError = STORAGE_ERRORS[errorCode];
  if (storageError) return storageError;

  // Erreurs réseau communes
  if (errorCode.includes('network') || errorCode.includes('timeout')) {
    return {
      userMessage: 'Erreur de connexion. Vérifiez votre connexion internet',
      technicalCode: errorCode,
      category: 'network',
      severity: 'medium',
      retryable: true,
    };
  }

  // Erreurs de permission communes
  if (errorCode.includes('permission') || errorCode.includes('unauthorized')) {
    return {
      userMessage:
        "Vous n'avez pas les permissions pour effectuer cette action",
      technicalCode: errorCode,
      category: 'permission',
      severity: 'high',
      retryable: false,
    };
  }

  // Log de l'erreur technique pour le debugging
  console.error(
    '❌ FIREBASE ERROR - Code non mappé:',
    errorCode,
    firebaseError.message,
  );

  return {
    ...DEFAULT_ERROR,
    technicalCode: errorCode,
  };
}

/**
 * Génère un message d'erreur utilisateur avec des suggestions d'action
 */
export function getUserFriendlyMessage(error: unknown): string {
  const errorInfo = analyzeFirebaseError(error);

  let message = errorInfo.userMessage;

  // Ajouter des suggestions selon la catégorie
  switch (errorInfo.category) {
    case 'network':
      message += '\n\nVérifiez votre connexion internet et réessayez.';
      break;
    case 'auth':
      if (errorInfo.retryable) {
        message += '\n\nVérifiez vos informations et réessayez.';
      }
      break;
    case 'permission':
      message += '\n\nContactez votre administrateur si le problème persiste.';
      break;
    case 'storage':
      if (errorInfo.retryable) {
        message += '\n\nEssayez avec un fichier plus petit ou réessayez.';
      }
      break;
  }

  return message;
}

/**
 * Détermine si une erreur peut être retentée
 */
export function isRetryableError(error: unknown): boolean {
  return analyzeFirebaseError(error).retryable;
}

/**
 * Obtient la sévérité d'une erreur
 */
export function getErrorSeverity(
  error: unknown,
): FirebaseErrorInfo['severity'] {
  return analyzeFirebaseError(error).severity;
}

/**
 * Log une erreur avec contexte pour le debugging
 */
export function logFirebaseError(error: unknown, context?: string): void {
  const errorInfo = analyzeFirebaseError(error);

  console.error('❌ FIREBASE ERROR:', {
    context: context || 'Unknown',
    userMessage: errorInfo.userMessage,
    technicalCode: errorInfo.technicalCode,
    category: errorInfo.category,
    severity: errorInfo.severity,
    retryable: errorInfo.retryable,
    originalError: error,
  });
}

// Types pour les tests
export type FirebaseErrorCode = string;

/**
 * Fonction simple pour obtenir le message d'erreur (pour compatibilité tests)
 */
export function getFirebaseErrorMessage(code: string): string {
  if (!code) return 'Une erreur est survenue. Veuillez réessayer.';

  const authError = AUTH_ERRORS[code];
  if (authError) return authError.userMessage;

  const firestoreError = FIRESTORE_ERRORS[code];
  if (firestoreError) return firestoreError.userMessage;

  const storageError = STORAGE_ERRORS[code];
  if (storageError) return storageError.userMessage;

  return 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Vérifie si un objet est une erreur Firebase (pour compatibilité tests)
 */
export function isFirebaseError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const firebaseError = error as { code?: string };
  return (
    typeof firebaseError.code === 'string' && firebaseError.code.length > 0
  );
}
