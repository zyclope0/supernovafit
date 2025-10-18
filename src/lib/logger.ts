/**
 * Logger Custom pour SuperNovaFit
 * Remplace les 158 console.log par un système structuré
 * Intégration Sentry pour production
 */

import {
  captureException,
  captureMessage,
  addBreadcrumb,
} from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance';

export interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
  duration?: number;
  error?: Error;
  [key: string]: unknown; // Permettre des propriétés supplémentaires
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug - Development only
   */
  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      const timestamp = new Date().toISOString();
      if (context && Object.keys(context).length > 0) {
        console.log(
          `[DEBUG ${timestamp}] ${message}`,
          JSON.stringify(context, null, 2),
        );
      } else {
        console.log(`[DEBUG ${timestamp}] ${message}`);
      }
    }
  }

  /**
   * Info - Development + Production (Sentry breadcrumb)
   */
  info(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();

    if (this.isDev) {
      if (context && Object.keys(context).length > 0) {
        console.log(
          `[INFO ${timestamp}] ${message}`,
          JSON.stringify(context, null, 2),
        );
      } else {
        console.log(`[INFO ${timestamp}] ${message}`);
      }
    }

    if (this.isProduction && context) {
      addBreadcrumb({
        message,
        level: 'info',
        data: context,
        category: 'app',
      });
    }
  }

  /**
   * Warning - Development + Production (Sentry breadcrumb)
   */
  warn(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();

    if (this.isDev) {
      if (context && Object.keys(context).length > 0) {
        console.warn(
          `[WARN ${timestamp}] ${message}`,
          JSON.stringify(context, null, 2),
        );
      } else {
        console.warn(`[WARN ${timestamp}] ${message}`);
      }
    }

    if (this.isProduction) {
      addBreadcrumb({
        message,
        level: 'warning',
        data: context,
        category: 'app',
      });

      // Envoyer à Sentry si contexte important
      if (context?.action || context?.component) {
        captureMessage(message, {
          level: 'warning',
          extra: context,
        });
      }
    }
  }

  /**
   * Error - Development + Production (Sentry error)
   */
  error(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();

    if (this.isDev) {
      if (context && Object.keys(context).length > 0) {
        console.error(
          `[ERROR ${timestamp}] ${message}`,
          JSON.stringify(context, null, 2),
        );
      } else {
        console.error(`[ERROR ${timestamp}] ${message}`);
      }
    }

    if (this.isProduction) {
      // Envoyer l'erreur à Sentry
      if (context?.error) {
        captureException(context.error, {
          extra: {
            message,
            ...context,
          },
          tags: {
            component: context.component,
            action: context.action,
          },
        });
      } else {
        captureMessage(message, {
          level: 'error',
          extra: context,
          tags: {
            component: context?.component,
            action: context?.action,
          },
        });
      }
    }
  }

  /**
   * Performance - Métriques de performance
   */
  performance(operation: string, duration: number, context?: LogContext) {
    const timestamp = new Date().toISOString();

    if (this.isDev) {
      console.log(
        `[PERF ${timestamp}] ${operation}: ${duration}ms`,
        context || '',
      );
    }

    if (this.isProduction) {
      addBreadcrumb({
        message: `Performance: ${operation}`,
        level: 'info',
        data: {
          operation,
          duration,
          ...context,
        },
        category: 'performance',
      });

      // Alertes Sentry pour performances dégradées
      if (duration > 1000) {
        // Plus de 1 seconde
        captureMessage(`Slow operation: ${operation}`, {
          level: 'warning',
          extra: {
            operation,
            duration,
            ...context,
          },
          tags: {
            performance: 'slow',
            component: context?.component,
          },
        });
      }
    }
  }

  /**
   * Log spécifique pour les notifications
   */
  notifications(message: string, context?: LogContext) {
    this.info(`📱 NOTIFICATIONS - ${message}`, {
      component: 'notifications',
      ...context,
    });
  }

  /**
   * Log spécifique pour les erreurs de notifications
   */
  notificationsError(message: string, error: Error, context?: LogContext) {
    // S'assurer que l'erreur a du contenu
    const errorInfo = {
      name: error.name || 'UnknownError',
      message: error.message || 'No error message',
      stack: error.stack || 'No stack trace',
    };

    this.error(`❌ NOTIFICATIONS - ${message}`, {
      component: 'notifications',
      error: errorInfo,
      ...context,
    });
  }

  /**
   * Log spécifique pour Firebase
   */
  firebase(message: string, context?: LogContext) {
    this.info(`🔥 FIREBASE - ${message}`, {
      component: 'firebase',
      ...context,
    });
  }

  /**
   * Log spécifique pour les erreurs Firebase
   */
  firebaseError(message: string, error: Error, context?: LogContext) {
    const errorInfo = {
      name: error.name || 'UnknownError',
      message: error.message || 'No error message',
      stack: error.stack || 'No stack trace',
    };

    this.error(`❌ FIREBASE - ${message}`, {
      component: 'firebase',
      error: errorInfo,
      ...context,
    });
  }

  /**
   * Log spécifique pour les imports
   */
  import(message: string, context?: LogContext) {
    this.info(`📥 IMPORT - ${message}`, {
      component: 'import',
      ...context,
    });
  }

  /**
   * Log spécifique pour les erreurs d'import
   */
  importError(message: string, error: Error, context?: LogContext) {
    const errorInfo = {
      name: error.name || 'UnknownError',
      message: error.message || 'No error message',
      stack: error.stack || 'No stack trace',
    };

    this.error(`❌ IMPORT - ${message}`, {
      component: 'import',
      error: errorInfo,
      ...context,
    });
  }

  /**
   * Log spécifique pour l'authentification
   */
  auth(message: string, context?: LogContext) {
    this.info(`🔐 AUTH - ${message}`, {
      component: 'auth',
      ...context,
    });
  }

  /**
   * Log spécifique pour les erreurs d'authentification
   */
  authError(message: string, error: Error, context?: LogContext) {
    const errorInfo = {
      name: error.name || 'UnknownError',
      message: error.message || 'No error message',
      stack: error.stack || 'No stack trace',
    };

    this.error(`❌ AUTH - ${message}`, {
      component: 'auth',
      error: errorInfo,
      ...context,
    });
  }
}

// Instance singleton
export const logger = new Logger();

// Export des méthodes principales pour faciliter l'usage
export const {
  debug,
  info,
  warn,
  error,
  performance,
  notifications,
  notificationsError,
  firebase,
  firebaseError,
  import: logImport,
  importError,
  auth,
  authError,
} = logger;

// Hook React pour utiliser le logger dans les composants
export function useLogger() {
  return logger;
}

export default logger;
