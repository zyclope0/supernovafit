import { test, expect } from '@playwright/test';

// Configuration globale pour les tests de repas
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@supernovafit.com',
  password: process.env.TEST_USER_PASSWORD || 'Test123!',
};

test.describe('Meal Tracking Flow', () => {
  // Avant chaque test : se connecter
  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('/auth');

    // Attendre que les éléments du formulaire soient chargés (CSR bailout)

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // 2. Attendre la connexion et naviguer vers /diete
    await page.waitForTimeout(3000);
    await page.goto('/diete', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('should open meal form modal', async ({ page }) => {
    // Attendre que le FAB soit visible (plus simple que networkidle)
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await expect(fab).toBeVisible({ timeout: 15000 });
    await fab.click();
    
    // Le FAB affiche d'abord un sous-menu de types de repas
    await page.waitForTimeout(500); // Animation
    
    // Vérifier que le sous-menu est visible avec les 6 types
    // Le sous-menu contient des boutons avec emoji et texte
    const breakfastButton = page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first();
    await expect(breakfastButton).toBeVisible({ timeout: 5000 });
    
    // Cliquer sur Petit-déjeuner pour ouvrir le formulaire
    await breakfastButton.click();
    
    // Attendre que le formulaire DietForm s'ouvre
    await page.waitForTimeout(1000); // Animation modale
    
    // Vérifier que le formulaire DietForm est ouvert
    // C'est une div avec role="dialog", pas une vraie balise <dialog>
    await expect(page.locator('[role="dialog"] h1:has-text("Ajouter Petit-déjeuner")')).toBeVisible({ timeout: 5000 });
    
    // Vérifier les tabs du formulaire
    await expect(page.locator('[role="dialog"] button:has-text("Recherche")')).toBeVisible();
    await expect(page.locator('[role="dialog"] button:has-text("Favoris")')).toBeVisible();
    await expect(page.locator('[role="dialog"] button:has-text("Mon Repas")')).toBeVisible();
  });

  test('should search food in OpenFoodFacts', async ({ page }) => {
    // Ouvrir le FAB puis sélectionner un type de repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    
    // Sélectionner Petit-déjeuner
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);

    // L'onglet recherche devrait être actif par défaut
    const searchInput = page.locator('input[placeholder*="Rechercher"], combobox[aria-label*="Rechercher"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    // Rechercher un aliment
    await searchInput.fill('pomme');
    await searchInput.press('Enter');

    // Attendre les résultats de l'API OpenFoodFacts
    await page.waitForTimeout(2000);

    // Vérifier qu'il y a des résultats (divs avec les infos nutritionnelles)
    const firstResult = page.locator('div').filter({ hasText: /kcal/ }).first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });
  });

  test('should add food to meal', async ({ page }) => {
    // Ouvrir le FAB puis sélectionner un type de repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);
    
    // Rechercher un aliment
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('banane');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Cliquer sur le premier résultat
    const firstResult = page.locator('[data-testid="food-result"]').first();
    await firstResult.click();
    
    // Aller sur l'onglet résumé pour voir l'aliment ajouté
    await page.locator('button:has-text("Résumé")').click();
    
    // Vérifier que l'aliment est dans la liste
    await expect(page.locator('text=/banane/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should save complete meal', async ({ page }) => {
    // Ouvrir le FAB puis sélectionner un type de repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);
    
    // Le type de repas est déjà sélectionné (Petit-déjeuner)
    
    // Rechercher et ajouter un aliment
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('pain');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Ajouter le premier résultat
    await page.locator('[data-testid="food-result"]').first().click();
    
    // Sauvegarder le repas
    const saveButton = page.locator('button:has-text("Enregistrer")');
    await saveButton.click();
    
    // Attendre la fermeture du modal et le rechargement
    await page.waitForTimeout(2000);
    
    // Vérifier que le repas apparaît dans la liste
    await expect(page.locator('text="Petit-déjeuner"').first()).toBeVisible({ timeout: 10000 });
  });

  test('should calculate macros correctly', async ({ page }) => {
    // Ouvrir le FAB puis sélectionner un type de repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);
    
    // Le type de repas est déjà sélectionné (Petit-déjeuner)
    
    // Ajouter un aliment
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('yaourt');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    await page.locator('[data-testid="food-result"]').first().click();
    
    // Aller sur résumé pour voir les macros
    await page.locator('button:has-text("Résumé")').click();
    
    // Vérifier que les macros sont affichés
    await expect(page.locator('text=/Protéines.*g/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Glucides.*g/i')).toBeVisible();
    await expect(page.locator('text=/Lipides.*g/i')).toBeVisible();
  });

  test('should edit existing meal', async ({ page }) => {
    // Note: Ce test suppose qu'un repas existe déjà
    // Pour les tests isolés, on skip ce test
    test.skip();
    
    // Cliquer sur le repas pour l'éditer
    const mealCard = page.locator('text="Petit-déjeuner"').first();
    await mealCard.click();
    
    // Attendre le modal de détails
    await page.waitForTimeout(500);
    
    // Cliquer sur éditer
    const editButton = page.locator('button:has-text("Modifier")');
    await editButton.click();
    
    // Ajouter un nouvel aliment
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('café');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    await page.locator('[data-testid="food-result"]').first().click();
    
    // Sauvegarder les modifications
    await page.locator('button:has-text("Enregistrer")').click();
    
    // Vérifier que le repas a été mis à jour
    await page.waitForTimeout(2000);
    await expect(page.locator('text="Petit-déjeuner"')).toBeVisible();
  });

  test('should delete meal', async ({ page }) => {
    // Note: Ce test suppose qu'un repas existe déjà
    // Pour les tests isolés, on skip ce test  
    test.skip();
    
    // Cliquer sur le repas
    const mealCard = page.locator('text="Petit-déjeuner"').first();
    await mealCard.click();
    
    // Attendre le modal
    await page.waitForTimeout(500);
    
    // Cliquer sur supprimer
    const deleteButton = page.locator('button:has-text("Supprimer")');
    await deleteButton.click();
    
    // Confirmer la suppression (si demandé)
    const confirmButton = page.locator('button:has-text("Confirmer")');
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    
    // Vérifier que le repas n'est plus visible
    await page.waitForTimeout(2000);
    await expect(page.locator('text="Petit-déjeuner"')).not.toBeVisible();
  });

  test('should add food to favorites', async ({ page }) => {
    // Ouvrir le FAB puis sélectionner un type de repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);
    
    // Rechercher un aliment
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('chocolat');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Ajouter aux favoris (icône étoile ou cœur)
    const favoriteButton = page.locator('[data-testid="food-result"]').first()
      .locator('button[aria-label*="favori"]');
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      
      // Vérifier que l'aliment est dans les favoris
      await page.locator('button:has-text("Favoris")').click();
      await expect(page.locator('text=/chocolat/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display daily macros total', async ({ page }) => {
    // Vérifier que le header affiche les totaux
    const headerMacros = page.locator('[data-testid="daily-macros"]');
    
    if (await headerMacros.isVisible({ timeout: 5000 })) {
      // Vérifier les éléments de macros
      await expect(page.locator('text=/Calories.*kcal/i')).toBeVisible();
      await expect(page.locator('text=/Protéines.*g/i')).toBeVisible();
      await expect(page.locator('text=/Glucides.*g/i')).toBeVisible();
      await expect(page.locator('text=/Lipides.*g/i')).toBeVisible();
    }
  });

  test('should handle all 6 meal types', async ({ page }) => {
    const mealTypes = [
      { value: 'petit_dej', label: 'Petit-déjeuner' },
      { value: 'collation_matin', label: 'Collation matin' },
      { value: 'dejeuner', label: 'Déjeuner' },
      { value: 'collation_apres_midi', label: 'Collation après-midi' },
      { value: 'diner', label: 'Dîner' },
      { value: 'collation_soir', label: 'Collation soir' },
    ];
    
    for (const mealType of mealTypes) {
      // Ouvrir le FAB
      const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
      await fab.click();
      await page.waitForTimeout(500);
      
      // Cliquer sur le type de repas correspondant
      const mealButton = page.locator('button').filter({ hasText: mealType.label });
      await expect(mealButton.first()).toBeVisible({ timeout: 5000 });
      await mealButton.first().click();
      
      // Vérifier que le modal s'ouvre avec le bon titre
      await expect(page.locator('[role="dialog"] h1').filter({ hasText: mealType.label })).toBeVisible({ timeout: 5000 });
      
      // Fermer le modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });
});

// Tests de validation et edge cases
test.describe('Meal Tracking - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth');

    // Attendre que les éléments du formulaire soient chargés (CSR bailout)

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.goto('/diete', { waitUntil: 'domcontentloaded' });
  });

  test('should handle empty meal submission', async ({ page }) => {
    // Ouvrir le FAB puis sélectionner un type de repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);
    
    // Essayer de sauvegarder sans aliments
    const saveButton = page.locator('button:has-text("Enregistrer")');
    await saveButton.click();
    
    // Vérifier qu'il y a un message d'erreur
    await expect(page.locator('text=/ajout.*aliment/i')).toBeVisible({ timeout: 5000 });
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Simuler une erreur réseau
    await page.route('**/api/**', route => route.abort());
    
    // Essayer d'ajouter un repas
    const fab = page.locator('button[title="Ajouter un repas (raccourci: Ctrl+N)"]');
    await fab.click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '🌅' }).filter({ hasText: 'Petit-déjeuner' }).first().click();
    await page.waitForTimeout(1000);
    
    // Rechercher un aliment
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('test');
    await searchInput.press('Enter');
    
    // Vérifier qu'il y a un message d'erreur approprié
    await expect(page.locator('text=/erreur|problème/i')).toBeVisible({ timeout: 10000 });
  });
});
