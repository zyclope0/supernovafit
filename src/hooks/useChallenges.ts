'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useFirebaseError } from './useFirebaseError';
import { calculateLevel } from '@/lib/challenges';
import { Challenge, Achievement, UserProgress } from '@/types';

// Hook pour les challenges
export function useChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const challengesErrorHandler = useFirebaseError({
    context: 'Challenges',
    maxRetries: 2,
  });

  useEffect(() => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'challenges'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Challenge[];
        setChallenges(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur snapshot challenges:', error);
        challengesErrorHandler.handleError(error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, challengesErrorHandler]);

  const addChallenge = useCallback(
    async (challengeData: Omit<Challenge, 'id' | 'created_at'>) => {
      if (!user) return { success: false, error: 'Utilisateur non connecté' };

      try {
        // Debug: Log les données avant envoi
        console.log('🔍 ADDING CHALLENGE:', {
          challengeData,
          user_id: user.uid,
          hasStartDate: !!challengeData.startDate,
          hasEndDate: !!challengeData.endDate,
          startDateType: typeof challengeData.startDate,
          endDateType: typeof challengeData.endDate,
        });

        const docRef = await addDoc(collection(db, 'challenges'), {
          ...challengeData,
          created_at: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error('❌ Erreur ajout challenge:', error);
        console.error('❌ Challenge data that failed:', challengeData);
        return {
          success: false,
          error: challengesErrorHandler.handleError(error),
        };
      }
    },
    [user, challengesErrorHandler],
  );

  const updateChallenge = useCallback(
    async (id: string, updates: Partial<Challenge>) => {
      try {
        await updateDoc(doc(db, 'challenges', id), {
          ...updates,
          updated_at: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error('Erreur mise à jour challenge:', error);
        return {
          success: false,
          error: challengesErrorHandler.handleError(error),
        };
      }
    },
    [challengesErrorHandler],
  );

  const deleteChallenge = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, 'challenges', id));
        return { success: true };
      } catch (error) {
        console.error('Erreur suppression challenge:', error);
        return {
          success: false,
          error: challengesErrorHandler.handleError(error),
        };
      }
    },
    [challengesErrorHandler],
  );

  return {
    challenges,
    loading,
    addChallenge,
    updateChallenge,
    deleteChallenge,
  };
}

// Hook pour les achievements
export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const achievementsErrorHandler = useFirebaseError({
    context: 'Achievements',
    maxRetries: 2,
  });

  useEffect(() => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'achievements'),
      where('user_id', '==', user.uid),
      orderBy('unlockedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Achievement[];
        setAchievements(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur snapshot achievements:', error);
        achievementsErrorHandler.handleError(error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, achievementsErrorHandler]);

  const addAchievement = useCallback(
    async (achievementData: Omit<Achievement, 'id' | 'created_at'>) => {
      if (!user) return { success: false, error: 'Utilisateur non connecté' };

      try {
        const docRef = await addDoc(collection(db, 'achievements'), {
          ...achievementData,
          unlockedAt: new Date().toISOString(),
          created_at: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
      } catch (error) {
        console.error('Erreur ajout achievement:', error);
        return {
          success: false,
          error: achievementsErrorHandler.handleError(error),
        };
      }
    },
    [user, achievementsErrorHandler],
  );

  return {
    achievements,
    loading,
    addAchievement,
  };
}

// Hook pour le progrès utilisateur
export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const progressErrorHandler = useFirebaseError({
    context: 'UserProgress',
    maxRetries: 2,
  });

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'user_progress'),
      where('user_id', '==', user.uid),
      limit(1),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          const data = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          } as UserProgress;
          setProgress(data);
        } else {
          setProgress(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erreur snapshot user progress:', error);
        progressErrorHandler.handleError(error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, progressErrorHandler]);

  const updateProgress = useCallback(
    async (updates: Partial<UserProgress>) => {
      if (!user) return { success: false, error: 'Utilisateur non connecté' };

      try {
        if (progress) {
          // Mettre à jour le progrès existant
          await updateDoc(doc(db, 'user_progress', progress.id), {
            ...updates,
            updated_at: serverTimestamp(),
          });
        } else {
          // Créer un nouveau progrès
          const docRef = await addDoc(collection(db, 'user_progress'), {
            user_id: user.uid,
            totalXP: 0,
            level: 1,
            currentLevelXP: 0,
            nextLevelXP: 100,
            badgesCount: 0,
            challengesCompleted: 0,
            achievementsUnlocked: 0,
            streakDays: 0,
            lastActivity: new Date().toISOString(),
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
          return { success: true, id: docRef.id };
        }
        return { success: true };
      } catch (error) {
        console.error('Erreur mise à jour progrès:', error);
        return {
          success: false,
          error: progressErrorHandler.handleError(error),
        };
      }
    },
    [user, progress, progressErrorHandler],
  );

  const addXP = useCallback(
    async (xpAmount: number) => {
      if (!user || !progress)
        return { success: false, error: 'Progrès non initialisé' };

      try {
        const newTotalXP = progress.totalXP + xpAmount;
        const { level, currentLevelXP, nextLevelXP } =
          calculateLevel(newTotalXP);

        await updateDoc(doc(db, 'user_progress', progress.id), {
          totalXP: newTotalXP,
          level,
          currentLevelXP,
          nextLevelXP,
          lastActivity: new Date().toISOString(),
          updated_at: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error('Erreur ajout XP:', error);
        return {
          success: false,
          error: progressErrorHandler.handleError(error),
        };
      }
    },
    [user, progress, progressErrorHandler],
  );

  return {
    progress,
    loading,
    updateProgress,
    addXP,
  };
}
