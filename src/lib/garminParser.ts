import xml2js from 'xml2js';
import { Timestamp } from 'firebase/firestore';
import { Entrainement } from '@/types';

// Types pour les activités Garmin
export interface GarminActivity {
  id: string;
  startTime: Date;
  totalTimeSeconds: number;
  sport: string;
  calories?: number;
  distanceMeters?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  trackPoints?: TrackPoint[];
}

export interface TrackPoint {
  time: Date;
  heartRate?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

// Mapping des sports Garmin vers nos types
const SPORT_MAPPING: Record<string, string> = {
  Running: 'course',
  Cycling: 'velo',
  Swimming: 'natation',
  Strength_Training: 'musculation',
  Yoga: 'yoga',
  Walking: 'marche',
  Hiking: 'randonnee',
  Tennis: 'tennis',
  Basketball: 'basketball',
  Soccer: 'football',
  Fitness_Equipment: 'cardio',
  Weight_Training: 'musculation',
  Strength: 'musculation',
};

export class GarminParser {
  private parser = new xml2js.Parser({ explicitArray: false });

  async parseFile(
    fileContent: string,
    fileName: string,
  ): Promise<GarminActivity> {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'tcx':
        return this.parseTCX(fileContent);
      case 'gpx':
        return this.parseGPX(fileContent);
      default:
        throw new Error(`Format de fichier non supporté: ${extension}`);
    }
  }

