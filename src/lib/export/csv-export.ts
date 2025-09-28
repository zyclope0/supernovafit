/**
 * Utilitaires d'export CSV pour SuperNovaFit
 * Gère la génération et le téléchargement de fichiers CSV
 */

import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  ExportConfig,
  ExportMetadata,
  ExportPeriod,
} from '@/types/export';
import type { Repas, Entrainement, Mesure } from '@/types';

/**
 * Génère les métadonnées d'export
 */

/**
 * Génère un nom de fichier pour l'export
 */
export function generateFileName(
  config: ExportConfig,
  metadata: ExportMetadata,
): string {
  const dataTypeLabel = getDataTypeLabel(config.dataType);
  const periodLabel = getPeriodLabel(config.period);
  const timestamp = format(new Date(metadata.exportedAt), 'yyyy-MM-dd_HH-mm', {
    locale: fr,
  });

  return `SuperNovaFit_${dataTypeLabel}_${periodLabel}_${timestamp}`;
}

/**
 * Obtient le label pour le type de données
 */
function getDataTypeLabel(dataType: string): string {
  switch (dataType) {
    case 'repas':
      return 'Repas';
    case 'entrainements':
      return 'Entrainements';
    case 'mesures':
      return 'Mesures';
    case 'all':
      return 'ToutesDonnees';
    default:
      return 'Donnees';
  }
}

/**
 * Obtient le label pour la période
 */
function getPeriodLabel(period: ExportPeriod): string {
  switch (period) {
    case 'day':
      return 'Aujourdhui';
    case 'week':
      return 'CetteSemaine';
    case 'month':
      return 'CeMois';
    case 'custom':
      return 'Personnalise';
    default:
      return 'Periode';
  }
}

/**
 * Obtient la description de la période
 */
export function getPeriodDescription(
  period: ExportPeriod,
  startDate?: string,
  endDate?: string,
): string {
  switch (period) {
    case 'day':
      return "Aujourd'hui";
    case 'week':
      return 'Cette semaine';
    case 'month':
      return 'Ce mois';
    case 'custom':
      if (startDate && endDate) {
        return `Du ${format(new Date(startDate), 'dd/MM/yyyy', { locale: fr })} au ${format(new Date(endDate), 'dd/MM/yyyy', { locale: fr })}`;
      }
      return 'Période personnalisée';
    default:
      return 'Période non spécifiée';
  }
}

/**
 * Formate les données de repas pour export CSV
 */
function formatRepasForCSV(repas: Repas[]): Record<string, unknown>[] {
  return repas.map((r) => ({
    Date: format(new Date(r.date), 'dd/MM/yyyy', { locale: fr }),
    Repas: r.repas,
    Aliments: r.aliments.map((a: { nom: string }) => a.nom).join(', '),
    Calories: r.macros.kcal,
    Protéines: r.macros.prot,
    Glucides: r.macros.glucides,
    Lipides: r.macros.lipides,
    Commentaire: '',
  }));
}

/**
 * Formate les données d'entraînements pour export CSV
 */
function formatEntrainementsForCSV(
  entrainements: Entrainement[],
): Record<string, unknown>[] {
  return entrainements.map((e) => ({
    Date: format(new Date(e.date), 'dd/MM/yyyy', { locale: fr }),
    Type: e.type,
    Durée: `${e.duree} minutes`,
    Calories: e.calories || 0,
    Commentaire: e.commentaire || '',
    Exercices: '',
  }));
}

/**
 * Formate les données de mesures pour export CSV
 */
function formatMesuresForCSV(mesures: Mesure[]): Record<string, unknown>[] {
  return mesures.map((m) => ({
    Date: format(new Date(m.date), 'dd/MM/yyyy', { locale: fr }),
    Poids: `${m.poids} kg`,
    Taille: `${m.taille} cm`,
    IMC: m.imc?.toFixed(2) || '0.00',
    'Masse grasse': `${m.masse_grasse}%`,
    'Masse musculaire': `${m.masse_musculaire} kg`,
    Commentaire: m.commentaire || '',
  }));
}

/**
 * Génère et télécharge un fichier CSV
 */
export async function generateAndDownloadCSV(
  data: { repas: Repas[]; entrainements: Entrainement[]; mesures: Mesure[] },
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string,
): Promise<void> {
  try {
    let csvData: Record<string, unknown>[];

    switch (config.dataType) {
      case 'repas':
        csvData = formatRepasForCSV(data.repas);
        break;
      case 'entrainements':
        csvData = formatEntrainementsForCSV(data.entrainements);
        break;
      case 'mesures':
        csvData = formatMesuresForCSV(data.mesures);
        break;
      case 'all':
        // Combiner toutes les données
        csvData = formatAllDataForCSV(
          data.repas,
          data.entrainements,
          data.mesures,
        );
        break;
      default:
        throw new Error(`Type de données non supporté: ${config.dataType}`);
    }

    // Convertir en CSV avec Papa Parse
    const csv = Papa.unparse({
      fields: Object.keys(csvData[0] || {}), // Dynamically get headers from the first row
      data: csvData,
    });

    // Ajouter les métadonnées en commentaires
    const metadataComments = [
      `# SuperNovaFit Export - ${metadata.version}`,
      `# Période: ${metadata.period}`,
      `# Généré le: ${format(new Date(metadata.exportedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
      `# Total enregistrements: ${metadata.totalRecords}`,
      '',
    ].join('\n');

    const finalCsv = metadataComments + csv;

    // Créer le blob et télécharger
    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  } catch (error) {
    console.error('Erreur lors de la génération CSV:', error);
    throw new Error('Erreur lors de la génération du fichier CSV');
  }
}

/**
 * Applique des filtres aux données
 */

function formatAllDataForCSV(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
): Record<string, unknown>[] {
  const allData: Record<string, unknown>[] = [];

  // Ajouter les repas
  repas.forEach((r) => {
    allData.push({
      Type: 'Repas',
      Date: format(new Date(r.date), 'dd/MM/yyyy', { locale: fr }),
      Détail: r.repas,
      Calories: r.macros.kcal,
      Protéines: r.macros.prot,
      Glucides: r.macros.glucides,
      Lipides: r.macros.lipides,
      Commentaire: '',
    });
  });

  // Ajouter les entraînements
  entrainements.forEach((e) => {
    allData.push({
      Type: 'Entraînement',
      Date: format(new Date(e.date), 'dd/MM/yyyy', { locale: fr }),
      Détail: e.type,
      Durée: `${e.duree} minutes`,
      Calories: e.calories || 0,
      Commentaire: e.commentaire || '',
    });
  });

  // Ajouter les mesures
  mesures.forEach((m) => {
    allData.push({
      Type: 'Mesure',
      Date: format(new Date(m.date), 'dd/MM/yyyy', { locale: fr }),
      Détail: 'Mesures corporelles',
      Poids: `${m.poids} kg`,
      IMC: m.imc?.toFixed(2) || '0.00',
      'Masse grasse': `${m.masse_grasse}%`,
      Commentaire: m.commentaire || '',
    });
  });

  return allData.sort((a, b) => {
    const dateA = new Date(a.Date as string).getTime();
    const dateB = new Date(b.Date as string).getTime();
    return dateB - dateA;
  });
}
