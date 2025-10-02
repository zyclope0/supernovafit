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
    // Tentative d'accès à une page protégée (diete nécessite auth)
    await page.goto('/diete');
    
    // Doit rediriger vers /auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
    
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
    
    // Remplir avec credentials valides
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Attendre que l'auth réussisse - reste sur /auth mais affiche "Connecté"
    await expect(page.locator('text=/Connecté|Bienvenue/i')).toBeVisible({ timeout: 10000 });
    
    // Vérifier qu'on peut naviguer vers une page protégée
    await page.goto('/diete');
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'on est bien sur la page diete (avec ou sans query params)
    expect(page.url()).toContain('/diete');
    
    // Vérifier que le contenu de la page diete est visible
    await expect(page.locator('text=/Repas|Diète|Menu/i')).toBeVisible({ timeout: 5000 });
  });

  test('should stay authenticated after page reload', async ({ page, context }) => {
    // Pre-requisite: user est loggé
    await page.goto('/auth');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Attendre confirmation login
    await expect(page.locator('text=/Connecté|Bienvenue/i')).toBeVisible({ timeout: 10000 });
    
    // Naviguer vers une page protégée
    await page.goto('/diete');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/diete');
    
    // Reload la page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Doit rester sur /diete (pas de redirection vers /auth)
    expect(page.url()).toContain('/diete');
    expect(page.url()).not.toContain('/auth');
    
    // Vérifier que le contenu est toujours visible
    await expect(page.locator('text=/Repas|Diète|Menu/i')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Pre-requisite: user est loggé
    await page.goto('/auth');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Attendre confirmation login
    await expect(page.locator('text=/Connecté|Bienvenue/i')).toBeVisible({ timeout: 10000 });
    
    // Le bouton "Se déconnecter" est visible directement sur /auth après login
    const logoutButton = page.locator('button:has-text("Se déconnecter")');
    await expect(logoutButton).toBeVisible();
    
    // Cliquer sur déconnexion
    await logoutButton.click();
    
    // Doit afficher le formulaire de login à nouveau
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
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