  private async parseTCX(xmlContent: string): Promise<GarminActivity> {
    try {
      const result = await this.parser.parseStringPromise(xmlContent);
      const activity = result.TrainingCenterDatabase?.Activities?.Activity;

      if (!activity) {
        throw new Error('Aucune activité trouvée dans le fichier TCX');
      }

      const lap = Array.isArray(activity.Lap) ? activity.Lap[0] : activity.Lap;
      const startTime = new Date(activity.$.StartTime || activity.Id);
      const totalTimeSeconds = parseFloat(lap?.TotalTimeSeconds || '0');
      const sport = SPORT_MAPPING[activity.$.Sport] || 'autre';
      const calories = parseInt(lap?.Calories || '0');
      const distanceMeters = parseFloat(lap?.DistanceMeters || '0');
      const avgHeartRate = parseInt(lap?.AverageHeartRateBpm?.Value || '0');
      const maxHeartRate = parseInt(lap?.MaximumHeartRateBpm?.Value || '0');

      // Parser les trackpoints pour FC min et détails
      const trackPoints: TrackPoint[] = [];
      let minHR: number | undefined;

      if (lap?.Track?.Trackpoint) {
        const points = Array.isArray(lap.Track.Trackpoint)
          ? lap.Track.Trackpoint
          : [lap.Track.Trackpoint];

        for (const point of points) {
          const trackPoint: TrackPoint = {
            time: new Date(point.Time),
            heartRate: point.HeartRateBpm?.Value
              ? parseInt(point.HeartRateBpm.Value)
              : undefined,
            latitude: point.Position?.LatitudeDegrees
              ? parseFloat(point.Position.LatitudeDegrees)
              : undefined,
            longitude: point.Position?.LongitudeDegrees
              ? parseFloat(point.Position.LongitudeDegrees)
              : undefined,
            altitude: point.AltitudeMeters
              ? parseFloat(point.AltitudeMeters)
              : undefined,
          };

          trackPoints.push(trackPoint);

          if (
            trackPoint.heartRate &&
            (!minHR || trackPoint.heartRate < minHR)
          ) {
            minHR = trackPoint.heartRate;
          }
        }
      }

      return {
        id: this.generateUniqueId(
          { startTime, totalTimeSeconds, sport, calories, distanceMeters },
          'temp',
        ),
        startTime,
        totalTimeSeconds,
        sport,
        calories,
        distanceMeters,
        avgHeartRate: avgHeartRate || undefined,
        maxHeartRate: maxHeartRate || undefined,
        minHeartRate: minHR,
        trackPoints: trackPoints.length > 0 ? trackPoints : undefined,
      };
    } catch (error) {
      throw new Error(
        `Erreur lors du parsing TCX: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  private async parseGPX(xmlContent: string): Promise<GarminActivity> {
    try {
      const result = await this.parser.parseStringPromise(xmlContent);
      const track = result.gpx?.trk;

      if (!track) {
        throw new Error('Aucune piste trouvée dans le fichier GPX');
      }

      const startTime = new Date(
        track.time || track.metadata?.time || new Date(),
      );
      const name = track.name || 'Activité GPX';
      const sport = this.detectSportFromName(name);

      let totalTimeSeconds = 0;
      const calories = 0;
      const distanceMeters = 0;
      let avgHeartRate = 0;
      let maxHeartRate = 0;
      let minHeartRate = 0;
      const trackPoints: TrackPoint[] = [];

      if (track.trkseg?.trkpt) {
        const points = Array.isArray(track.trkseg.trkpt)
          ? track.trkseg.trkpt
          : [track.trkseg.trkpt];

        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const time = new Date(point.time || startTime.getTime() + i * 1000);

          const trackPoint: TrackPoint = {
            time,
            heartRate: point.extensions?.['ns3:TrackPointExtension']?.['ns3:hr']
              ? parseInt(point.extensions['ns3:TrackPointExtension']['ns3:hr'])
              : undefined,
            latitude: point.$.lat ? parseFloat(point.$.lat) : undefined,
            longitude: point.$.lon ? parseFloat(point.$.lon) : undefined,
            altitude: point.ele ? parseFloat(point.ele) : undefined,
          };

          trackPoints.push(trackPoint);

          if (trackPoint.heartRate) {
            avgHeartRate += trackPoint.heartRate;
            if (trackPoint.heartRate > maxHeartRate)
              maxHeartRate = trackPoint.heartRate;
            if (minHeartRate === 0 || trackPoint.heartRate < minHeartRate)
              minHeartRate = trackPoint.heartRate;
          }
        }

        if (trackPoints.length > 0) {
          totalTimeSeconds =
            (trackPoints[trackPoints.length - 1].time.getTime() -
              trackPoints[0].time.getTime()) /
            1000;
          avgHeartRate = Math.round(
            avgHeartRate / trackPoints.filter((p) => p.heartRate).length,
          );
        }
      }

      return {
        id: this.generateUniqueId(
          { startTime, totalTimeSeconds, sport, calories, distanceMeters },
          'temp',
        ),
        startTime,
        totalTimeSeconds,
        sport,
        calories,
        distanceMeters,
        avgHeartRate: avgHeartRate || undefined,
        maxHeartRate: maxHeartRate || undefined,
        minHeartRate: minHeartRate || undefined,
        trackPoints: trackPoints.length > 0 ? trackPoints : undefined,
      };
    } catch (error) {
      throw new Error(
        `Erreur lors du parsing GPX: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  private detectSportFromName(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('run') || lowerName.includes('course'))
      return 'course';
    if (
      lowerName.includes('bike') ||
      lowerName.includes('vélo') ||
      lowerName.includes('velo')
    )
      return 'velo';
    if (lowerName.includes('swim') || lowerName.includes('natation'))
      return 'natation';
    if (lowerName.includes('strength') || lowerName.includes('musculation'))
      return 'musculation';
    if (lowerName.includes('yoga')) return 'yoga';
    return 'autre';
  }

  // Convertir une activité Garmin vers notre format Entrainement
  toEntrainement(
    activity: GarminActivity,
    userId: string,
  ): Omit<Entrainement, 'id' | 'created_at'> {
    const result: Omit<Entrainement, 'id' | 'created_at'> = {
      user_id: userId,
      date: Timestamp.fromDate(activity.startTime),
      type:
        activity.sport === 'Running' ||
        activity.sport === 'Cycling' ||
        activity.sport === 'Swimming'
          ? 'cardio'
          : 'musculation',
      duree: Math.round(activity.totalTimeSeconds / 60), // Convertir en minutes
      calories: activity.calories || 0,
      commentaire: `Importé depuis Garmin - ${activity.startTime.toLocaleDateString('fr-FR')}`,
      source: 'garmin',
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (activity.distanceMeters && activity.distanceMeters > 0) {
      result.distance =
        Math.round((activity.distanceMeters / 1000) * 100) / 100; // Convertir en km
    }

    if (activity.avgHeartRate && activity.avgHeartRate > 0) {
      result.fc_moyenne = activity.avgHeartRate;
    }

    if (activity.maxHeartRate && activity.maxHeartRate > 0) {
      result.fc_max = activity.maxHeartRate;
    }

    if (activity.minHeartRate && activity.minHeartRate > 0) {
      result.fc_min = activity.minHeartRate;
    }

    return result;
  }

  /**
   * Génère un identifiant unique basé sur les caractéristiques de l'activité
   * pour détecter les doublons lors d'imports multiples
   */
  private generateUniqueId(
    activity: Partial<GarminActivity>,
    userId: string,
  ): string {
    const components = [
      userId,
      activity.startTime?.toISOString() || '',
      activity.totalTimeSeconds?.toString() || '0',
      activity.sport || 'autre',
      activity.calories?.toString() || '0',
      activity.distanceMeters?.toString() || '0',
    ];

    // Créer un hash simple à partir des composants
    const combined = components.join('|');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir en 32bit integer
    }

    return `garmin_${Math.abs(hash).toString(16)}`;
  }
}

export const garminParser = new GarminParser();
