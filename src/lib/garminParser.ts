import xml2js from 'xml2js'
import { Entrainement } from '@/types'

export interface GarminActivity {
  id: string
  name: string
  sport: string
  startTime: Date
  totalTimeSeconds: number
  distanceMeters?: number
  calories?: number
  averageHeartRate?: number
  maxHeartRate?: number
  minHeartRate?: number
  trackPoints?: TrackPoint[]
}

export interface TrackPoint {
  time: Date
  heartRate?: number
  distanceMeters?: number
  latitudeDegrees?: number
  longitudeDegrees?: number
  altitudeMeters?: number
}

// Mapping des sports Garmin vers nos types
const SPORT_MAPPING: Record<string, string> = {
  'Other': 'cardio',        // Par défaut "Other" → cardio
  'strength_training': 'musculation',
  'Running': 'course',
  'Cycling': 'cyclisme',
  'Swimming': 'natation',
  'Cardio': 'cardio',
  'HIIT': 'hiit',
  'Yoga': 'yoga',
  
  // Mapping supplémentaires Garmin
  'Generic': 'cardio',
  'Fitness_Equipment': 'cardio',
  'Weight_Training': 'musculation',
  'Strength': 'musculation'
}

export class GarminParser {
  private parser = new xml2js.Parser({ explicitArray: false })

