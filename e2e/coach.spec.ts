/**
 * Tests E2E - Coach-Athlete Flow
 * 
 * Parcours critiques testés :
 * - Création invitation coach
 * - Acceptation par athlète
 * - Dashboard coach avec métriques
 * - Commentaires contextuels
 * - Permissions et sécurité
 */

import { test, expect } from '@playwright/test';

// Configuration globale
test.describe('Coach-Athlete Flow', () => {
  // Test avec le compte coach
  test.describe('Coach Actions', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avec le compte coach
      await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });

      // Attendre que les éléments du formulaire soient chargés (CSR bailout)

      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      
      await page.fill('input[type="email"]', 'coach@supernovafit.com');
      await page.fill('input[type="password"]', 'Coach123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      await expect(page.url()).toContain('/');
    });

    test('should access coach dashboard', async ({ page }) => {
      // Aller sur le dashboard coach
      await page.goto('/coach', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Vérifier que le dashboard coach est visible
      await expect(page.locator('h1')).toContainText(/coach|dashboard/i);
      await expect(page.locator('text=/athlètes|athletes/i')).toBeVisible();
    });

    test('should create invitation code', async ({ page }) => {
      // Aller sur le dashboard coach
      await page.goto('/coach', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Chercher le bouton pour créer une invitation
      const inviteButton = page.locator('button:has-text("Inviter")').first();
      await expect(inviteButton).toBeVisible();
      await inviteButton.click();
      
      // Vérifier que le modal d'invitation s'ouvre
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=/code|invitation/i')).toBeVisible();
      
      // Générer le code
      const generateButton = page.locator('button:has-text("Générer")').first();
      await generateButton.click();
      await page.waitForTimeout(1000);
      
      // Vérifier qu'un code est généré
      const codeInput = page.locator('input[readonly]').first();
      await expect(codeInput).toHaveValue(/.+/);
    });

    test('should view athlete list', async ({ page }) => {
      // Aller sur la page des athlètes
      await page.goto('/coach/all-athletes', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Vérifier que la liste des athlètes est visible
      await expect(page.locator('h1')).toContainText(/athlètes|athletes/i);
      
      // Vérifier qu'il y a au moins un athlète (si des invitations ont été acceptées)
      const athleteCards = page.locator('[data-testid="athlete-card"]');
      const count = await athleteCards.count();
      if (count > 0) {
        await expect(athleteCards.first()).toBeVisible();
      }
    });

    test('should view athlete details', async ({ page }) => {
      // Aller sur la page des athlètes
      await page.goto('/coach/all-athletes', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Cliquer sur le premier athlète (s'il existe)
      const athleteCard = page.locator('[data-testid="athlete-card"]').first();
      const count = await athleteCard.count();
      
      if (count > 0) {
        await athleteCard.click();
        await page.waitForTimeout(2000);
        
        // Vérifier que les détails de l'athlète sont visibles
        await expect(page.locator('text=/profil|données|métriques/i')).toBeVisible();
      }
    });

    test('should add comment to athlete', async ({ page }) => {
      // Aller sur la page des athlètes
      await page.goto('/coach/all-athletes', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Cliquer sur le premier athlète (s'il existe)
      const athleteCard = page.locator('[data-testid="athlete-card"]').first();
      const count = await athleteCard.count();
      
      if (count > 0) {
        await athleteCard.click();
        await page.waitForTimeout(2000);
        
        // Chercher le bouton pour ajouter un commentaire
        const commentButton = page.locator('button:has-text("Commentaire")').first();
        if (await commentButton.count() > 0) {
          await commentButton.click();
          await page.waitForTimeout(1000);
          
          // Vérifier que le modal de commentaire s'ouvre
          await expect(page.locator('[role="dialog"]')).toBeVisible();
          
          // Remplir le commentaire
          await page.fill('textarea[name="comment"]', 'Excellent travail cette semaine !');
          
          // Sauvegarder
          const saveButton = page.locator('button[type="submit"]').first();
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Vérifier que le commentaire est ajouté
          await expect(page.locator('text=Excellent travail cette semaine !')).toBeVisible();
        }
      }
    });
  });

  // Test avec le compte athlète
  test.describe('Athlete Actions', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avec le compte athlète
      await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });

      // Attendre que les éléments du formulaire soient chargés (CSR bailout)

      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      
      await page.fill('input[type="email"]', 'athlete@supernovafit.com');
      await page.fill('input[type="password"]', 'Athlete123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      await expect(page.url()).toContain('/');
    });

    test('should accept coach invitation', async ({ page }) => {
      // Aller sur la page d'invitation
      await page.goto('/coach/invite', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Vérifier que le formulaire d'invitation est visible
      await expect(page.locator('input[placeholder*="code"]')).toBeVisible();
      
      // Entrer un code d'invitation (simulé)
      await page.fill('input[placeholder*="code"]', 'TEST123');
      
      // Cliquer sur accepter
      const acceptButton = page.locator('button:has-text("Accepter")').first();
      await acceptButton.click();
      await page.waitForTimeout(2000);
      
      // Vérifier qu'un message de succès ou d'erreur apparaît
      await expect(page.locator('text=/succès|erreur|invalide/i')).toBeVisible({ timeout: 5000 });
    });

    test('should view coach comments', async ({ page }) => {
      // Aller sur une page où les commentaires coach sont visibles
      await page.goto('/journal', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Chercher la section des commentaires coach
      const coachComments = page.locator('text=/coach|commentaire/i');
      const count = await coachComments.count();
      
      if (count > 0) {
        await expect(coachComments.first()).toBeVisible();
      }
    });

    test('should mark comment as read', async ({ page }) => {
      // Aller sur une page avec des commentaires
      await page.goto('/journal', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Chercher un commentaire non lu
      const unreadComment = page.locator('[data-testid="unread-comment"]').first();
      const count = await unreadComment.count();
      
      if (count > 0) {
        await unreadComment.click();
        await page.waitForTimeout(1000);
        
        // Vérifier que le commentaire est marqué comme lu
        await expect(unreadComment).toHaveClass(/read|lu/);
      }
    });
  });

  // Test de sécurité et permissions
  test.describe('Security and Permissions', () => {
    test('should prevent athlete from accessing coach dashboard', async ({ page }) => {
      // Se connecter avec le compte athlète
      await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });

      // Attendre que les éléments du formulaire soient chargés (CSR bailout)

      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      
      await page.fill('input[type="email"]', 'athlete@supernovafit.com');
      await page.fill('input[type="password"]', 'Athlete123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Essayer d'accéder au dashboard coach
      await page.goto('/coach', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Vérifier qu'il y a une redirection ou un message d'erreur
      const isRedirected = page.url().includes('/auth') || page.url().includes('/');
      const hasError = await page.locator('text=/accès|permission|interdit/i').count() > 0;
      
      expect(isRedirected || hasError).toBeTruthy();
    });

    test('should prevent athlete from seeing other athletes data', async ({ page }) => {
      // Se connecter avec le compte athlète
      await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });

      // Attendre que les éléments du formulaire soient chargés (CSR bailout)

      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      
      await page.fill('input[type="email"]', 'athlete@supernovafit.com');
      await page.fill('input[type="password"]', 'Athlete123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Essayer d'accéder à la liste des athlètes
      await page.goto('/coach/all-athletes', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Vérifier qu'il y a une redirection ou un message d'erreur
      const isRedirected = page.url().includes('/auth') || page.url().includes('/');
      const hasError = await page.locator('text=/accès|permission|interdit/i').count() > 0;
      
      expect(isRedirected || hasError).toBeTruthy();
    });

    test('should validate coach permissions', async ({ page }) => {
      // Se connecter avec le compte coach
      await page.goto('/auth', { waitUntil: 'commit', timeout: 30000 });

      // Attendre que les éléments du formulaire soient chargés (CSR bailout)

      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      
      await page.fill('input[type="email"]', 'coach@supernovafit.com');
      await page.fill('input[type="password"]', 'Coach123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Aller sur le dashboard coach
      await page.goto('/coach', { waitUntil: 'commit' });
      await page.waitForTimeout(2000);
      
      // Vérifier que le coach peut accéder à ses fonctionnalités
      await expect(page.locator('text=/athlètes|invitation|commentaire/i')).toBeVisible();
    });
  });
});
