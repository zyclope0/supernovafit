'use client';

import { MessageCircle, ChefHat } from 'lucide-react';
import type { CoachComment } from '@/types';
import { useState, useEffect } from 'react';
import { updateCoachCommentRead } from '@/lib/coachComments';

interface ModuleCommentsProps {
  comments: CoachComment[];
  loading: boolean;
  compact?: boolean;
}

export default function ModuleComments({
  comments,
  loading,
  compact = false,
}: ModuleCommentsProps) {
  const [localComments, setLocalComments] = useState<CoachComment[]>(
    comments || [],
  );
  useEffect(() => {
    setLocalComments(comments || []);
  }, [comments]);

  const markAsRead = async (commentId: string) => {
    try {
      await updateCoachCommentRead(commentId, true);
      setLocalComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, read_by_athlete: true } : c,
        ),
      );
    } catch {}
  };
  if (loading) {
    // Skeleton compact
    return (
      <div className="mt-4 space-y-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white/5 rounded-lg p-2 border border-white/5 animate-pulse"
          >
            <div className="h-3 bg-white/10 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return null; // Ne pas afficher si pas de commentaires
  }

  const formatDate = (timestamp: unknown) => {
    try {
      const ts = timestamp as
        | { toDate?: () => Date }
        | string
        | number
        | Date
        | undefined;
      const date: Date =
        typeof ts === 'object' &&
        ts &&
        'toDate' in ts &&
        typeof (ts as { toDate?: () => Date }).toDate === 'function'
          ? (ts as { toDate: () => Date }).toDate()
          : new Date(ts as string | number | Date);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date inconnue';
    }
  };

  if (compact) {
    return (
      <div className="mt-4 space-y-3">
        {localComments.map((comment) => (
          <div
            key={comment.id}
            className={`bg-neon-purple/10 border rounded-lg p-3 ${comment.read_by_athlete ? 'border-white/10' : 'border-neon-purple/20'}`}
          >
            <div className="flex items-start space-x-2">
              <ChefHat className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-neon-purple font-medium text-xs">
                    Commentaire Coach
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {comment.comment}
                </p>
                {!comment.read_by_athlete && (
                  <div className="mt-2">
                    <button
                      aria-label="Marquer le commentaire du coach comme lu"
                      onClick={() => markAsRead(comment.id)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Version compacte/inline (limite en hauteur) pour ne pas surcharger la page
  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2 mb-2">
        <MessageCircle className="w-4 h-4 text-neon-cyan" />
        <h3 className="text-sm font-semibold text-white">Messages du Coach</h3>
        <span className="bg-neon-cyan/20 text-neon-cyan text-xs px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>
      <div className="space-y-2 max-h-40 overflow-auto pr-1">
        {localComments.map((comment) => (
          <div
            key={comment.id}
            className={`bg-white/5 rounded-lg p-2 border ${comment.read_by_athlete ? 'border-white/10' : 'border-neon-pink/30'}`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-neon-purple/20 rounded-full flex items-center justify-center">
                  <ChefHat className="w-3 h-3 text-neon-purple" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-neon-purple font-medium text-xs">
                    Coach
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mt-1 line-clamp-3">
                  {comment.comment}
                </p>
                {!comment.read_by_athlete && (
                  <div className="mt-2">
                    <button
                      aria-label="Marquer le commentaire du coach comme lu"
                      onClick={() => markAsRead(comment.id)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
