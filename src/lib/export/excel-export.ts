/**
 * Utilitaires d'export Excel pour SuperNovaFit
 * Gère la génération et le téléchargement de fichiers Excel avec formatage professionnel
 * Migré de xlsx vers exceljs pour résoudre les vulnérabilités de sécurité
 */

import { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ExportConfig, ExportMetadata } from '@/types/export';
import type { Repas, Entrainement, Mesure } from '@/types';
import {
  generateWeightChartData,
  generateCaloriesChartData,
  generateMacrosChartData,
  calculateChartStatistics,
} from './chart-utils';

/**
 * Styles Excel personnalisés pour exceljs
 */
const EXCEL_STYLES = {
  header: {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  },
  subHeader: {
    font: { bold: true, color: { argb: 'FF2C3E50' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECF0F1' } },
    alignment: { horizontal: 'center' },
    border: {
      bottom: { style: 'thin' },
    },
  },
  data: {
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  },
  highlight: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FD' } },
  },
  success: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F4E6' } },
  },
  warning: {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9E7' } },
  },
} as const;

/**
 * Génère et télécharge un fichier Excel avec formatage avancé
 */
export async function generateAndDownloadExcel(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string,
): Promise<void> {
  try {
    const workbook = new Workbook();

    // Métadonnées du workbook
    workbook.creator = 'SuperNovaFit';
    workbook.lastModifiedBy = 'SuperNovaFit';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Feuille de résumé
    addSummarySheet(workbook, repas, entrainements, mesures, metadata);

    // Feuilles de données selon la configuration
    if (config.dataType === 'repas' || config.dataType === 'all') {
      addRepasSheet(workbook, repas);
    }

    if (config.dataType === 'entrainements' || config.dataType === 'all') {
      addEntrainementsSheet(workbook, entrainements);
    }

    if (config.dataType === 'mesures' || config.dataType === 'all') {
      addMesuresSheet(workbook, mesures);
    }

    // Feuille de graphiques
    if (config.includeCharts) {
      addChartsSheet(workbook, repas, entrainements, mesures);
    }

    // Feuille de statistiques
    addStatisticsSheet(workbook, repas, entrainements, mesures);

    // Générer et télécharger le fichier
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Erreur lors de la génération Excel:', error);
    throw new Error('Impossible de générer le fichier Excel');
  }
}

/**
 * Ajoute une feuille de résumé
 */
function addSummarySheet(
  workbook: Workbook,
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  metadata: ExportMetadata,
): void {
  const stats = calculateChartStatistics(repas, entrainements, mesures);
  const worksheet = workbook.addWorksheet('Résumé');

  // Configuration des colonnes
  worksheet.columns = [
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
  ];

  // Données du résumé
  const summaryData = [
    ['RAPPORT SUPERNOVA FIT', '', '', ''],
    ['', '', '', ''],
    ['Métadonnées', '', '', ''],
    ['Période', metadata.period, '', ''],
    [
      'Généré le',
      format(new Date(metadata.exportedAt), 'dd/MM/yyyy à HH:mm', {
        locale: fr,
      }),
      '',
      '',
    ],
    ['Version', metadata.version, '', ''],
    ['', '', '', ''],
    ['Statistiques Générales', '', '', ''],
    ['Total repas', repas.length, '', ''],
    ['Calories totales', `${stats.totalCalories.toFixed(0)} kcal`, '', ''],
    [
      'Calories moyennes/jour',
      `${stats.avgCaloriesPerDay.toFixed(0)} kcal`,
      '',
      '',
    ],
    ['Total entraînements', entrainements.length, '', ''],
    ["Temps total d'entraînement", `${stats.totalWorkoutTime} min`, '', ''],
    [
      'Durée moyenne/séance',
      `${stats.avgWorkoutDuration.toFixed(0)} min`,
      '',
      '',
    ],
    ['Total mesures', mesures.length, '', ''],
    ['', '', '', ''],
    ['Évolution', '', '', ''],
    [
      'Évolution poids',
      `${stats.weightEvolution > 0 ? '+' : ''}${stats.weightEvolution.toFixed(1)} kg`,
      '',
      '',
    ],
    [
      'Évolution IMC',
      `${stats.imcEvolution > 0 ? '+' : ''}${stats.imcEvolution.toFixed(2)}`,
      '',
      '',
    ],
  ];

  // Ajout des données
  summaryData.forEach((row) => {
    worksheet.addRow(row);
  });

  // Application des styles
  applyStylesToWorksheet(worksheet, summaryData.length);

  // Fusion des cellules pour les titres
  worksheet.mergeCells('A1:D1'); // Titre principal
  worksheet.mergeCells('A3:D3'); // Métadonnées
  worksheet.mergeCells('A8:D8'); // Statistiques générales
  worksheet.mergeCells('A17:D17'); // Évolution
}

