import { describe, it, expect } from 'vitest';
import {
  getChallengeCompletedNotification,
  getChallengeProgressNotification,
  getChallengeAlmostDoneNotification,
} from '@/lib/notifications/notificationTemplates';
import type { Challenge } from '@/types';

describe('notificationTemplates', () => {
  const mockChallenge: Challenge = {
    id: 'test-challenge-1',
    user_id: 'test-user-1',
    type: 'nutrition',
    title: 'Test Challenge',
    description: 'Test challenge description',
    target: 10,
    current: 5,
    xpReward: 100,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: 'active',
    unit: 'jours',
    created_at: new Date(),
  };

  describe('getChallengeCompletedNotification', () => {
    it('should return correct template for completed challenge', () => {
      const completedChallenge = {
        ...mockChallenge,
        current: 10,
        status: 'completed' as const,
      };

      const template = getChallengeCompletedNotification(completedChallenge);

      expect(template).toBeDefined();
      expect(template.title).toBeDefined();
      expect(template.body).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.badge).toBeDefined();
    });

    it('should include challenge title in template', () => {
      const template = getChallengeCompletedNotification(mockChallenge);
      
      expect(template.title).toContain('Challenge Complété');
      expect(template.body).toContain(mockChallenge.title);
    });

    it('should include XP reward in template', () => {
      const template = getChallengeCompletedNotification(mockChallenge);
      
      expect(template.body).toContain(mockChallenge.xpReward.toString());
      expect(template.body).toContain('XP');
    });

    it('should have correct icon and badge', () => {
      const template = getChallengeCompletedNotification(mockChallenge);
      
      expect(template.icon).toBeDefined();
      expect(template.badge).toBeDefined();
      expect(template.icon).toBe('/icons/icon-192x192.png');
      expect(template.badge).toBe('/icons/badge-72x72.png');
    });

    it('should handle different challenge types', () => {
      const nutritionChallenge = { ...mockChallenge, type: 'nutrition' };
      const trainingChallenge = { ...mockChallenge, type: 'training' };
      const trackingChallenge = { ...mockChallenge, type: 'tracking' };

      const nutritionTemplate = getChallengeCompletedNotification(nutritionChallenge);
      const trainingTemplate = getChallengeCompletedNotification(trainingChallenge);
      const trackingTemplate = getChallengeCompletedNotification(trackingChallenge);

      expect(nutritionTemplate).toBeDefined();
      expect(trainingTemplate).toBeDefined();
      expect(trackingTemplate).toBeDefined();
    });
  });

  describe('getChallengeProgressNotification', () => {
    it('should return correct template for progress notification', () => {
      const template = getChallengeProgressNotification(mockChallenge, 50);

      expect(template).toBeDefined();
      expect(template.title).toBeDefined();
      expect(template.body).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.badge).toBeDefined();
    });

    it('should include progress percentage in title', () => {
      const template = getChallengeProgressNotification(mockChallenge, 75);
      
      expect(template.title).toContain('75%');
      expect(template.title).toContain('📈');
    });

    it('should include challenge title in body', () => {
      const template = getChallengeProgressNotification(mockChallenge, 50);
      
      expect(template.body).toContain(mockChallenge.title);
    });

    it('should have appropriate icon for progress', () => {
      const template = getChallengeProgressNotification(mockChallenge, 50);
      
      expect(template.icon).toBeDefined();
      expect(template.icon).toBe('/icons/icon-192x192.png');
    });

    it('should handle zero progress', () => {
      const template = getChallengeProgressNotification(mockChallenge, 0);
      
      expect(template.title).toContain('0%');
    });

    it('should handle 100% progress', () => {
      const template = getChallengeProgressNotification(mockChallenge, 100);
      
      expect(template.title).toContain('100%');
    });
  });

  describe('getChallengeAlmostDoneNotification', () => {
    it('should return correct template for almost done notification', () => {
      const almostDoneChallenge = {
        ...mockChallenge,
        current: mockChallenge.target - 1,
      };

      const template = getChallengeAlmostDoneNotification(almostDoneChallenge);

      expect(template).toBeDefined();
      expect(template.title).toBeDefined();
      expect(template.body).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.badge).toBeDefined();
    });

    it('should include remaining progress', () => {
      const almostDoneChallenge = {
        ...mockChallenge,
        current: mockChallenge.target - 2,
      };

      const template = getChallengeAlmostDoneNotification(almostDoneChallenge);
      
      expect(template.title).toContain('2');
      expect(template.body).toContain('Continuez');
    });

    it('should have appropriate icon for almost done', () => {
      const template = getChallengeAlmostDoneNotification(mockChallenge);
      
      expect(template.icon).toBeDefined();
      expect(template.icon).toBe('/icons/icon-192x192.png');
    });

    it('should handle edge case of 1 remaining', () => {
      const oneRemainingChallenge = {
        ...mockChallenge,
        current: mockChallenge.target - 1,
      };

      const template = getChallengeAlmostDoneNotification(oneRemainingChallenge);
      
      expect(template.body).toContain('1');
    });
  });


  describe('template validation', () => {
    it('should have valid template structure', () => {
      const templates = [
        getChallengeCompletedNotification(mockChallenge),
        getChallengeProgressNotification(mockChallenge, 50),
        getChallengeAlmostDoneNotification(mockChallenge),
      ];

      templates.forEach((template) => {
        expect(template).toHaveProperty('title');
        expect(template).toHaveProperty('body');
        expect(template).toHaveProperty('icon');
        expect(template).toHaveProperty('badge');
        
        expect(typeof template.title).toBe('string');
        expect(typeof template.body).toBe('string');
        expect(typeof template.icon).toBe('string');
        expect(typeof template.badge).toBe('string');
      });
    });

    it('should have non-empty template fields', () => {
      const templates = [
        getChallengeCompletedNotification(mockChallenge),
        getChallengeProgressNotification(mockChallenge, 50),
        getChallengeAlmostDoneNotification(mockChallenge),
      ];

      templates.forEach((template) => {
        expect(template.title.length).toBeGreaterThan(0);
        expect(template.body.length).toBeGreaterThan(0);
        expect(template.icon.length).toBeGreaterThan(0);
        expect(template.badge.length).toBeGreaterThan(0);
      });
    });

    it('should handle special characters in challenge title', () => {
      const specialChallenge = {
        ...mockChallenge,
        title: 'Challenge avec des caractères spéciaux: éàçù',
      };

      const template = getChallengeCompletedNotification(specialChallenge);
      
      expect(template.body).toContain(specialChallenge.title);
    });

    it('should handle very long challenge titles', () => {
      const longTitleChallenge = {
        ...mockChallenge,
        title: 'A'.repeat(100),
      };

      const template = getChallengeCompletedNotification(longTitleChallenge);
      
      expect(template.body).toContain(longTitleChallenge.title);
    });
  });

  describe('edge cases', () => {
    it('should handle zero XP reward', () => {
      const zeroXPChallenge = { ...mockChallenge, xpReward: 0 };
      const template = getChallengeCompletedNotification(zeroXPChallenge);
      
      expect(template.body).toContain('0 XP');
    });

    it('should handle very high XP reward', () => {
      const highXPChallenge = { ...mockChallenge, xpReward: 10000 };
      const template = getChallengeCompletedNotification(highXPChallenge);
      
      expect(template.body).toContain('10000 XP');
    });

    it('should handle zero target', () => {
      const zeroTargetChallenge = { ...mockChallenge, target: 0, current: 0 };
      const template = getChallengeProgressNotification(zeroTargetChallenge);
      
      expect(template).toBeDefined();
    });

    it('should handle very high target', () => {
      const highTargetChallenge = { ...mockChallenge, target: 10000, current: 5000 };
      const template = getChallengeProgressNotification(highTargetChallenge, 50);
      
      expect(template.title).toContain('50%');
    });
  });
});
