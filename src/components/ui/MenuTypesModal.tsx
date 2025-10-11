'use client';

import { useState, useEffect } from 'react';
import { Repas } from '@/types';
import {
  Save,
  Copy,
  Trash2,
  Clock,
  Star,
  ChefHat,
  Edit3,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StandardModal from './StandardModal';

interface MenuTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayMeals: Repas[];
  onApplyTemplate: (templateMeals: Repas[]) => void;
}

interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  meals: Repas[];
  totalCalories: number;
  createdAt: string;
}

export default function MenuTypesModal({
  isOpen,
  onClose,
  todayMeals,
  onApplyTemplate,
}: MenuTypesModalProps) {
  const [templates, setTemplates] = useState<MenuTemplate[]>([
    // Templates par défaut avec repas réels
    {
      id: 'template-1',
      name: 'Journée Équilibrée',
      description: 'Menu équilibré pour une journée type',
      meals: [
        {
          id: 'template-1-breakfast',
          user_id: '',
          date: '',
          repas: 'petit_dej',
          aliments: [
            {
              id: '1',
              nom: "Flocons d'avoine",
              quantite: 50,
              unite: 'g',
              macros: { kcal: 180, prot: 6, glucides: 32, lipides: 3 },
            },
            {
              id: '2',
              nom: 'Banane',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 89, prot: 1, glucides: 23, lipides: 0.3 },
            },
            {
              id: '3',
              nom: 'Lait demi-écrémé',
              quantite: 200,
              unite: 'ml',
              macros: { kcal: 92, prot: 6.8, glucides: 9.6, lipides: 3.2 },
            },
          ],
          macros: { kcal: 361, prot: 13.8, glucides: 64.6, lipides: 6.5 },
        },
        {
          id: 'template-1-lunch',
          user_id: '',
          date: '',
          repas: 'dejeuner',
          aliments: [
            {
              id: '4',
              nom: 'Riz complet cuit',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 112, prot: 2.6, glucides: 22, lipides: 0.9 },
            },
            {
              id: '5',
              nom: 'Blanc de poulet',
              quantite: 120,
              unite: 'g',
              macros: { kcal: 172, prot: 32, glucides: 0, lipides: 3.6 },
            },
            {
              id: '6',
              nom: 'Brocolis',
              quantite: 150,
              unite: 'g',
              macros: { kcal: 51, prot: 4.2, glucides: 10, lipides: 0.6 },
            },
          ],
          macros: { kcal: 335, prot: 38.8, glucides: 32, lipides: 5.1 },
        },
        {
          id: 'template-1-dinner',
          user_id: '',
          date: '',
          repas: 'diner',
          aliments: [
            {
              id: '7',
              nom: 'Saumon',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 206, prot: 22, glucides: 0, lipides: 12 },
            },
            {
              id: '8',
              nom: 'Quinoa cuit',
              quantite: 80,
              unite: 'g',
              macros: { kcal: 120, prot: 4.4, glucides: 22, lipides: 1.9 },
            },
            {
              id: '9',
              nom: 'Salade verte',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 15, prot: 1.4, glucides: 3, lipides: 0.2 },
            },
          ],
          macros: { kcal: 341, prot: 27.8, glucides: 25, lipides: 14.1 },
        },
      ],
      totalCalories: 1037,
      createdAt: '2025-01-01',
    },
    {
      id: 'template-2',
      name: 'Journée Sport',
      description: "Menu riche en protéines pour les jours d'entraînement",
      meals: [
        {
          id: 'template-2-breakfast',
          user_id: '',
          date: '',
          repas: 'petit_dej',
          aliments: [
            {
              id: '10',
              nom: 'Oeufs brouillés',
              quantite: 120,
              unite: 'g',
              macros: { kcal: 188, prot: 15, glucides: 1, lipides: 13 },
            },
            {
              id: '11',
              nom: 'Pain complet',
              quantite: 60,
              unite: 'g',
              macros: { kcal: 156, prot: 6, glucides: 28, lipides: 2.4 },
            },
            {
              id: '12',
              nom: 'Avocat',
              quantite: 50,
              unite: 'g',
              macros: { kcal: 80, prot: 1, glucides: 4, lipides: 7.5 },
            },
          ],
          macros: { kcal: 424, prot: 22, glucides: 33, lipides: 22.9 },
        },
        {
          id: 'template-2-lunch',
          user_id: '',
          date: '',
          repas: 'dejeuner',
          aliments: [
            {
              id: '13',
              nom: 'Pâtes complètes cuites',
              quantite: 120,
              unite: 'g',
              macros: { kcal: 131, prot: 5, glucides: 25, lipides: 1.1 },
            },
            {
              id: '14',
              nom: 'Thon',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 144, prot: 30, glucides: 0, lipides: 1 },
            },
            {
              id: '15',
              nom: 'Tomates cerises',
              quantite: 100,
              unite: 'g',
              macros: { kcal: 18, prot: 0.9, glucides: 3.9, lipides: 0.2 },
            },
          ],
          macros: { kcal: 293, prot: 35.9, glucides: 28.9, lipides: 2.3 },
        },
        {
          id: 'template-2-snack',
          user_id: '',
          date: '',
          repas: 'collation_matin',
          aliments: [
            {
              id: '16',
              nom: 'Protéine whey',
              quantite: 30,
              unite: 'g',
              macros: { kcal: 113, prot: 24, glucides: 2, lipides: 1 },
            },
            {
              id: '17',
              nom: 'Amandes',
              quantite: 20,
              unite: 'g',
              macros: { kcal: 116, prot: 4.3, glucides: 3.7, lipides: 10 },
            },
          ],
          macros: { kcal: 229, prot: 28.3, glucides: 5.7, lipides: 11 },
        },
      ],
      totalCalories: 946,
      createdAt: '2025-01-01',
    },
  ]);

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<MenuTemplate | null>(
    null,
  );
  const [viewingTemplate, setViewingTemplate] = useState<MenuTemplate | null>(
    null,
  );
  const [currentView, setCurrentView] = useState<'list' | 'details'>('list');

  // Réinitialiser l'état de visualisation quand la modal se ferme
  useEffect(() => {
    console.log('🔄 useEffect isOpen changé:', isOpen);
    if (!isOpen) {
      console.log('🚪 Modal fermée - réinitialisation des états');
      setViewingTemplate(null);
      setEditingTemplate(null);
      setCurrentView('list');
    }
  }, [isOpen]);

  const todayTotalCalories = todayMeals.reduce(
    (total, meal) => total + (meal.macros?.kcal || 0),
    0,
  );

  const handleSaveCurrentDay = () => {
    if (!newTemplateName.trim()) {
      toast.error('Veuillez entrer un nom pour le template');
      return;
    }

    if (todayMeals.length === 0) {
      toast.error("Aucun repas à sauvegarder pour aujourd'hui");
      return;
    }

    const newTemplate: MenuTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || 'Template personnalisé',
      meals: todayMeals.map((meal) => ({
        ...meal,
        id: `${meal.id}-template`, // Nouvel ID pour éviter les conflits
        date: '', // Sera rempli lors de l'application
        created_at: undefined, // Sera généré lors de l'application
      })),
      totalCalories: todayTotalCalories,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTemplates([newTemplate, ...templates]);
    setNewTemplateName('');
    setNewTemplateDescription('');
    toast.success(`Template "${newTemplate.name}" créé avec succès !`);
  };

  const handleApplyTemplate = (template: MenuTemplate) => {
    if (template.meals.length === 0) {
      toast.error('Ce template ne contient aucun repas');
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="text-white font-medium">
            Appliquer le template &quot;{template.name}&quot; ?
          </div>
          <div className="text-sm text-gray-300">
            {template.meals.length} repas • {template.totalCalories} kcal
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onApplyTemplate(template.meals);
                onClose();
                toast.success('Template appliqué !');
              }}
              className="px-3 py-1 text-sm bg-neon-cyan/30 hover:bg-neon-cyan/40 text-white rounded transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(34,211,238,0.3)',
          minWidth: '320px',
        },
      },
    );
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="text-white font-medium">
            Supprimer le template &quot;{template.name}&quot; ?
          </div>
          <div className="text-sm text-gray-300">
            Cette action est irréversible.
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                setTemplates(templates.filter((tp) => tp.id !== templateId));
                toast.dismiss(t.id);
                toast.success('Template supprimé');
              }}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded"
            >
              Supprimer
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(239,68,68,0.3)',
          minWidth: '320px',
        },
      },
    );
  };

  const handleEditTemplate = (template: MenuTemplate) => {
    setEditingTemplate({ ...template });
  };

  const handleSaveEditedTemplate = () => {
    if (!editingTemplate) return;

    // Recalculer les calories totales
    const totalCalories = editingTemplate.meals.reduce(
      (sum, meal) => sum + (meal.macros?.kcal || 0),
      0,
    );

    const updatedTemplate = {
      ...editingTemplate,
      totalCalories,
    };

    setTemplates(
      templates.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t)),
    );
    setEditingTemplate(null);
    alert(`Template "${updatedTemplate.name}" mis à jour !`);
  };

  const handleViewTemplate = (template: MenuTemplate) => {
    console.log('🔍 handleViewTemplate appelé avec:', template.name);
    setViewingTemplate(template);
    setCurrentView('details');
    console.log(
      '🔍 États mis à jour - viewingTemplate:',
      template.name,
      'currentView: details',
    );
  };

  const getMealTypeName = (mealType: string) => {
    const names = {
      petit_dej: 'Petit-déjeuner',
      dejeuner: 'Déjeuner',
      diner: 'Dîner',
      collation: 'Collation',
    };
    return names[mealType as keyof typeof names] || mealType;
  };

  if (!isOpen) return null;

  return (
    <>
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          currentView === 'details' && viewingTemplate
            ? viewingTemplate.name
            : 'Menu-Types'
        }
        subtitle={
          currentView === 'details' && viewingTemplate
            ? viewingTemplate.description
            : 'Créez et gérez vos templates de repas. Sauvegardez votre journée actuelle ou appliquez un template existant.'
        }
        icon={
          currentView === 'details' ? (
            <Eye className="h-6 w-6 text-neon-cyan" />
          ) : (
            <ChefHat className="h-6 w-6 text-neon-purple" />
          )
        }
        maxWidth="4xl"
        height="90vh"
        onEdit={
          currentView === 'details' ? () => setCurrentView('list') : undefined
        }
        editLabel="Retour à la liste"
      >
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {(() => {
            console.log(
              '🎨 Rendu - currentView:',
              currentView,
              'viewingTemplate:',
              viewingTemplate?.name || 'null',
            );
            return currentView === 'list';
          })() ? (
            <>
              {/* Sauvegarder journée actuelle */}
              <div className="glass-effect p-4 rounded-lg border border-neon-purple/20 mb-6">
                <h2 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <Save className="h-5 w-5 text-neon-purple" />
                  Sauvegarder la journée actuelle
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Nom du template
                    </label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Ex: Ma journée parfaite"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Description (optionnelle)
                    </label>
                    <input
                      type="text"
                      value={newTemplateDescription}
                      onChange={(e) =>
                        setNewTemplateDescription(e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Ex: Menu équilibré pour les jours calmes"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {todayMeals.length} repas · {todayTotalCalories} kcal
                      total
                    </div>
                    <button
                      onClick={handleSaveCurrentDay}
                      disabled={
                        !newTemplateName.trim() || todayMeals.length === 0
                      }
                      className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des templates */}
              <div>
                <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Templates disponibles
                </h2>

                {templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun template sauvegardé</p>
                    <p className="text-sm mt-1">
                      Créez votre premier template en sauvegardant une journée
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="glass-effect p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">
                              {template.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                console.log(
                                  '👁️ Bouton œil cliqué pour:',
                                  template.name,
                                );
                                e.stopPropagation();
                                handleViewTemplate(template);
                              }}
                              className="p-1 text-neon-cyan hover:text-cyan-300 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTemplate(template);
                              }}
                              className="p-1 text-neon-purple hover:text-purple-300 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                          <span>{template.meals.length} repas</span>
                          <span>{template.totalCalories} kcal</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.createdAt}
                          </span>
                        </div>
                        {/* Aperçu macros rapide */}
                        <div className="text-xs text-muted-foreground mb-3">
                          {(() => {
                            const totals = template.meals.reduce(
                              (acc, m) => ({
                                prot: acc.prot + (m.macros?.prot || 0),
                                glucides:
                                  acc.glucides + (m.macros?.glucides || 0),
                                lipides: acc.lipides + (m.macros?.lipides || 0),
                              }),
                              { prot: 0, glucides: 0, lipides: 0 },
                            );
                            return (
                              <span>
                                P {totals.prot.toFixed(0)}g • G{' '}
                                {totals.glucides.toFixed(0)}g • L{' '}
                                {totals.lipides.toFixed(0)}g
                              </span>
                            );
                          })()}
                        </div>

                        <button
                          onClick={() => handleApplyTemplate(template)}
                          className="w-full px-3 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Appliquer ce template
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Vue détails */
            viewingTemplate && (
              <div className="space-y-4">
                {(() => {
                  console.log(
                    '📋 Rendu section détails pour:',
                    viewingTemplate.name,
                    'Meals:',
                    viewingTemplate.meals.length,
                  );
                  console.log(
                    '📋 CONTENU COMPLET du template:',
                    JSON.stringify(viewingTemplate, null, 2),
                  );
                  return null;
                })()}
                {/* Indicateur visuel de debug */}
                <div className="bg-red-500/20 border border-red-500 p-2 rounded text-red-300 text-sm mb-4">
                  🔍 DEBUG: Vue détails active pour &quot;{viewingTemplate.name}
                  &quot; - {viewingTemplate.meals.length} repas
                </div>
                {viewingTemplate.meals.map((meal, index) => {
                  console.log(
                    `🍽️ Rendu repas ${index + 1}:`,
                    meal.repas,
                    'Aliments:',
                    meal.aliments.length,
                  );
                  return (
                    <div
                      key={index}
                      className="glass-effect p-4 rounded-lg border border-white/10"
                    >
                      <h4 className="font-medium text-white mb-2">
                        {getMealTypeName(meal.repas)}
                      </h4>
                      <div className="space-y-2">
                        {meal.aliments.map((aliment, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-white">
                              {aliment.nom} ({aliment.quantite}
                              {aliment.unite})
                            </span>
                            <span className="text-muted-foreground">
                              {aliment.macros?.kcal ?? 0} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 text-sm">
                        <div className="flex justify-between text-neon-green">
                          <span>Total:</span>
                          <span>
                            {meal.macros.kcal} kcal • {meal.macros.prot}g prot
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-white">Total journée:</span>
                    <span className="text-neon-green">
                      {viewingTemplate.totalCalories} kcal
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </StandardModal>

      {/* Modal d'édition */}
      {editingTemplate && (
        <div style={{ zIndex: 60 }}>
          <StandardModal
            isOpen={!!editingTemplate}
            onClose={() => setEditingTemplate(null)}
            title="Modifier le template"
            subtitle="Modifiez le nom, la description et les repas de votre template."
            icon={<Edit3 className="h-6 w-6 text-neon-purple" />}
            maxWidth="2xl"
            height="90vh"
          >
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nom du template
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value,
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.description}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        description: e.target.value,
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">Repas inclus</h4>
                {editingTemplate.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="glass-effect p-4 rounded-lg border border-white/10"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-white">
                        {getMealTypeName(meal.repas)}
                      </h5>
                      <button
                        onClick={() => {
                          const updatedMeals = editingTemplate.meals.filter(
                            (_, i) => i !== index,
                          );
                          setEditingTemplate({
                            ...editingTemplate,
                            meals: updatedMeals,
                          });
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer ce repas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {meal.aliments.length} aliment(s) • {meal.macros.kcal}{' '}
                      kcal
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {meal.aliments.map((a) => a.nom).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-white/10">
              <div className="text-sm text-muted-foreground">
                {editingTemplate.meals.length} repas •{' '}
                {editingTemplate.meals.reduce(
                  (sum, meal) => sum + meal.macros.kcal,
                  0,
                )}{' '}
                kcal total
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEditedTemplate}
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </StandardModal>
        </div>
      )}
    </>
  );
}
