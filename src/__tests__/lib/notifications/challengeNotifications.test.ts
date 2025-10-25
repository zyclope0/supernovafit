import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sendChallengeCompletedNotification,
  sendChallengeProgressNotification,
  sendChallengeAlmostDoneNotification,
  requestNotificationPermission,
  areNotificationsAvailable,
} from '@/lib/notifications/challengeNotifications';
import type { Challenge } from '@/types';

// Mock Notification API
const mockNotification = {
  onclick: null as (() => void) | null,
  close: vi.fn(),
};

const mockNotificationConstructor = vi.fn(() => mockNotification);

// Mock window.location
const mockLocation = {
  href: '',
  focus: vi.fn(),
};

// Mock window.focus
const mockWindowFocus = vi.fn();

describe('challengeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Notification
    global.Notification = mockNotificationConstructor as any;
    global.Notification.permission = 'granted';
    global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
    
    // Mock window
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
    Object.defineProperty(window, 'focus', {
      value: mockWindowFocus,
      writable: true,
    });
    
    // Mock console
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendChallengeCompletedNotification', () => {
    const mockChallenge: Challenge = {
      id: 'test-challenge',
      name: 'Test Challenge',
      current: 10,
      target: 10,
      xpReward: 300,
      type: 'nutrition',
      status: 'completed',
    };

    it('should send notification when permission is granted', async () => {
      global.Notification.permission = 'granted';
      
      await sendChallengeCompletedNotification(mockChallenge);
      
      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        '🎉 Challenge Complété!',
        expect.objectContaining({
          body: 'undefined - +300 XP gagnés!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'challenge-completed-test-challenge',
          requireInteraction: true,
          data: expect.objectContaining({
            type: 'challenge-completed',
            challengeId: 'test-challenge',
            xpReward: 300,
          }),
        })
      );
    });

    it('should handle browser not supporting notifications', async () => {
        // @ts-expect-error - Mocking browser API for testing
      delete global.Notification;
      
      await sendChallengeCompletedNotification(mockChallenge);
      
      expect(console.warn).toHaveBeenCalledWith('Notifications non supportées par ce navigateur');
    });

    it('should handle permission denied', async () => {
      global.Notification.permission = 'denied';
      
      await sendChallengeCompletedNotification(mockChallenge);
      
      expect(console.warn).toHaveBeenCalledWith('Permission notifications non accordée');
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });

    it('should handle notification creation error', async () => {
      global.Notification.permission = 'granted';
      mockNotificationConstructor.mockImplementation(() => {
        throw new Error('Notification creation failed');
      });
      
      await sendChallengeCompletedNotification(mockChallenge);
      
      expect(console.error).toHaveBeenCalledWith('❌ Erreur envoi notification:', expect.any(Error));
    });

    it('should set up onclick handler', async () => {
      global.Notification.permission = 'granted';
      
      await sendChallengeCompletedNotification(mockChallenge);
      
      expect(mockNotification.onclick).toBeDefined();
      
      // Simulate click
      if (mockNotification.onclick) {
        mockNotification.onclick();
        expect(mockWindowFocus).toHaveBeenCalled();
        expect(mockLocation.href).toBe('/challenges');
        expect(mockNotification.close).toHaveBeenCalled();
      }
    });
  });

  describe('sendChallengeProgressNotification', () => {
    const mockChallenge: Challenge = {
      id: 'test-challenge',
      name: 'Test Challenge',
      current: 5,
      target: 10,
      xpReward: 200,
      type: 'training',
      status: 'in_progress',
    };

    it('should send notification at 50% milestone', async () => {
      global.Notification.permission = 'granted';
      
      await sendChallengeProgressNotification(mockChallenge);
      
      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.stringContaining('📈'),
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'challenge-progress',
            challengeId: 'test-challenge',
            progress: 50,
          }),
        })
      );
    });

    it('should not send notification if no milestone reached', async () => {
      const challenge = { ...mockChallenge, current: 3, target: 10 }; // 30%
      
      await sendChallengeProgressNotification(challenge);
      
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });

    it('should handle permission not granted', async () => {
      global.Notification.permission = 'denied';
      
      await sendChallengeProgressNotification(mockChallenge);
      
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });

    it('should handle browser not supporting notifications', async () => {
        // @ts-expect-error - Mocking browser API for testing
      delete global.Notification;
      
      await sendChallengeProgressNotification(mockChallenge);
      
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });
  });

  describe('sendChallengeAlmostDoneNotification', () => {
    const mockChallenge: Challenge = {
      id: 'test-challenge',
      name: 'Test Challenge',
      current: 28,
      target: 30,
      xpReward: 150,
      type: 'journal',
      status: 'in_progress',
    };

    it('should send notification when 2 remaining', async () => {
      global.Notification.permission = 'granted';
      
      await sendChallengeAlmostDoneNotification(mockChallenge);
      
      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.stringContaining('🔥'),
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'challenge-almost-done',
            challengeId: 'test-challenge',
            remaining: 2,
          }),
        })
      );
    });

    it('should not send notification if more than 3 remaining', async () => {
      const challenge = { ...mockChallenge, current: 5, target: 30 }; // 25 remaining
      
      await sendChallengeAlmostDoneNotification(challenge);
      
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });

    it('should not send notification if already completed', async () => {
      const challenge = { ...mockChallenge, current: 30, target: 30 }; // 0 remaining
      
      await sendChallengeAlmostDoneNotification(challenge);
      
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });

    it('should handle permission not granted', async () => {
      global.Notification.permission = 'denied';
      
      await sendChallengeAlmostDoneNotification(mockChallenge);
      
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });
  });

  describe('requestNotificationPermission', () => {
    it('should return true if permission already granted', async () => {
      global.Notification.permission = 'granted';
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(true);
    });

    it('should return false if browser not supported', async () => {
        // @ts-expect-error - Mocking browser API for testing
      delete global.Notification;
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Notifications non supportées');
    });

    it('should return false if permission denied', async () => {
      global.Notification.permission = 'denied';
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith("Permission notifications refusée par l'utilisateur");
    });

    it('should request permission if default', async () => {
      global.Notification.permission = 'default';
      global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
      
      const result = await requestNotificationPermission();
      
      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle request permission error', async () => {
      global.Notification.permission = 'default';
      global.Notification.requestPermission = vi.fn().mockRejectedValue(new Error('Request failed'));
      
      const result = await requestNotificationPermission();
      
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Erreur demande permission notifications:', expect.any(Error));
    });
  });

  describe('areNotificationsAvailable', () => {
    it('should return true if notifications supported and granted', () => {
      global.Notification.permission = 'granted';
      
      const result = areNotificationsAvailable();
      
      expect(result).toBe(true);
    });

    it('should return false if notifications not supported', () => {
        // @ts-expect-error - Mocking browser API for testing
      delete global.Notification;
      
      const result = areNotificationsAvailable();
      
      expect(result).toBe(false);
    });

    it('should return false if permission not granted', () => {
      global.Notification.permission = 'denied';
      
      const result = areNotificationsAvailable();
      
      expect(result).toBe(false);
    });
  });
});