  async parseFile(fileContent: string, fileName: string): Promise<GarminActivity> {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'tcx':
        return this.parseTCX(fileContent)
      case 'gpx':
        return this.parseGPX(fileContent)
      default:
        throw new Error(`Format de fichier non supporté: ${extension}`)
    }
  }

  private async parseTCX(xmlContent: string): Promise<GarminActivity> {
    try {
      const result = await this.parser.parseStringPromise(xmlContent)
      const activity = result.TrainingCenterDatabase.Activities.Activity
      
      if (!activity) {
        throw new Error('Aucune activité trouvée dans le fichier TCX')
      }

      // Extraire les données principales
      const lap = activity.Lap
      const startTime = new Date(activity.Id)
      const totalTimeSeconds = parseFloat(lap.TotalTimeSeconds || '0')
      const distanceMeters = parseFloat(lap.DistanceMeters || '0')
      const calories = parseInt(lap.Calories || '0')
      
      // Fréquence cardiaque
      const avgHR = lap.AverageHeartRateBpm?.Value ? parseInt(lap.AverageHeartRateBpm.Value) : undefined
      const maxHR = lap.MaximumHeartRateBpm?.Value ? parseInt(lap.MaximumHeartRateBpm.Value) : undefined

      // Parser les trackpoints pour FC min et détails
      const trackPoints: TrackPoint[] = []
      let minHR: number | undefined

      if (lap.Track?.Trackpoint) {
        const points = Array.isArray(lap.Track.Trackpoint) ? lap.Track.Trackpoint : [lap.Track.Trackpoint]
        
        for (const point of points) {
          const trackPoint: TrackPoint = {
            time: new Date(point.Time),
            distanceMeters: parseFloat(point.DistanceMeters || '0')
          }

          if (point.HeartRateBpm?.Value) {
            const hr = parseInt(point.HeartRateBpm.Value)
            trackPoint.heartRate = hr
            
            // Calculer FC min
            if (!minHR || hr < minHR) {
              minHR = hr
            }
          }

          if (point.Position) {
            trackPoint.latitudeDegrees = parseFloat(point.Position.LatitudeDegrees || '0')
            trackPoint.longitudeDegrees = parseFloat(point.Position.LongitudeDegrees || '0')
          }

          if (point.AltitudeMeters) {
            trackPoint.altitudeMeters = parseFloat(point.AltitudeMeters)
          }

          trackPoints.push(trackPoint)
        }
      }

      // Détection intelligente du type d'activité
      let detectedSport = SPORT_MAPPING[activity.$.Sport] || 'cardio'
      
      // Si "Other", essayer de deviner selon les caractéristiques
      if (activity.$.Sport === 'Other') {
        if (distanceMeters === 0 && avgHR && avgHR < 130) {
          detectedSport = 'musculation'  // Pas de distance + FC basse = muscu
        } else if (distanceMeters > 0) {
          detectedSport = 'course'       // Distance > 0 = course/vélo
        }
      }

      return {
        id: activity.Id,
        name: activity.$.Sport || 'Entraînement',
        sport: detectedSport,
        startTime,
        totalTimeSeconds,
        distanceMeters: distanceMeters > 0 ? distanceMeters : undefined,
        calories: calories > 0 ? calories : undefined,
        averageHeartRate: avgHR,
        maxHeartRate: maxHR,
        minHeartRate: minHR,
        trackPoints
      }
    } catch (error) {
      console.error('Erreur parsing TCX:', error)
      throw new Error('Impossible de parser le fichier TCX')
    }
  }

  private async parseGPX(xmlContent: string): Promise<GarminActivity> {
    try {
      const result = await this.parser.parseStringPromise(xmlContent)
      const track = result.gpx.trk
      
      if (!track) {
        throw new Error('Aucune track trouvée dans le fichier GPX')
      }

      const startTime = new Date(result.gpx.metadata.time)
      const trackName = track.name || 'Entraînement'
      const sport = SPORT_MAPPING[track.type] || 'autre'

      return {
        id: startTime.toISOString(),
        name: trackName,
        sport,
        startTime,
        totalTimeSeconds: 0, // GPX n'a pas toujours la durée
        trackPoints: []
      }
    } catch (error) {
      console.error('Erreur parsing GPX:', error)
      throw new Error('Impossible de parser le fichier GPX')
    }
  }

  // Convertir une activité Garmin vers notre format Entrainement
  toEntrainement(activity: GarminActivity, userId: string): Omit<Entrainement, 'id' | 'created_at'> {
    // Debug: conversion activité Garmin (retiré en production)
    // Calculer vitesse moyenne si on a distance et temps
    let vitesseMoy: number | undefined
    if (activity.distanceMeters && activity.totalTimeSeconds > 0) {
      const distanceKm = activity.distanceMeters / 1000
      const tempsHours = activity.totalTimeSeconds / 3600
      vitesseMoy = Math.round((distanceKm / tempsHours) * 100) / 100
    }

    // Calculer dénivelé si on a des trackpoints avec altitude
    let elevationGain: number | undefined
    if (activity.trackPoints && activity.trackPoints.length > 0) {
      const altitudes = activity.trackPoints
        .map(tp => tp.altitudeMeters)
        .filter(alt => alt !== undefined) as number[]
      
      if (altitudes.length > 1) {
        let gain = 0
        for (let i = 1; i < altitudes.length; i++) {
          const diff = altitudes[i] - altitudes[i - 1]
          if (diff > 0) gain += diff
        }
        elevationGain = Math.round(gain)
      }
    }

    // Vérifier que le type est valide, sinon utiliser 'cardio'
    const validTypes = ['cardio', 'musculation', 'course', 'cyclisme', 'natation', 'hiit', 'yoga']
    const finalType = validTypes.includes(activity.sport) ? activity.sport : 'cardio'

    // Créer un identifiant unique pour détecter les doublons
    const uniqueId = this.generateUniqueId(activity, userId)

    const baseResult = {
      user_id: userId,
      date: activity.startTime.toISOString().split('T')[0],
      type: finalType,
      duree: Math.round(activity.totalTimeSeconds / 60), // Convertir en minutes
      source: 'garmin' as const,
      commentaire: `Importé: ${activity.name}`,
      fichier_original: activity.name,
      device: 'Garmin',
      garmin_id: uniqueId // Identifiant unique pour éviter les doublons
    }

    // Ajouter seulement les champs qui ont une valeur (pas undefined)
    const result: any = { ...baseResult }
    
    if (activity.calories) result.calories = activity.calories
    if (activity.averageHeartRate) result.fc_moyenne = activity.averageHeartRate
    if (activity.maxHeartRate) result.fc_max = activity.maxHeartRate
    if (activity.minHeartRate) result.fc_min = activity.minHeartRate
    if (activity.distanceMeters && activity.distanceMeters > 0) {
      result.distance = Math.round(activity.distanceMeters / 10) / 100 // Convertir en km
    }
    if (vitesseMoy) result.vitesse_moy = vitesseMoy
    if (elevationGain) result.elevation_gain = elevationGain

    // Debug: entraînement converti (retiré en production)
    return result
  }

  /**
   * Génère un identifiant unique basé sur les caractéristiques de l'activité
   * pour détecter les doublons lors d'imports multiples
   */
  private generateUniqueId(activity: GarminActivity, userId: string): string {
    const components = [
      userId,
      activity.startTime.toISOString(),
      activity.totalTimeSeconds.toString(),
      activity.sport,
      activity.calories?.toString() || '0',
      activity.distanceMeters?.toString() || '0'
    ]
    
    // Créer un hash simple à partir des composants
    const combined = components.join('|')
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convertir en 32bit integer
    }
    
    return `garmin_${Math.abs(hash).toString(16)}`
  }
}

export const garminParser = new GarminParser()