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
    await context.clearPermissions();
    // Aller directement sur /auth au lieu de / (plus rapide)
    await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });
    // Attendre un court délai pour que le clear se propage
    await page.waitForTimeout(500);
  });

  test('should redirect to /auth when accessing protected pages without auth', async ({ page }) => {
    // Maintenant les pages protégées redirigent vers /auth (middleware)
    await page.goto('/diete');
    
    // Doit rediriger vers /auth avec returnUrl
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/auth');
    expect(page.url()).toContain('returnUrl=%2Fdiete');
    
    // Le formulaire de login doit être visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
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

  test('should login successfully with valid credentials', async ({ page, context }) => {
    await page.goto('/auth');
    
    // Remplir avec credentials valides
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Attendre que Firebase Auth se propage (Safari = 5s, autres = 3s OK)
    await page.waitForTimeout(5000);
    
    // Vérifier qu'on peut accéder à une page protégée sans redirection vers /auth
    const response = await page.goto('/diete', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Si l'accès est autorisé, la page ne doit pas rediriger vers /auth
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/diete');
    expect(page.url()).not.toContain('/auth');
  });

  test('should stay authenticated after page reload', async ({ page, context }) => {
    // Pre-requisite: user est loggé
    await page.goto('/auth');
    
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Attendre que Firebase Auth se propage
    await page.waitForTimeout(5000);
    
    // Vérifier qu'on est authentifié en naviguant vers /diete
    const response = await page.goto('/diete', { waitUntil: 'commit', timeout: 15000 });
    
    // Si on a bien accès à la page (pas de redirect vers /auth)
    expect(response?.status()).toBeLessThan(400);
    expect(page.url()).toContain('/diete');
    
    // Reload simplement la page
    await page.reload({ waitUntil: 'commit' });
    
    // Vérifier qu'on reste authentifié (pas de redirect vers /auth)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/diete');
    expect(page.url()).not.toContain('/auth');
  });

  test('should logout successfully', async ({ page }) => {
    // Pre-requisite: user est loggé
    await page.goto('/auth', { waitUntil: 'commit' });
    
    const testEmail = process.env.TEST_USER_EMAIL || 'test@supernovafit.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Attendre que Firebase Auth se propage
    await page.waitForTimeout(5000);
    
    // Attendre que le bouton "Se déconnecter" soit visible
    const logoutButton = page.locator('button:has-text("Se déconnecter")');
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    
    // Cliquer sur déconnexion
    await logoutButton.click();
    
    // Attendre que la déconnexion se propage
    await page.waitForTimeout(2000);
    
    // Doit afficher le formulaire de login à nouveau
    await expect(page.locator('h1:has-text("Connexion")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should protect /diete route', async ({ page }) => {
    await page.goto('/diete');
    await page.waitForLoadState('networkidle');
    // Doit rediriger vers /auth
    expect(page.url()).toContain('/auth');
  });

  test('should protect /entrainements route', async ({ page }) => {
    await page.goto('/entrainements');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/auth');
  });

  test('should protect /mesures route', async ({ page }) => {
    await page.goto('/mesures');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/auth');
  });

  test('should protect /journal route', async ({ page }) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/auth');
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


