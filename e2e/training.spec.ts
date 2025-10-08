/**
 * Tests E2E - Training Flow
 * 
 * Parcours critiques testés :
 * - Création d'entraînement manuel
 * - Ajout d'exercices
 * - Calcul des calories
 * - Édition/suppression
 * - Import Garmin (si applicable)
 */

import { test, expect } from '@playwright/test';

// Configuration globale
test.describe('Training Flow', () => {
  // Avant chaque test : se connecter
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies et storage
    await context.clearCookies();
    await context.clearPermissions();
    
    // Aller sur la page d'auth
    await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });
    
    // Attendre que le formulaire soit chargé
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Se connecter avec le compte test
    await page.fill('input[type="email"]', 'test@supernovafit.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Attendre que Firebase Auth se propage
    await page.waitForTimeout(5000);
    await expect(page.url()).toContain('/');
    
    // Aller sur la page entraînements avec la même méthode que les tests auth
    const response = await page.goto('/entrainements', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Vérifier que l'accès est autorisé
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/entrainements');
    expect(page.url()).not.toContain('/auth');
    
    await page.waitForTimeout(2000);
    
    // Attendre que le FAB soit visible
    await page.waitForSelector('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]', { timeout: 10000 });
  });

  test('should open training form modal', async ({ page }) => {
    // Cliquer sur le FAB (Floating Action Button) d'ajout d'entraînement
    // Le FAB est toujours visible en bas à droite
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    
    // Vérifier que le modal s'ouvre
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText(/entraînement/i);
  });

  test('should fill manual training form', async ({ page }) => {
    // Ouvrir le modal
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Remplir le formulaire
    await page.selectOption('select[name="type"]', 'cardio');
    await page.fill('input[name="duree"]', '30');
    await page.fill('input[name="commentaire"]', 'Course matinale');
    
    // Vérifier que les champs sont remplis
    await expect(page.locator('select[name="type"]')).toHaveValue('cardio');
    await expect(page.locator('input[name="duree"]')).toHaveValue('30');
    await expect(page.locator('input[name="commentaire"]')).toHaveValue('Course matinale');
  });

  test('should calculate calories automatically', async ({ page }) => {
    // Ouvrir le modal
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Remplir le formulaire
    await page.selectOption('select[name="type"]', 'cardio');
    await page.fill('input[name="duree"]', '60'); // 1 heure
    
    // Attendre que les calories soient calculées
    await page.waitForTimeout(2000);
    
    // Vérifier que les calories sont calculées (approximativement)
    const caloriesInput = page.locator('input[name="calories"]');
    await expect(caloriesInput).not.toHaveValue('0');
    await expect(caloriesInput).not.toHaveValue('');
  });

  test('should save training session', async ({ page }) => {
    // Ouvrir le modal
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Remplir le formulaire
    await page.selectOption('select[name="type"]', 'musculation');
    await page.fill('input[name="duree"]', '45');
    await page.fill('input[name="commentaire"]', 'Séance dos');
    
    // Sauvegarder
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    
    // Attendre la fermeture du modal
    await page.waitForTimeout(2000);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Vérifier qu'un message de succès apparaît
    await expect(page.locator('text=/succès|sauvegardé|ajouté/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display training in list', async ({ page }) => {
    // Créer un entraînement
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    await page.selectOption('select[name="type"]', 'cardio');
    await page.fill('input[name="duree"]', '30');
    await page.fill('input[name="commentaire"]', 'Test E2E');
    
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    
    // Vérifier que l'entraînement apparaît dans la liste
    await expect(page.locator('text=Test E2E')).toBeVisible();
    await expect(page.locator('text=30 min')).toBeVisible();
  });

  test('should edit existing training', async ({ page }) => {
    // Créer un entraînement d'abord
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    await page.selectOption('select[name="type"]', 'cardio');
    await page.fill('input[name="duree"]', '30');
    await page.fill('input[name="commentaire"]', 'Entraînement original');
    
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    
    // Cliquer sur l'entraînement pour l'éditer
    const trainingCard = page.locator('text=Entraînement original').first();
    await trainingCard.click();
    await page.waitForTimeout(1000);
    
    // Vérifier que le modal d'édition s'ouvre
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Modifier le commentaire
    await page.fill('input[name="commentaire"]', 'Entraînement modifié');
    
    // Sauvegarder
    const updateButton = page.locator('button[type="submit"]').first();
    await updateButton.click();
    await page.waitForTimeout(2000);
    
    // Vérifier que la modification est visible
    await expect(page.locator('text=Entraînement modifié')).toBeVisible();
  });

  test('should delete training', async ({ page }) => {
    // Créer un entraînement d'abord
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    await page.selectOption('select[name="type"]', 'cardio');
    await page.fill('input[name="duree"]', '30');
    await page.fill('input[name="commentaire"]', 'À supprimer');
    
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    
    // Cliquer sur l'entraînement pour l'ouvrir
    const trainingCard = page.locator('text=À supprimer').first();
    await trainingCard.click();
    await page.waitForTimeout(1000);
    
    // Cliquer sur le bouton supprimer
    const deleteButton = page.locator('button[title*="Supprimer"]').first();
    await deleteButton.click();
    
    // Confirmer la suppression
    await page.click('button:has-text("Confirmer")');
    await page.waitForTimeout(2000);
    
    // Vérifier que l'entraînement a disparu
    await expect(page.locator('text=À supprimer')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Ouvrir le modal
    const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
    await expect(addButton).toBeVisible({ timeout: 15000 });
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Essayer de sauvegarder sans remplir les champs requis
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();
    
    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator('text=/requis|obligatoire|erreur/i')).toBeVisible({ timeout: 5000 });
  });

  test('should handle different training types', async ({ page }) => {
    const trainingTypes = ['cardio', 'musculation', 'yoga', 'natation', 'vélo'];
    
    for (const type of trainingTypes) {
      // Ouvrir le modal
      const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
      await expect(addButton).toBeVisible({ timeout: 15000 });
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Sélectionner le type
      await page.selectOption('select[name="type"]', type);
      await page.fill('input[name="duree"]', '30');
      await page.fill('input[name="commentaire"]', `Test ${type}`);
      
      // Sauvegarder
      const saveButton = page.locator('button[type="submit"]').first();
      await saveButton.click();
      await page.waitForTimeout(2000);
      
      // Vérifier que l'entraînement est créé
      await expect(page.locator(`text=Test ${type}`)).toBeVisible();
    }
  });

  test('should display weekly stats', async ({ page }) => {
    // Créer quelques entraînements
    for (let i = 0; i < 3; i++) {
      const addButton = page.locator('button[title="Ajouter un nouvel entraînement (raccourci: Ctrl+N)"]');
      await expect(addButton).toBeVisible({ timeout: 15000 });
      await addButton.click();
      await page.waitForTimeout(1000);
      
      await page.selectOption('select[name="type"]', 'cardio');
      await page.fill('input[name="duree"]', '30');
      await page.fill('input[name="commentaire"]', `Entraînement ${i + 1}`);
      
      const saveButton = page.locator('button[type="submit"]').first();
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Vérifier que les statistiques hebdomadaires sont mises à jour
    await expect(page.locator('text=/semaine|sessions|durée/i')).toBeVisible();
  });
});