/**
 * Ajoute une feuille pour les repas
 */
function addRepasSheet(workbook: Workbook, repas: Repas[]): void {
  const worksheet = workbook.addWorksheet('Repas');

  // Configuration des colonnes
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Type de repas', key: 'type', width: 20 },
    { header: 'Aliments', key: 'aliments', width: 40 },
    { header: 'Calories (kcal)', key: 'calories', width: 15 },
    { header: 'Protéines (g)', key: 'proteines', width: 15 },
    { header: 'Glucides (g)', key: 'glucides', width: 15 },
    { header: 'Lipides (g)', key: 'lipides', width: 15 },
  ];

  // Ajout des données
  repas.forEach((r) => {
    worksheet.addRow({
      date: format(new Date(r.date), 'dd/MM/yyyy', { locale: fr }),
      type: r.repas,
      aliments: r.aliments
        .map((a) => `${a.nom} (${a.quantite}${a.unite})`)
        .join(', '),
      calories: r.macros.kcal,
      proteines: r.macros.prot,
      glucides: r.macros.glucides,
      lipides: r.macros.lipides,
    });
  });

  // Application des styles
  applyStylesToWorksheet(worksheet, repas.length + 1);

  // Ajout des formules de calcul
  addFormulasToWorksheet(worksheet, repas.length + 1, 'repas');
}

/**
 * Ajoute une feuille pour les entraînements
 */
function addEntrainementsSheet(
  workbook: Workbook,
  entrainements: Entrainement[],
): void {
  const worksheet = workbook.addWorksheet('Entraînements');

  // Configuration des colonnes
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Durée (min)', key: 'duree', width: 15 },
    { header: 'Calories (kcal)', key: 'calories', width: 15 },
    { header: 'Distance (km)', key: 'distance', width: 15 },
    { header: 'FC moyenne (bpm)', key: 'fc', width: 18 },
    { header: 'Commentaire', key: 'commentaire', width: 30 },
  ];

  // Ajout des données
  entrainements.forEach((e) => {
    worksheet.addRow({
      date: format(new Date(e.date), 'dd/MM/yyyy', { locale: fr }),
      type: e.type,
      duree: e.duree,
      calories: e.calories || 0,
      distance: e.distance || 0,
      fc: e.fc_moyenne || 0,
      commentaire: e.commentaire || '',
    });
  });

  // Application des styles
  applyStylesToWorksheet(worksheet, entrainements.length + 1);

  // Ajout des formules de calcul
  addFormulasToWorksheet(worksheet, entrainements.length + 1, 'entrainements');
}

/**
 * Ajoute une feuille pour les mesures
 */
