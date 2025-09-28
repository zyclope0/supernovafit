'use client';

import React from 'react';
import { ChefHat, MessageSquare } from 'lucide-react';
import { CoachDietPlan, CoachComment } from '@/types';

interface CoachDietSectionProps {
  plan: CoachDietPlan | null;
  planLoading: boolean;
  comments: CoachComment[];
  commentsLoading: boolean;
}

export default function CoachDietSection({
  plan,
  planLoading,
  comments,
  commentsLoading,
}: CoachDietSectionProps) {
  if (planLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan diététique personnalisé */}
      {plan ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-neon-purple" />
            <h3 className="text-lg font-semibold text-white">
              Plan Diététique
            </h3>
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded">
              {new Date(plan.date_creation).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Grille des repas recommandés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'petit_dej',
                label: 'Petit Déjeuner',
                icon: '🌅',
                content: plan.petit_dej,
              },
              {
                key: 'collation_matin',
                label: 'Collation Matin',
                icon: '☕',
                content: plan.collation_matin,
              },
              {
                key: 'dejeuner',
                label: 'Déjeuner',
                icon: '🍽️',
                content: plan.dejeuner,
              },
              {
                key: 'collation_apres_midi',
                label: 'Collation Après-midi',
                icon: '🍎',
                content: plan.collation_apres_midi,
              },
              { key: 'diner', label: 'Dîner', icon: '🌙', content: plan.diner },
              {
                key: 'collation_soir',
                label: 'Collation Soir',
                icon: '🌃',
                content: plan.collation_soir,
              },
            ].map(
              (meal) =>
                meal.content && (
                  <div
                    key={meal.key}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{meal.icon}</span>
                      <h4 className="text-sm font-medium text-neon-cyan">
                        {meal.label}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {meal.content}
                    </p>
                  </div>
                ),
            )}
          </div>

          {/* Notes générales du coach */}
          {plan.notes_generales && (
            <div className="p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-neon-purple" />
                <h4 className="text-sm font-medium text-neon-purple">
                  Notes du Coach
                </h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {plan.notes_generales}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <ChefHat className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Aucun plan diététique personnalisé disponible
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Votre coach peut créer un plan adapté à vos objectifs
          </p>
        </div>
      )}

      {/* Commentaires coach */}
      {comments && comments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-neon-cyan" />
            <h3 className="text-sm font-medium text-white">
              Commentaires Récents
            </h3>
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-800 rounded">
              {comments.length}
            </span>
          </div>

          <div className="space-y-3">
            {comments.slice(0, 3).map((comment) => (
              <div
                key={comment.id}
                className="p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neon-cyan font-medium">
                    Coach •{' '}
                    {new Date(comment.date || '').toLocaleDateString('fr-FR')}
                  </span>
                  {!comment.read_by_athlete && (
                    <span className="w-2 h-2 bg-neon-cyan rounded-full"></span>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {comment.comment}
                </p>
              </div>
            ))}

            {comments.length > 3 && (
              <p className="text-xs text-gray-400 text-center">
                +{comments.length - 3} autres commentaires
              </p>
            )}
          </div>
        </div>
      )}

      {/* État vide pour commentaires */}
      {commentsLoading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      )}
    </div>
  );
}
