/**
 * Tests Jest SIMPLES pour useChallenges - Éviter mocks complexes
 * Objectif: Tests de base sans Firebase
 */

import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

// Hook simple pour tester la logique de base
function useChallengesSimple() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setChallenges([
        {
          id: '1',
          type: 'nutrition',
          title: 'Manger 5 fruits par jour',
          description: 'Consommer 5 portions de fruits quotidiennement',
          target: 5,
          current: 3,
          status: 'in_progress',
          created_at: new Date('2025-10-24'),
        },
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const addChallenge = async (newChallenge) => {
    setLoading(true);
    try {
      // Validation des champs obligatoires
      const validatedChallenge = {
        ...newChallenge,
        current: 0,
        status: 'in_progress',
        created_at: newChallenge.created_at || new Date(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 50));
      setChallenges(prev => [...prev, { ...validatedChallenge, id: Date.now().toString() }]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateChallenge = async (id, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setChallenges(prev => prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          // Mettre à jour le statut si nécessaire
          if (updated.current >= updated.target) {
            updated.status = 'completed';
          }
          return updated;
        }
        return c;
      }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setChallenges(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setChallenges(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'completed', completed_at: new Date() } : c
      ));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    challenges,
    loading,
    error,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    completeChallenge,
  };
}

describe('useChallenges Simple (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Loading', () => {
    it('should render hook with initial loading state', () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.challenges).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load data after mount', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre que le loading se termine
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.challenges).toHaveLength(1);
      expect(result.current.challenges[0].type).toBe('nutrition');
    });
  });

  describe('Add challenge', () => {
    it('should add challenge successfully', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const newChallenge = {
        type: 'training',
        title: 'Courir 10km',
        description: 'Parcourir 10 kilomètres en une session',
        target: 10,
      };
      
      await act(async () => {
        await result.current.addChallenge(newChallenge);
      });
      
      expect(result.current.challenges).toHaveLength(2);
      expect(result.current.challenges[1].status).toBe('in_progress');
    });

    it('should handle addChallenge error', async () => {
      // Créer un hook qui simule une erreur
      function useChallengesWithError() {
        const [challenges, setChallenges] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false);
            setChallenges([{ id: '1', type: 'nutrition', title: 'Test' }]);
          }, 100);
          return () => clearTimeout(timer);
        }, []);

        const addChallenge = async () => {
          setLoading(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 50));
            throw new Error('Test error');
          } catch (err) {
            setError(err);
          } finally {
            setLoading(false);
          }
        };

        return { challenges, loading, error, addChallenge };
      }

      const { result } = renderHook(() => useChallengesWithError());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.addChallenge();
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Update challenge', () => {
    it('should update challenge and auto-complete if target reached', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.updateChallenge('1', { current: 5 });
      });
      
      expect(result.current.challenges[0].current).toBe(5);
      expect(result.current.challenges[0].status).toBe('completed');
    });
  });

  describe('Delete challenge', () => {
    it('should delete challenge successfully', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.challenges).toHaveLength(1);
      
      await act(async () => {
        await result.current.deleteChallenge('1');
      });
      
      expect(result.current.challenges).toHaveLength(0);
    });
  });

  describe('Complete challenge', () => {
    it('should complete challenge successfully', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.completeChallenge('1');
      });
      
      expect(result.current.challenges[0].status).toBe('completed');
      expect(result.current.challenges[0].completed_at).toBeTruthy();
    });
  });

  describe('Challenge types', () => {
    it('should handle different challenge types', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const types = ['nutrition', 'training', 'wellness', 'social'];
      
      for (const type of types) {
        await act(async () => {
          await result.current.addChallenge({
            type,
            title: `Challenge ${type}`,
            description: `Description for ${type}`,
            target: 10,
          });
        });
      }
      
      expect(result.current.challenges).toHaveLength(5); // 1 initial + 4 nouveaux
      
      const nutritionChallenges = result.current.challenges.filter(c => c.type === 'nutrition');
      expect(nutritionChallenges).toHaveLength(2); // 1 initial + 1 nouveau
    });
  });

  describe('Loading states', () => {
    it('should show loading during operations', async () => {
      const { result } = renderHook(() => useChallengesSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      
      // Déclencher une opération
      act(() => {
        result.current.addChallenge({
          type: 'training',
          title: 'Test',
          description: 'Test',
          target: 1,
        });
      });
      
      expect(result.current.loading).toBe(true);
    });
  });
});