function addMesuresSheet(workbook: Workbook, mesures: Mesure[]): void {
  const worksheet = workbook.addWorksheet('Mesures');

  // Configuration des colonnes
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Poids (kg)', key: 'poids', width: 12 },
    { header: 'IMC', key: 'imc', width: 10 },
    { header: 'Masse grasse (%)', key: 'masse_grasse', width: 18 },
    { header: 'Masse musculaire (kg)', key: 'masse_musculaire', width: 22 },
    { header: 'Tour taille (cm)', key: 'tour_taille', width: 18 },
    { header: 'Tour bras (cm)', key: 'tour_bras', width: 16 },
  ];

  // Ajout des données
  mesures.forEach((m) => {
    worksheet.addRow({
      date: format(new Date(m.date), 'dd/MM/yyyy', { locale: fr }),
      poids: m.poids || 0,
      imc: m.imc || 0,
      masse_grasse: m.masse_grasse || 0,
      masse_musculaire: m.masse_musculaire || 0,
      tour_taille: m.tour_taille || 0,
      tour_bras: m.tour_bras || 0,
    });
  });

  // Application des styles
  applyStylesToWorksheet(worksheet, mesures.length + 1);

  // Ajout des formules de calcul
  addFormulasToWorksheet(worksheet, mesures.length + 1, 'mesures');
}

/**
 * Ajoute une feuille de graphiques (données pour graphiques Excel)
 */
function addChartsSheet(
  workbook: Workbook,
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
): void {
  const worksheet = workbook.addWorksheet('Graphiques');

  let currentRow = 1;

  // Données pour graphique d'évolution du poids
  if (mesures.length >= 2) {
    const weightData = generateWeightChartData(mesures);

    worksheet.getCell(`A${currentRow}`).value = 'Évolution du poids';
    worksheet.getCell(`A${currentRow}`).style = EXCEL_STYLES.header;
    currentRow += 2;

    worksheet.getCell(`A${currentRow}`).value = 'Date';
    worksheet.getCell(`B${currentRow}`).value = 'Poids (kg)';
    worksheet.getRow(currentRow).eachCell((cell) => {
      cell.style = EXCEL_STYLES.subHeader;
    });
    currentRow++;

    weightData.labels.forEach((label, index) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value =
        weightData.datasets[0].data[index];
      currentRow++;
    });
    currentRow += 2;
  }

  // Données pour graphique des calories
  if (repas.length > 0) {
    const caloriesData = generateCaloriesChartData(repas);

    worksheet.getCell(`A${currentRow}`).value = 'Calories par jour';
    worksheet.getCell(`A${currentRow}`).style = EXCEL_STYLES.header;
    currentRow += 2;

    worksheet.getCell(`A${currentRow}`).value = 'Date';
    worksheet.getCell(`B${currentRow}`).value = 'Calories (kcal)';
    worksheet.getRow(currentRow).eachCell((cell) => {
      cell.style = EXCEL_STYLES.subHeader;
    });
    currentRow++;

    caloriesData.labels.forEach((label, index) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value =
        caloriesData.datasets[0].data[index];
      currentRow++;
    });
    currentRow += 2;
  }

  // Données pour graphique des macronutriments
  if (repas.length > 0) {
    const macrosData = generateMacrosChartData(repas);

    worksheet.getCell(`A${currentRow}`).value = 'Répartition macronutriments';
    worksheet.getCell(`A${currentRow}`).style = EXCEL_STYLES.header;
    currentRow += 2;

    worksheet.getCell(`A${currentRow}`).value = 'Type';
    worksheet.getCell(`B${currentRow}`).value = 'Valeur (g)';
    worksheet.getRow(currentRow).eachCell((cell) => {
      cell.style = EXCEL_STYLES.subHeader;
    });
    currentRow++;

    macrosData.labels.forEach((label, index) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`B${currentRow}`).value =
        macrosData.datasets[0].data[index];
      currentRow++;
    });
  }

  // Configuration des colonnes
  worksheet.columns = [{ width: 25 }, { width: 20 }];
}

/**
 * Ajoute une feuille de statistiques avancées
 */
