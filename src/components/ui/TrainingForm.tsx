'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Entrainement } from '@/types'
// generateId removed - not used
import { getQuickCalorieEstimate, smartCalorieCalculation } from '@/lib/caloriesCalculator'
import { entrainementSchema, validateData } from '@/lib/validation'
import { X, Timer, Target, Heart, Calculator, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useFirestore'

interface TrainingFormProps {
  onSubmit: (training: Omit<Entrainement, 'id' | 'user_id'>) => void
  onCancel: () => void
  existingTraining?: Entrainement
  isEditing?: boolean
  isSubmitting?: boolean
}

const TRAINING_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: '🏃', color: 'neon-green' },
  { value: 'musculation', label: 'Musculation', icon: '💪', color: 'neon-cyan' },
  { value: 'hiit', label: 'HIIT', icon: '🔥', color: 'neon-pink' },
  { value: 'yoga', label: 'Yoga', icon: '🧘', color: 'neon-purple' },
  { value: 'natation', label: 'Natation', icon: '🏊', color: 'neon-cyan' },
  { value: 'cyclisme', label: 'Cyclisme', icon: '🚴', color: 'neon-green' },
  { value: 'course', label: 'Course à pied', icon: '🏃', color: 'neon-pink' },
  { value: 'autre', label: 'Autre', icon: '⚡', color: 'neon-purple' }
]

