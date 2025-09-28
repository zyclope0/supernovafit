'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Calendar, Plus, FileText, Users, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProgrammesPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile && userProfile.role !== 'coach') {
      toast.error('Accès réservé aux coachs');
      router.push('/');
    }
    if (userProfile) {
      setLoading(false);
    }
  }, [userProfile, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Programmes</h1>
            <p className="text-muted-foreground">
              Créez et gérez les programmes d&apos;entraînement pour vos
              athlètes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-neon-purple" />
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="glass-effect p-8 rounded-xl border border-white/10 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Fonctionnalité en développement
          </h3>
          <p className="text-muted-foreground mb-6">
            La gestion des programmes d&apos;entraînement sera bientôt
            disponible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <Plus className="w-8 h-8 text-neon-purple mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">
                Créer des programmes
              </h4>
              <p className="text-sm text-muted-foreground">
                Concevez des programmes personnalisés
              </p>
            </div>

            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <Users className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">
                Assigner aux athlètes
              </h4>
              <p className="text-sm text-muted-foreground">
                Distribuez les programmes à votre équipe
              </p>
            </div>

            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <Target className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">
                Suivre les progrès
              </h4>
              <p className="text-sm text-muted-foreground">
                Surveillez l&apos;avancement des objectifs
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => toast('Fonctionnalité à venir', { icon: '🚧' })}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-purple/50 
                     transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <Plus className="w-12 h-12 text-neon-purple group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Nouveau Programme
                </h3>
                <p className="text-sm text-gray-400">
                  Créer un programme d&apos;entraînement
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => toast('Fonctionnalité à venir', { icon: '🚧' })}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-cyan/50 
                     transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12 text-neon-cyan group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">Templates</h3>
                <p className="text-sm text-gray-400">
                  Utiliser des modèles prédéfinis
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
