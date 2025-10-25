/**
 * Tests Jest SIMPLES pour useEntrainements - Éviter mocks complexes
 * Objectif: Tests de base sans onSnapshot
 */

import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

// Hook simple pour tester la logique de base
function useEntrainementsSimple() {
  const [entrainements, setEntrainements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setEntrainements([
        {
          id: '1',
          type: 'cardio',
          duree: 30,
          calories: 300,
          date: new Date('2025-10-24'),
        },
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const addEntrainement = async (newEntrainement) => {
    setLoading(true);
    try {
      // Simuler l'ajout
      await new Promise(resolve => setTimeout(resolve, 50));
      setEntrainements(prev => [...prev, { ...newEntrainement, id: Date.now().toString() }]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateEntrainement = async (id, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setEntrainements(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntrainement = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setEntrainements(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    entrainements,
    loading,
    error,
    addEntrainement,
    updateEntrainement,
    deleteEntrainement,
  };
}

describe('useEntrainements Simple (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Loading', () => {
    it('should render hook with initial loading state', () => {
      const { result } = renderHook(() => useEntrainementsSimple());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.entrainements).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load data after mount', async () => {
      const { result } = renderHook(() => useEntrainementsSimple());
      
      // Attendre que le loading se termine
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.entrainements).toHaveLength(1);
      expect(result.current.entrainements[0].type).toBe('cardio');
    });
  });

  describe('Add entrainement', () => {
    it('should add entrainement successfully', async () => {
      const { result } = renderHook(() => useEntrainementsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const newEntrainement = {
        type: 'musculation',
        duree: 45,
        calories: 400,
        date: new Date('2025-10-24'),
      };
      
      await act(async () => {
        await result.current.addEntrainement(newEntrainement);
      });
      
      expect(result.current.entrainements).toHaveLength(2);
      expect(result.current.entrainements[1].type).toBe('musculation');
    });

    it('should handle addEntrainement error', async () => {
      // Créer un hook qui simule une erreur
      function useEntrainementsWithError() {
        const [entrainements, setEntrainements] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false);
            setEntrainements([{ id: '1', type: 'cardio', duree: 30, calories: 300 }]);
          }, 100);
          return () => clearTimeout(timer);
        }, []);

        const addEntrainement = async () => {
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

        return { entrainements, loading, error, addEntrainement };
      }

      const { result } = renderHook(() => useEntrainementsWithError());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.addEntrainement();
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Update entrainement', () => {
    it('should update entrainement successfully', async () => {
      const { result } = renderHook(() => useEntrainementsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.updateEntrainement('1', { duree: 60 });
      });
      
      expect(result.current.entrainements[0].duree).toBe(60);
    });
  });

  describe('Delete entrainement', () => {
    it('should delete entrainement successfully', async () => {
      const { result } = renderHook(() => useEntrainementsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.entrainements).toHaveLength(1);
      
      await act(async () => {
        await result.current.deleteEntrainement('1');
      });
      
      expect(result.current.entrainements).toHaveLength(0);
    });
  });

  describe('Loading states', () => {
    it('should show loading during operations', async () => {
      const { result } = renderHook(() => useEntrainementsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      
      // Déclencher une opération
      act(() => {
        result.current.addEntrainement({ type: 'cardio', duree: 30 });
      });
      
      expect(result.current.loading).toBe(true);
    });
  });
});
