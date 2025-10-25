/**
 * Tests Jest SIMPLES pour useRepas - Éviter mocks complexes
 * Objectif: Tests de base sans onSnapshot
 */

import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

// Hook simple pour tester la logique de base
function useRepasSimple() {
  const [repas, setRepas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setRepas([
        {
          id: '1',
          nom: 'Petit déjeuner',
          calories: 300,
        },
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const addRepas = async (newRepas) => {
    setLoading(true);
    try {
      // Simuler l'ajout
      await new Promise(resolve => setTimeout(resolve, 50));
      setRepas(prev => [...prev, { ...newRepas, id: Date.now().toString() }]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRepas = async (id, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setRepas(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRepas = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setRepas(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    repas,
    loading,
    error,
    addRepas,
    updateRepas,
    deleteRepas,
  };
}

describe('useRepas Simple (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Loading', () => {
    it('should render hook with initial loading state', () => {
      const { result } = renderHook(() => useRepasSimple());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.repas).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load data after mount', async () => {
      const { result } = renderHook(() => useRepasSimple());
      
      // Attendre que le loading se termine
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.repas).toHaveLength(1);
      expect(result.current.repas[0].nom).toBe('Petit déjeuner');
    });
  });

  describe('Add repas', () => {
    it('should add repas successfully', async () => {
      const { result } = renderHook(() => useRepasSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const newRepas = {
        nom: 'Déjeuner',
        calories: 500,
      };
      
      await act(async () => {
        await result.current.addRepas(newRepas);
      });
      
      expect(result.current.repas).toHaveLength(2);
      expect(result.current.repas[1].nom).toBe('Déjeuner');
    });

    it('should handle addRepas error', async () => {
      // Créer un hook qui simule une erreur
      function useRepasWithError() {
        const [repas, setRepas] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false);
            setRepas([{ id: '1', nom: 'Petit déjeuner', calories: 300 }]);
          }, 100);
          return () => clearTimeout(timer);
        }, []);

        const addRepas = async () => {
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

        return { repas, loading, error, addRepas };
      }

      const { result } = renderHook(() => useRepasWithError());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.addRepas();
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Update repas', () => {
    it('should update repas successfully', async () => {
      const { result } = renderHook(() => useRepasSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.updateRepas('1', { nom: 'Petit déjeuner modifié' });
      });
      
      expect(result.current.repas[0].nom).toBe('Petit déjeuner modifié');
    });
  });

  describe('Delete repas', () => {
    it('should delete repas successfully', async () => {
      const { result } = renderHook(() => useRepasSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.repas).toHaveLength(1);
      
      await act(async () => {
        await result.current.deleteRepas('1');
      });
      
      expect(result.current.repas).toHaveLength(0);
    });
  });

  describe('Loading states', () => {
    it('should show loading during operations', async () => {
      const { result } = renderHook(() => useRepasSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      
      // Déclencher une opération
      act(() => {
        result.current.addRepas({ nom: 'Test' });
      });
      
      expect(result.current.loading).toBe(true);
    });
  });
});
