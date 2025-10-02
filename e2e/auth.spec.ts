/**
 * Tests E2E - Authentication Flow
 * 
 * Parcours critiques testés :
 * - Login avec credentials valides
 * - Login avec credentials invalides
 * - Logout
 * - Redirection après login
 * - Protection des routes authentifiées
 */

import { test, expect } from '@playwright/test';

// Configuration globale
test.describe('Authentication Flow', () => {
  // Avant chaque test : s'assurer qu'on est déconnecté
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies et storage
    await context.clearCookies();
    await page.goto('/');
  });

  test('should redirect to /auth when not authenticated', async ({ page }) => {
    // Tentative d'accès à une page protégée
    await page.goto('/dashboard');
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/);
    
    // Le formulaire de login doit être visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    // Remplir avec credentials invalides
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Attendre le message d'erreur
    const errorMessage = page.locator('text=/incorrect|invalide|erreur/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Ne doit PAS rediriger
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    // Remplir avec credentials valides (à adapter selon environnement de test)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Attendre la redirection vers dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Vérifier que l'interface dashboard est chargée
    await expect(page.locator('text=/dashboard|accueil|bienvenue/i')).toBeVisible();
  });

  test('should stay authenticated after page reload', async ({ page, context }) => {
    // Pre-requisite: user est loggé
    await page.goto('/auth');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Reload la page
    await page.reload();
    
    // Doit rester sur dashboard (pas de redirection vers /auth)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=/dashboard|accueil/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Pre-requisite: user est loggé
    await page.goto('/auth');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Trouver et cliquer sur le bouton de déconnexion
    // (peut être dans un menu, sidebar, ou header)
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Se déconnecter"), button[aria-label="Déconnexion"]');
    
    // Si le bouton est dans un menu, ouvrir le menu d'abord
    const menuButton = page.locator('button[aria-label="Menu utilisateur"], button[aria-label="Profil"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Cliquer sur déconnexion
    await logoutButton.click();
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 5000 });
    
    // Le formulaire de login doit être visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('should protect /diete route when not authenticated', async ({ page }) => {
    await page.goto('/diete');
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should protect /entrainements route when not authenticated', async ({ page }) => {
    await page.goto('/entrainements');
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should protect /mesures route when not authenticated', async ({ page }) => {
    await page.goto('/mesures');
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should protect /journal route when not authenticated', async ({ page }) => {
    await page.goto('/journal');
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/);
  });
});

// Tests pour inscription (si applicable)
test.describe('Registration Flow', () => {
  test.skip('should register new user successfully', async ({ page }) => {
    // À implémenter si registration est disponible
    await page.goto('/auth/register');
    // ... tests d'inscription
  });
});