function addStatisticsSheet(
  workbook: Workbook,
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
): void {
  const stats = calculateChartStatistics(repas, entrainements, mesures);
  const worksheet = workbook.addWorksheet('Statistiques');

  // Configuration des colonnes
  worksheet.columns = [
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
  ];

  const statisticsData = [
    ['Statistiques Avancées', '', '', ''],
    ['', '', '', ''],
    ['Nutrition', '', '', ''],
    ['Calories totales', stats.totalCalories, 'kcal', ''],
    ['Calories moyennes/jour', stats.avgCaloriesPerDay, 'kcal', ''],
    ['Nombre de repas', repas.length, '', ''],
    ['', '', '', ''],
    ['Entraînement', '', '', ''],
    ['Temps total', stats.totalWorkoutTime, 'min', ''],
    ['Durée moyenne/séance', stats.avgWorkoutDuration, 'min', ''],
    ['Nombre de séances', entrainements.length, '', ''],
    ['', '', '', ''],
    ['Progression', '', '', ''],
    ['Évolution poids', stats.weightEvolution, 'kg', ''],
    ['Évolution IMC', stats.imcEvolution, '', ''],
  ];

  // Ajout des données
  statisticsData.forEach((row) => {
    worksheet.addRow(row);
  });

  // Application des styles
  applyStylesToWorksheet(worksheet, statisticsData.length);

  // Fusion des cellules pour les titres
  worksheet.mergeCells('A1:D1'); // Titre principal
  worksheet.mergeCells('A3:D3'); // Nutrition
  worksheet.mergeCells('A8:D8'); // Entraînement
  worksheet.mergeCells('A13:D13'); // Progression
}

/**
 * Applique les styles à une feuille Excel
 */
function applyStylesToWorksheet(worksheet: Worksheet, rows: number): void {
  // Style pour la ligne d'en-tête
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.style = EXCEL_STYLES.header;
  });

  // Styles pour les données
  for (let row = 2; row <= rows; row++) {
    const dataRow = worksheet.getRow(row);
    dataRow.eachCell((cell) => {
      cell.style = EXCEL_STYLES.data;
    });
  }
}

/**
 * Ajoute des formules de calcul à une feuille
 */
function addFormulasToWorksheet(
  worksheet: Worksheet,
  rows: number,
  type: string,
): void {
  const lastRow = rows + 2;

  // Formules selon le type de données
  switch (type) {
    case 'repas':
      // Total calories
      worksheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${rows})` };
      worksheet.getCell(`D${lastRow}`).style = EXCEL_STYLES.highlight;
      worksheet.getCell(`A${lastRow}`).value = 'TOTAL';

      // Moyenne calories
      worksheet.getCell(`D${lastRow + 1}`).value = {
        formula: `AVERAGE(D2:D${rows})`,
      };
      worksheet.getCell(`D${lastRow + 1}`).style = EXCEL_STYLES.highlight;
      worksheet.getCell(`A${lastRow + 1}`).value = 'MOYENNE';
      break;

    case 'entrainements':
      // Total durée
      worksheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${rows})` };
      worksheet.getCell(`C${lastRow}`).style = EXCEL_STYLES.highlight;
      worksheet.getCell(`A${lastRow}`).value = 'TOTAL';

      // Moyenne durée
      worksheet.getCell(`C${lastRow + 1}`).value = {
        formula: `AVERAGE(C2:C${rows})`,
      };
      worksheet.getCell(`C${lastRow + 1}`).style = EXCEL_STYLES.highlight;
      worksheet.getCell(`A${lastRow + 1}`).value = 'MOYENNE';
      break;

    case 'mesures':
      // Dernier poids
      worksheet.getCell(`B${lastRow}`).value = { formula: `B${rows}` };
      worksheet.getCell(`B${lastRow}`).style = EXCEL_STYLES.highlight;
      worksheet.getCell(`A${lastRow}`).value = 'DERNIER';
      break;
  }
}

/**
 * Génère et télécharge un fichier Excel multi-feuilles
 */