export default function TrainingForm({ onSubmit, onCancel, existingTraining, isEditing, isSubmitting }: TrainingFormProps) {
  // Récupération des données utilisateur
  const { user } = useAuth()
  const { getUserProfile } = useUserProfile()
  const [userProfile, setUserProfile] = useState<any>(null)

  // États de base
  const [type, setType] = useState(existingTraining?.type || 'cardio')
  const [duree, setDuree] = useState(existingTraining?.duree || 30)
  const [calories, setCalories] = useState(existingTraining?.calories || 0)
  const [commentaire, setCommentaire] = useState(existingTraining?.commentaire || '')
  const [date, setDate] = useState(existingTraining?.date || new Date().toISOString().split('T')[0])
  
  // États avancés (style Garmin)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [fcMoyenne, setFcMoyenne] = useState(existingTraining?.fc_moyenne || 0)
  const [fcMax, setFcMax] = useState(existingTraining?.fc_max || 0)
  const [fcMin, setFcMin] = useState(existingTraining?.fc_min || 0)
  const [distance, setDistance] = useState(existingTraining?.distance || 0)
  const [vitesseMoy, setVitesseMoy] = useState(existingTraining?.vitesse_moy || 0)
  const [vitesseMax, setVitesseMax] = useState(existingTraining?.vitesse_max || 0)
  const [elevationGain, setElevationGain] = useState(existingTraining?.elevation_gain || 0)
  const [cadenceMoy, setCadenceMoy] = useState(existingTraining?.cadence_moy || 0)
  const [puissanceMoy, setPuissanceMoy] = useState(existingTraining?.puissance_moy || 0)
  const [effortPercu, setEffortPercu] = useState(existingTraining?.effort_percu || 5)
  const [fatigueAvant, setFatigueAvant] = useState(existingTraining?.fatigue_avant || 5)
  const [fatigueApres, setFatigueApres] = useState(existingTraining?.fatigue_apres || 5)
  
  // États pour calcul automatique calories
  const [autoCalories, setAutoCalories] = useState(0)
  const [calculationMethod, setCalculationMethod] = useState('')
  const [useAutoCalories, setUseAutoCalories] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // États pour validation
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [hasValidated, setHasValidated] = useState(false)

  // Récupération du profil utilisateur au montage
  useEffect(() => {
    let isMounted = true
    const loadUserProfile = async () => {
      if (user?.uid) {
        const profile = await getUserProfile?.(user.uid)
        if (isMounted) setUserProfile(profile)
      }
    }
    loadUserProfile()
    return () => { isMounted = false }
  }, [user?.uid])

  // Synchroniser le formulaire quand une nouvelle séance est sélectionnée pour édition
  useEffect(() => {
    if (!existingTraining) return
    setType(existingTraining.type || 'cardio')
    setDuree(existingTraining.duree || 30)
    setCalories(existingTraining.calories || 0)
    setCommentaire(existingTraining.commentaire || '')
    setDate(existingTraining.date || new Date().toISOString().split('T')[0])
    setFcMoyenne(existingTraining.fc_moyenne || 0)
    setFcMax(existingTraining.fc_max || 0)
    setFcMin(existingTraining.fc_min || 0)
    setDistance(existingTraining.distance || 0)
    setVitesseMoy(existingTraining.vitesse_moy || 0)
    setVitesseMax(existingTraining.vitesse_max || 0)
    setElevationGain(existingTraining.elevation_gain || 0)
    setCadenceMoy(existingTraining.cadence_moy || 0)
    setPuissanceMoy(existingTraining.puissance_moy || 0)
    setEffortPercu(existingTraining.effort_percu || 5)
    setFatigueAvant(existingTraining.fatigue_avant || 5)
    setFatigueApres(existingTraining.fatigue_apres || 5)
  }, [existingTraining])

  // Calcul automatique des calories
  useEffect(() => {
    if (type && duree > 0) {
      setIsCalculating(true)
      
      // Petit délai pour montrer l'effet de calcul
      const timer = setTimeout(() => {
        // Calculer la vitesse si on a distance et durée
        const calculatedSpeed = distance && duree > 0 ? (distance * 60) / duree : vitesseMoy
        
        const calculationData = {
          type,
          duree,
          fc_moyenne: fcMoyenne || undefined,
          distance: distance || undefined,
          vitesse_moy: calculatedSpeed || undefined,
          age: userProfile?.age || 30, // Utilise le profil ou valeur par défaut
          poids_utilisateur: userProfile?.poids_initial || 70, // Utilise le profil ou valeur par défaut
          sexe: (userProfile?.sexe || 'M') as 'M' | 'F' // Utilise le profil ou valeur par défaut
        }
        
          const result = smartCalorieCalculation(calculationData)
          const computed = result.calories && result.calories > 0 
            ? result.calories 
            : getQuickCalorieEstimate(type, duree)
        setAutoCalories(Math.round(computed))
        setCalculationMethod(result.method || 'estimation')
        setIsCalculating(false)
        
        // Auto-utiliser si pas de calories manuelles
        if (calories === 0 && !isEditing) {
          setUseAutoCalories(true)
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [type, duree, fcMoyenne, distance, calories, isEditing, vitesseMoy, effortPercu, userProfile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasValidated(true)

    const finalCalories = useAutoCalories ? autoCalories : calories
    
    // Construire l'objet pour validation (avec user_id temporaire)
    const trainingDataForValidation: any = {
      user_id: 'temp', // Temporaire pour validation
      type,
      duree,
      date,
      source: 'manuel',
    }
    
    // Ajouter seulement les champs avec des valeurs
    if (finalCalories > 0) trainingDataForValidation.calories = finalCalories
    if (commentaire.trim()) trainingDataForValidation.commentaire = commentaire.trim()
    
    // Données avancées (seulement si > 0)
    if (fcMoyenne > 0) trainingDataForValidation.fc_moyenne = fcMoyenne
    if (fcMax > 0) trainingDataForValidation.fc_max = fcMax
    if (fcMin > 0) trainingDataForValidation.fc_min = fcMin
    if (distance > 0) trainingDataForValidation.distance = distance
    if (vitesseMoy > 0) trainingDataForValidation.vitesse_moy = vitesseMoy
    if (vitesseMax > 0) trainingDataForValidation.vitesse_max = vitesseMax
    if (elevationGain > 0) trainingDataForValidation.elevation_gain = elevationGain
    if (cadenceMoy > 0) trainingDataForValidation.cadence_moy = cadenceMoy
    if (puissanceMoy > 0) trainingDataForValidation.puissance_moy = puissanceMoy
    if (effortPercu !== 5) trainingDataForValidation.effort_percu = effortPercu
    if (fatigueAvant !== 5) trainingDataForValidation.fatigue_avant = fatigueAvant
    if (fatigueApres !== 5) trainingDataForValidation.fatigue_apres = fatigueApres

    // Validation avec Zod
    const validation = validateData(entrainementSchema, trainingDataForValidation)
    
    if (!validation.success && validation.errors) {
      setValidationErrors(validation.errors)
      toast.error(`Données invalides : ${validation.errors[0]}`)
      return
    }
    
    setValidationErrors([])
    
    // Retirer le user_id temporaire pour l'envoi final
    const { user_id: _user_id, ...finalTrainingData } = trainingDataForValidation
    onSubmit(finalTrainingData)
  }

  const selectedType = TRAINING_TYPES.find(t => t.value === type)

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {isEditing ? 'Modifier l\'entraînement' : 'Ajouter un entraînement'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Erreurs de validation */}
      {hasValidated && validationErrors.length > 0 && (
        <div className="glass-effect p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-red-400 font-medium">Erreurs de validation :</h4>
              <ul className="text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Date de l&apos;entraînement
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
          />
        </div>

        {/* Type d'entraînement */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Type d&apos;activité
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRAINING_TYPES.map((trainingType) => (
              <button
                key={trainingType.value}
                type="button"
                onClick={() => setType(trainingType.value)}
                className={`p-3 rounded-lg border transition-all ${
                  type === trainingType.value
                    ? `border-${trainingType.color} bg-${trainingType.color}/20`
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{trainingType.icon}</div>
                  <div className={`text-xs font-medium ${
                    type === trainingType.value ? `text-${trainingType.color}` : 'text-white'
                  }`}>
                    {trainingType.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Durée et calories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Timer className="inline h-4 w-4 mr-1" />
              Durée (minutes)
            </label>
            <input
              type="number"
              value={duree}
              onChange={(e) => setDuree(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green"
              min="1"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Target className="inline h-4 w-4 mr-1" />
              Calories brûlées
            </label>
            
            {/* Calcul automatique */}
            {autoCalories > 0 && (
              <div className={`mb-3 p-3 border rounded-lg transition-all duration-300 ${
                isCalculating 
                  ? 'bg-neon-cyan/10 border-neon-cyan/20 animate-pulse' 
                  : 'bg-neon-green/10 border-neon-green/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calculator className={`h-4 w-4 ${isCalculating ? 'text-neon-cyan animate-spin' : 'text-neon-green'}`} />
                    <span className={`text-sm font-medium ${isCalculating ? 'text-neon-cyan' : 'text-neon-green'}`}>
                      {isCalculating ? 'Calcul en cours...' : 'Calcul automatique'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold transition-colors ${isCalculating ? 'text-neon-cyan' : 'text-neon-green'}`}>
                    {isCalculating ? '⚡' : `${autoCalories} kcal`}
                  </span>
                </div>
                {!isCalculating && (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      Méthode: {calculationMethod}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAutoCalories}
                        onChange={(e) => setUseAutoCalories(e.target.checked)}
                        className="rounded border-gray-300 text-neon-green focus:ring-neon-green"
                      />
                      <span className="text-sm text-white">Utiliser le calcul automatique</span>
                    </label>
                  </>
                )}
              </div>
            )}
            
            {/* Saisie manuelle */}
            <div className={useAutoCalories ? 'opacity-50' : ''}>
              <input
                type="number"
                value={calories}
                onChange={(e) => {
                  setCalories(Number(e.target.value))
                  if (Number(e.target.value) > 0) {
                    setUseAutoCalories(false)
                  }
                }}
                disabled={useAutoCalories}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-pink disabled:opacity-50"
                min="0"
                placeholder={autoCalories > 0 ? "Ou saisie manuelle" : "Calories brûlées"}
              />
            </div>
          </div>
        </div>

        {/* Toggle données avancées */}
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-neon-cyan hover:text-white transition-colors"
          >
            <span>{showAdvanced ? '📊' : '⚡'}</span>
            {showAdvanced ? 'Masquer les données avancées' : 'Données avancées (FC, distance, etc.)'}
          </button>
        </div>

        {/* Section avancée */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-neon-cyan/20">
            <h3 className="text-sm font-medium text-neon-cyan mb-3">📊 Données style Garmin</h3>
            
            {/* Fréquence cardiaque */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Heart className="inline h-4 w-4 mr-1 text-red-400" />
                Fréquence cardiaque
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Min (bpm)</label>
                  <input
                    type="number"
                    value={fcMin}
                    onChange={(e) => setFcMin(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-red-400"
                    min="0"
                    max="220"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Moy (bpm)</label>
                  <input
                    type="number"
                    value={fcMoyenne}
                    onChange={(e) => setFcMoyenne(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-red-400"
                    min="0"
                    max="220"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Max (bpm)</label>
                  <input
                    type="number"
                    value={fcMax}
                    onChange={(e) => setFcMax(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white/10 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-red-400"
                    min="0"
                    max="220"
                  />
                </div>
              </div>
            </div>

            {/* Distance et vitesse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Vitesse moy (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitesseMoy}
                  onChange={(e) => setVitesseMoy(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                  min="0"
                />
              </div>
            </div>

            {/* Données spécialisées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Dénivelé+ (m)</label>
                <input
                  type="number"
                  value={elevationGain}
                  onChange={(e) => setElevationGain(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-purple"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Cadence moy</label>
                <input
                  type="number"
                  value={cadenceMoy}
                  onChange={(e) => setCadenceMoy(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-pink"
                  min="0"
                  placeholder="spm/rpm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Puissance (W)</label>
                <input
                  type="number"
                  value={puissanceMoy}
                  onChange={(e) => setPuissanceMoy(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                  min="0"
                />
              </div>
            </div>

            {/* Ressenti subjectif */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Ressenti subjectif</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Effort perçu (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={effortPercu}
                    onChange={(e) => setEffortPercu(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-white mt-1">{effortPercu}/10</div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Fatigue avant (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={fatigueAvant}
                    onChange={(e) => setFatigueAvant(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-white mt-1">{fatigueAvant}/10</div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Fatigue après (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={fatigueApres}
                    onChange={(e) => setFatigueApres(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-white mt-1">{fatigueApres}/10</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Commentaires (optionnel)
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-purple h-20 resize-none"
            placeholder="Comment s'est passé votre entraînement ?"
          />
        </div>

        {/* Aperçu */}
        {selectedType && (
          <div className="glass-effect p-4 rounded-lg border border-white/5 bg-white/5">
            <h3 className="text-sm font-medium text-white mb-2">Aperçu</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-lg">{selectedType.icon}</span>
                <span className={`text-${selectedType.color}`}>{selectedType.label}</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-neon-green">{duree} min</span>
              {calories > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-neon-pink">{calories} kcal</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-neon-green border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting 
              ? 'Enregistrement...' 
              : (isEditing ? 'Mettre à jour' : 'Enregistrer l\'entraînement')
            }
          </button>
        </div>
      </form>
    </div>
  )
}