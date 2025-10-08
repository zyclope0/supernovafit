'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { timestampToDateString } from '@/lib/dateUtils';
import MainLayout from '@/components/layout/MainLayout';
const DietForm = dynamic(() => import('@/components/diete/DietForm'), {
  ssr: false,
});
import { useAuth } from '@/hooks/useAuth';
import { useEnergyBalance } from '@/hooks/useEnergyBalance';
import { calculateTDEE, calculateAdjustedTDEE } from '@/lib/userCalculations';
import {
  useRepas,
  useAthleteDietPlan,
  useCoachCommentsByModule,
  useEntrainements,
} from '@/hooks/useFirestore';
import { MealType, Aliment, Macros } from '@/types';
// formatNumber removed - not used
import { Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import dynamic from 'next/dynamic';
// MacrosChart supprimé - remplacé par NutritionAnalytics evidence-based
// import SwipeableMealCard from '@/components/mobile/SwipeableMealCard' // TODO: À intégrer
const MenuTypesModal = dynamic(
  () =>
    import('@/components/ui/modals-bundle').then((mod) => ({
      default: mod.MenuTypesModal,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  },
);
const HistoriqueModal = dynamic(
  () => import('@/components/ui/HistoriqueModal'),
  { ssr: false },
);
// CoachRecommendations et ModuleComments remplacés par CoachDietSection optimisé
const CollapsibleCard = dynamic(
  () => import('@/components/ui/CollapsibleCard'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white/10 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    ),
  },
);
// Skeletons supprimés - plus utilisés dans la nouvelle structure
import SmartSuggestions from '@/components/diete/SmartSuggestions';
import type { SmartSuggestion } from '@/lib/nutritional-database';
// PageHeader supprimé - remplacé par DietProgressHeader industrialisé
import DietProgressHeader from '@/components/ui/DietProgressHeader';
import NutritionAnalytics from '@/components/diete/NutritionAnalytics';
import CoachDietSection from '@/components/diete/CoachDietSection';
import DietCardClickable from '@/components/ui/DietCardClickable';
import DietDetailModal from '@/components/ui/DietDetailModal';

import React from 'react';

// MealCard supprimé - remplacé par DietCardClickable industrialisé

// MealCardMemo supprimé - plus utilisé

import type { Repas } from '@/types';

export default function DietePage() {
  const { user, userProfile } = useAuth();
  const { repas, addRepas, updateRepas, deleteRepas } = useRepas(); // Pour les opérations CRUD et données
  const { entrainements } = useEntrainements(); // Pour calculer l'ajustement TDEE
  const { currentPlan, loading: planLoading } = useAthleteDietPlan();
  const [selectedDate, setSelectedDate] = useState('');
  const [macrosPeriod, setMacrosPeriod] = useState<'today' | 'week' | 'month'>(
    'today',
  );
  const { comments: dieteComments, loading: commentsLoading } =
    useCoachCommentsByModule('diete', selectedDate);
  const [showMealForm, setShowMealForm] = useState<MealType | null>(null);
  const [editingMeal, setEditingMeal] = useState<string | null>(null); // ID du repas en édition
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenuTypes, setShowMenuTypes] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);

  // États pour les nouveaux composants industrialisés
  const [selectedMeal, setSelectedMeal] = useState<Repas | null>(null);
  const [showMealDetail, setShowMealDetail] = useState(false);

  // Initialiser selectedDate côté client pour éviter hydration mismatch
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedDate]);

  // const today = new Date().toLocaleDateString('fr-FR', {
  //   weekday: 'long',
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric'
  // }) // Supprimé car non utilisé après suppression du PageHeader

  const meals: { type: MealType; name: string; icon: string; time: string }[] =
    useMemo(
      () => [
        { type: 'petit_dej', name: 'Petit-déjeuner', icon: '🌅', time: '7h30' },
        {
          type: 'collation_matin',
          name: 'Collation matin',
          icon: '☕',
          time: '10h00',
        },
        { type: 'dejeuner', name: 'Déjeuner', icon: '🍽️', time: '12h30' },
        {
          type: 'collation_apres_midi',
          name: 'Collation après-midi',
          icon: '🍎',
          time: '16h00',
        },
        { type: 'diner', name: 'Dîner', icon: '🌙', time: '19h30' },
        {
          type: 'collation_soir',
          name: 'Collation soir',
          icon: '🌃',
          time: '21h30',
        },
      ],
      [],
    );

  // Fonction de migration pour adapter les anciens repas à la nouvelle structure
  const migrateLegacyMeal = (meal: unknown): Repas => {
    // Si c'est déjà un repas moderne, le retourner tel quel
    if (
      meal &&
      typeof meal === 'object' &&
      'aliments' in meal &&
      'macros' in meal
    ) {
      const mealObj = meal as Record<string, unknown>;
      if (Array.isArray(mealObj.aliments) && mealObj.macros) {
        return meal as Repas;
      }
    }

    // Migration des anciens repas
    const mealObj = meal as Record<string, unknown>;
    const migratedMeal: Repas = {
      id: (mealObj.id as string) || (mealObj._id as string) || '',
      user_id: (mealObj.user_id as string) || (mealObj.userId as string) || '',
      date:
        (mealObj.date as string) ||
        (mealObj.created_at as string)?.split('T')[0] ||
        '',
      repas:
        (mealObj.repas as MealType) ||
        (mealObj.mealType as MealType) ||
        (mealObj.type as MealType) ||
        'dejeuner',
      aliments:
        (mealObj.aliments as Aliment[]) ||
        (mealObj.foods as Aliment[]) ||
        (mealObj.items as Aliment[]) ||
        [],
      macros: (mealObj.macros as Macros) ||
        (mealObj.nutrition as Macros) || {
          kcal: (mealObj.calories as number) || (mealObj.kcal as number) || 0,
          prot:
            (mealObj.protein as number) || (mealObj.proteines as number) || 0,
          glucides:
            (mealObj.carbs as number) || (mealObj.glucides as number) || 0,
          lipides: (mealObj.fat as number) || (mealObj.lipides as number) || 0,
        },
    };

    // Migration des aliments si nécessaire
    if (migratedMeal.aliments && migratedMeal.aliments.length > 0) {
      migratedMeal.aliments = migratedMeal.aliments.map((aliment: unknown) => {
        const alimentObj = aliment as Record<string, unknown>;
        return {
          id: (alimentObj.id as string) || (alimentObj._id as string) || '',
          nom:
            (alimentObj.nom as string) ||
            (alimentObj.name as string) ||
            (alimentObj.food_name as string) ||
            'Aliment inconnu',
          quantite:
            (alimentObj.quantite as number) ||
            (alimentObj.quantity as number) ||
            (alimentObj.amount as number) ||
            100,
          unite:
            (alimentObj.unite as string) ||
            (alimentObj.unit as string) ||
            (alimentObj.unity as string) ||
            'g',
          openfoodfacts_id:
            (alimentObj.openfoodfacts_id as string) ||
            (alimentObj.product_id as string),
          macros: (alimentObj.macros as Macros) || {
            kcal:
              (alimentObj.calories as number) ||
              (alimentObj.kcal as number) ||
              0,
            prot:
              (alimentObj.protein as number) ||
              (alimentObj.proteines as number) ||
              0,
            glucides:
              (alimentObj.carbs as number) ||
              (alimentObj.glucides as number) ||
              0,
            lipides:
              (alimentObj.fat as number) || (alimentObj.lipides as number) || 0,
          },
          macros_base:
            (alimentObj.macros_base as Macros) ||
            (alimentObj.base_macros as Macros) ||
            (alimentObj.macros as Macros),
        };
      });
    }

    return migratedMeal;
  };

  // Filtrer les repas du jour sélectionné avec migration
  const todayMeals = useMemo(() => {
    const migratedRepas = repas.map(migrateLegacyMeal);
    const filtered = migratedRepas.filter(
      (r: Repas) => timestampToDateString(r.date) === selectedDate,
    );

    return filtered;
  }, [repas, selectedDate]);

  // Calcul des repas de la semaine pour le mode semaine
  const weekMeals = useMemo(() => {
    if (macrosPeriod !== 'week') return [];

    const weekStart = new Date(selectedDate);
    const dayOfWeek = weekStart.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Semaine française (lun→dim)
    weekStart.setDate(weekStart.getDate() - daysToSubtract);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    return repas.filter((r: Repas) => {
      const repasDateStr = timestampToDateString(r.date);
      return repasDateStr >= weekStartStr && repasDateStr <= selectedDate;
    });
  }, [repas, selectedDate, macrosPeriod]);

  // Calcul des repas du mois pour le mode mois
  const monthMeals = useMemo(() => {
    if (macrosPeriod !== 'month') return [];

    const monthStart = new Date(selectedDate);
    monthStart.setDate(1); // Premier jour du mois
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const filtered = repas.filter((r: Repas) => {
      const dateStr = timestampToDateString(r.date);
      return dateStr >= monthStartStr && dateStr <= selectedDate;
    });

    return filtered;
  }, [repas, selectedDate, macrosPeriod]);

  // Repas selon la période sélectionnée
  const periodMeals = useMemo(() => {
    switch (macrosPeriod) {
      case 'today':
        return todayMeals;
      case 'week':
        return weekMeals;
      case 'month':
        return monthMeals;
      default:
        return todayMeals;
    }
  }, [macrosPeriod, todayMeals, weekMeals, monthMeals]);

  // Hook centralisé pour tous les calculs énergétiques (préparé pour future intégration)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const energyBalance = useEnergyBalance({
    userProfile,
    repas: periodMeals,
    entrainements:
      macrosPeriod === 'today'
        ? entrainements.filter(
            (e) => timestampToDateString(e.date) === selectedDate,
          )
        : entrainements.filter((e) => {
            const weekStart = new Date(selectedDate);
            const dayOfWeek = weekStart.getDay();
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(weekStart.getDate() - daysToSubtract);
            const entrainementDateStr = timestampToDateString(e.date);
            const weekStartStr = weekStart.toISOString().split('T')[0];
            return (
              entrainementDateStr >= weekStartStr &&
              entrainementDateStr <= selectedDate
            );
          }),
    periodDays: macrosPeriod === 'today' ? 1 : 7,
  });

  // Gérer l'ajout ou la modification d'un repas
  const handleAddMeal = async (
    mealType: MealType,
    aliments: Aliment[],
    macros: Macros,
  ) => {
    if (!user || isSubmitting) {
      if (!user) console.error('❌ Utilisateur non connecté');
      return;
    }

    setIsSubmitting(true);
    try {
      const repasData = {
        user_id: user.uid,
        date: selectedDate,
        repas: mealType,
        aliments,
        macros,
      };

      let result;

      if (editingMeal) {
        // Mode édition : mettre à jour le repas existant
        result = await updateRepas(editingMeal, repasData);
      } else {
        // Mode création : ajouter un nouveau repas
        result = await addRepas(repasData);
      }

      if (result.success) {
        toast.success(
          editingMeal
            ? 'Repas modifié avec succès !'
            : 'Repas enregistré avec succès !',
        );
        setShowMealForm(null);
        setEditingMeal(null);
      } else {
        toast.error(
          `Erreur lors de ${editingMeal ? 'la mise à jour' : "l'enregistrement"} : ${result.error}`,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer la suppression d'un repas (temporairement désactivé)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return;

    // Toast de confirmation avec boutons
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-white font-medium">Supprimer ce repas ?</p>
          <p className="text-sm text-gray-300">Cette action est irréversible</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Annuler
            </button>
            <IconButton
              icon={Trash2}
              label="Confirmer la suppression"
              onClick={async () => {
                toast.dismiss(t.id);
                const result = await deleteRepas(mealId);
                if (result.success) {
                  toast.success('Repas supprimé !');
                } else {
                  toast.error(
                    `Erreur lors de la suppression : ${result.error}`,
                  );
                }
              }}
              variant="danger"
              size="sm"
            />
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          minWidth: '300px',
        },
      },
    );
  };

  // Appliquer un template de menu
  const handleApplyTemplate = async (
    templateMeals: Array<{
      repas: MealType;
      aliments: Aliment[];
      macros: Macros;
    }>,
  ) => {
    if (!user) return;

    try {
      for (const templateMeal of templateMeals) {
        const repasData = {
          user_id: user.uid,
          date: selectedDate,
          repas: templateMeal.repas,
          aliments: templateMeal.aliments,
          macros: templateMeal.macros,
        };

        await addRepas(repasData);
      }

      toast.success(
        `Template appliqué ! ${templateMeals.length} repas ajoutés.`,
      );
    } catch {
      toast.error("Erreur lors de l'application du template");
    }
  };

  // Calculer les macros actuels et cibles pour les suggestions intelligentes
  const currentMacros = useMemo(() => {
    const total = todayMeals.reduce(
      (acc: Macros, meal: Repas) => ({
        kcal: acc.kcal + (meal.macros?.kcal || 0),
        prot: acc.prot + (meal.macros?.prot || 0),
        glucides: acc.glucides + (meal.macros?.glucides || 0),
        lipides: acc.lipides + (meal.macros?.lipides || 0),
      }),
      { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
    );

    return {
      calories: total.kcal,
      protein: total.prot,
      carbs: total.glucides,
      fat: total.lipides,
    };
  }, [todayMeals]);

  // Objectifs nutritionnels basés sur le profil utilisateur avec ajustement sport
  const targetMacros = useMemo(() => {
    const estimatedWeight = userProfile?.poids_initial || 70;

    // Calculer calories d'entraînement du jour pour ajustement
    const todayTrainings = entrainements.filter(
      (e) => timestampToDateString(e.date) === selectedDate,
    );
    const todayCaloriesBurned = todayTrainings.reduce(
      (total, training) => total + (training.calories || 0),
      0,
    );

    // TDEE ajusté pour éviter double comptage (utilise les calories du jour, pas une moyenne)
    const baseTDEE = userProfile ? calculateTDEE(userProfile) : 2000;
    const adjustedTDEE = userProfile
      ? calculateAdjustedTDEE(userProfile, todayCaloriesBurned)
      : baseTDEE;
    const finalTDEE = adjustedTDEE || baseTDEE;

    const safeTDEE = finalTDEE || 2000; // Fallback si null

    return {
      calories: safeTDEE,
      protein: Math.round(estimatedWeight * 1.6), // 1.6g/kg (standard fitness)
      carbs: Math.round((safeTDEE * 0.5) / 4), // 50% des calories
      fat: Math.round((safeTDEE * 0.25) / 9), // 25% des calories
      isAdjusted: todayCaloriesBurned > 0 && userProfile,
    };
  }, [userProfile, entrainements, selectedDate]);

  // Objectif utilisateur par défaut (à récupérer depuis le profil)
  const userGoal: 'weight_loss' | 'muscle_gain' | 'maintenance' = 'maintenance';

  // Calculs des macros actuels selon la période
  const periodMacros = useMemo(() => {
    const totalMacros = periodMeals.reduce(
      (acc: Macros, meal: Repas) => ({
        kcal: acc.kcal + (meal.macros?.kcal || 0),
        prot: acc.prot + (meal.macros?.prot || 0),
        glucides: acc.glucides + (meal.macros?.glucides || 0),
        lipides: acc.lipides + (meal.macros?.lipides || 0),
      }),
      { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
    );

    // Calculs selon la période : moyenne pour week/month, total pour today
    const result = {
      calories: {
        current:
          macrosPeriod === 'today'
            ? totalMacros.kcal
            : Math.round(totalMacros.kcal / (macrosPeriod === 'week' ? 7 : 30)),
        target: targetMacros.calories,
        unit: '',
      },
      proteins: {
        current:
          macrosPeriod === 'today'
            ? Math.round(totalMacros.prot)
            : Math.round(totalMacros.prot / (macrosPeriod === 'week' ? 7 : 30)),
        target: targetMacros.protein,
        unit: 'g',
      },
      carbs: {
        current:
          macrosPeriod === 'today'
            ? Math.round(totalMacros.glucides)
            : Math.round(
                totalMacros.glucides / (macrosPeriod === 'week' ? 7 : 30),
              ),
        target: targetMacros.carbs,
        unit: 'g',
      },
      fats: {
        current:
          macrosPeriod === 'today'
            ? Math.round(totalMacros.lipides)
            : Math.round(
                totalMacros.lipides / (macrosPeriod === 'week' ? 7 : 30),
              ),
        target: targetMacros.fat,
        unit: 'g',
      },
    };

    return result;
  }, [periodMeals, targetMacros, macrosPeriod]);

  // Gérer l'ajout d'un aliment suggéré
  const handleAddSuggestedFood = (suggestion: SmartSuggestion) => {
    // Ouvrir le formulaire de repas avec l'aliment pré-rempli
    setShowMealForm('collation_apres_midi'); // Par défaut, ajouter comme collation
    toast.success(`${suggestion.food.name} ajouté à vos suggestions !`);
  };

  // Handlers pour les nouveaux composants industrialisés
  const handleMealView = (meal: Repas) => {
    setSelectedMeal(meal);
    setShowMealDetail(true);
  };

  const handleMealEdit = (meal: Repas) => {
    setEditingMeal(meal.id);
    setShowMealForm(meal.repas);
    setShowMealDetail(false);
  };

  const handleMealDelete = async (mealId: string) => {
    try {
      await deleteRepas(mealId);
      toast.success('Repas supprimé avec succès');
      setShowMealDetail(false);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Raccourcis clavier pour améliorer l'UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n' && !showMealForm) {
        e.preventDefault();
        // Ouvrir le formulaire pour le prochain repas manquant
        const nextMeal = meals.find(
          (meal) => !todayMeals.some((tm) => tm.repas === meal.type),
        );
        if (nextMeal) {
          setShowMealForm(nextMeal.type);
        }
      }
      if (e.key === 'Escape') {
        if (showMealForm) {
          setShowMealForm(null);
          setEditingMeal(null);
        }
        if (showMenuTypes) {
          setShowMenuTypes(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMealForm, showMenuTypes, todayMeals, meals]);

  // Fermer le menu de sélection quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMenuTypes) {
        const target = e.target as Element;
        // Ne pas fermer si on clique sur le FAB ou sur une card de repas
        if (
          !target.closest('.fixed.bottom-6.right-6') &&
          !target.closest('.fixed.bottom-8.right-8') &&
          !target.closest('[data-meal-card]')
        ) {
          setShowMenuTypes(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenuTypes]);

  // Loading state pendant initialisation selectedDate
  if (!selectedDate) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Bouton d'action pour menu-type */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowMenuTypes(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
          >
            <span className="text-lg">🍽️</span>
            Menu-type
          </button>
        </div>

        {/* Header macros industrialisé */}
        {user && (
          <DietProgressHeader
            title="MACROS & NUTRITION"
            emoji="🍎"
            period={macrosPeriod}
            onPeriodChange={(period) =>
              setMacrosPeriod(period as 'today' | 'week' | 'month')
            }
            items={[
              {
                icon: <span className="text-neon-green">🔥</span>,
                label: 'Calories',
                data: periodMacros.calories,
                color: 'neon-green',
              },
              {
                icon: <span className="text-neon-cyan">💪</span>,
                label: 'Protéines',
                data: periodMacros.proteins,
                color: 'neon-cyan',
              },
              {
                icon: <span className="text-neon-yellow">⚡</span>,
                label: 'Glucides',
                data: periodMacros.carbs,
                color: 'neon-yellow',
              },
              {
                icon: <span className="text-neon-pink">💧</span>,
                label: 'Lipides',
                data: periodMacros.fats,
                color: 'neon-pink',
              },
            ]}
            advice={
              periodMeals.length === 0
                ? `Commencez par ajouter votre premier repas ! Objectif: ${Math.round(targetMacros.calories)} kcal`
                : macrosPeriod === 'today'
                  ? `Objectif: ${Math.round(targetMacros.calories)} kcal aujourd'hui`
                  : macrosPeriod === 'week'
                    ? `Moyenne quotidienne: ${Math.round(periodMacros.calories.current)} kcal/jour | Total semaine: ${Math.round(periodMeals.reduce((sum, meal) => sum + (meal.macros?.kcal || 0), 0))} kcal`
                    : `Moyenne quotidienne: ${Math.round(periodMacros.calories.current)} kcal/jour | Total mensuel: ${Math.round(periodMeals.reduce((sum, meal) => sum + (meal.macros?.kcal || 0), 0))} kcal`
            }
          />
        )}

        {/* SECTION 2: RECOMMANDATIONS COACH (optimisé UX) */}
        <CollapsibleCard title="🏋️ Recommandations Coach" defaultOpen={false}>
          <CoachDietSection
            plan={currentPlan}
            planLoading={planLoading}
            comments={dieteComments}
            commentsLoading={commentsLoading}
          />
        </CollapsibleCard>

        {/* SECTION 3: REPAS DU JOUR (toujours ouvert) */}
        <div className="glass-effect p-4 rounded-xl border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              🍽️ REPAS DU JOUR
            </h2>
            <div className="text-xs text-muted-foreground">
              💡 Cliquez pour ajouter des aliments
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                📅 Date :
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all duration-200 flex-1 sm:flex-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split('T')[0])
                }
                className="px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg text-sm hover:bg-neon-cyan/30 transition-colors font-medium whitespace-nowrap"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => setShowHistorique(true)}
                className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors font-medium whitespace-nowrap"
              >
                📊 Historique
              </button>
            </div>
          </div>

          {/* Liste des repas */}
          {!showMealForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meals.map((meal) => {
                // Récupérer TOUS les repas de ce type
                const mealsOfType = todayMeals.filter(
                  (m: Repas) => m.repas === meal.type,
                );

                // Prendre le plus récent (dernier dans la journée)
                const mealData =
                  mealsOfType.length > 0
                    ? mealsOfType[mealsOfType.length - 1]
                    : undefined;

                return (
                  <div key={meal.type} data-meal-card>
                    <DietCardClickable
                      title={meal.name}
                      emoji={meal.icon}
                      time={meal.time}
                      items={
                        mealData?.aliments?.map((aliment: Aliment) => ({
                          name: aliment.nom,
                          quantity: `${aliment.quantite}${aliment.unite}`,
                          calories: aliment.macros?.kcal,
                        })) || []
                      }
                      totalCalories={mealData?.macros?.kcal}
                      macros={
                        mealData?.macros
                          ? {
                              protein: mealData.macros.prot,
                              carbs: mealData.macros.glucides,
                              fat: mealData.macros.lipides,
                            }
                          : undefined
                      }
                      isEmpty={!mealData}
                      onView={() => mealData && handleMealView(mealData)}
                      onEdit={() => mealData && handleMealEdit(mealData)}
                      onDelete={() => mealData && handleMealDelete(mealData.id)}
                      onAdd={() => setShowMealForm(meal.type)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: SUGGESTIONS INTELLIGENTES (après action) */}
        <CollapsibleCard
          title="🧠 Suggestions Intelligentes"
          defaultOpen={false}
        >
          <SmartSuggestions
            currentMacros={currentMacros}
            targetMacros={targetMacros}
            userGoal={userGoal}
            onAddFood={handleAddSuggestedFood}
          />
        </CollapsibleCard>

        {/* SECTION 4: ÉVOLUTION & TENDANCES (evidence-based) */}
        <CollapsibleCard title="📊 Évolution & Tendances" defaultOpen={false}>
          <NutritionAnalytics
            repas={repas}
            userProfile={userProfile}
            selectedDate={selectedDate}
          />
        </CollapsibleCard>

        {/* Message si non connecté */}
        {!user && (
          <div className="glass-effect p-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400">
              Connectez-vous pour enregistrer vos repas et suivre votre
              nutrition !
            </p>
          </div>
        )}

        {/* Formulaire d'ajout/édition de repas industrialisé */}
        {showMealForm && (
          <DietForm
            mealType={showMealForm}
            onSubmit={(aliments, macros) =>
              handleAddMeal(showMealForm, aliments, macros)
            }
            onCancel={() => {
              setShowMealForm(null);
              setEditingMeal(null);
            }}
            existingAliments={
              editingMeal
                ? todayMeals.find((m: Repas) => m.id === editingMeal)?.aliments
                : undefined
            }
            isEditing={!!editingMeal}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Modals */}
        <MenuTypesModal
          isOpen={showMenuTypes}
          onClose={() => setShowMenuTypes(false)}
          todayMeals={todayMeals}
          onApplyTemplate={handleApplyTemplate}
        />

        <HistoriqueModal
          isOpen={showHistorique}
          onClose={() => setShowHistorique(false)}
          currentDate={selectedDate}
          onDateChange={(d) => setSelectedDate(d)}
        />

        {/* Modal détaillée des repas */}
        {selectedMeal && (
          <DietDetailModal
            isOpen={showMealDetail}
            onClose={() => setShowMealDetail(false)}
            title={
              meals.find((m) => m.type === selectedMeal.repas)?.name || 'Repas'
            }
            emoji={
              meals.find((m) => m.type === selectedMeal.repas)?.icon || '🍽️'
            }
            time={meals.find((m) => m.type === selectedMeal.repas)?.time || ''}
            items={
              selectedMeal.aliments?.map((aliment: Aliment) => ({
                name: aliment.nom,
                quantity: `${aliment.quantite}${aliment.unite}`,
                calories: aliment.macros?.kcal || 0,
                protein: aliment.macros?.prot || 0,
                carbs: aliment.macros?.glucides || 0,
                fat: aliment.macros?.lipides || 0,
              })) || []
            }
            totalCalories={selectedMeal.macros?.kcal || 0}
            totalMacros={{
              protein: selectedMeal.macros?.prot || 0,
              carbs: selectedMeal.macros?.glucides || 0,
              fat: selectedMeal.macros?.lipides || 0,
            }}
            onEdit={() => handleMealEdit(selectedMeal)}
            onDelete={() => handleMealDelete(selectedMeal.id)}
          />
        )}
      </div>

      {/* FAB (Floating Action Button) pour ajouter un repas */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        {/* Menu de sélection des types de repas */}
        {showMenuTypes && (
          <div className="absolute bottom-20 right-0 mb-2 bg-space-800/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-2 min-w-[200px]">
            <div className="text-xs text-gray-400 mb-2 px-2">
              Choisir le type de repas :
            </div>
            {meals.map((meal) => (
              <button
                key={meal.type}
                onClick={() => {
                  setShowMealForm(meal.type);
                  setShowMenuTypes(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-sm"
              >
                <span className="text-lg">{meal.icon}</span>
                <span>{meal.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bouton principal */}
        <button
          onClick={() => setShowMenuTypes(!showMenuTypes)}
          className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-full shadow-2xl hover:shadow-neon-purple/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          title="Ajouter un repas (raccourci: Ctrl+N)"
        >
          <span className="text-2xl md:text-3xl group-hover:rotate-90 transition-transform duration-300">
            🍽️
          </span>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        </button>
      </div>
    </MainLayout>
  );
}

// HistoriqueSection supprimée - remplacée par HistoriqueModal
