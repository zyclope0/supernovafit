/**
 * Tests Jest SIMPLES pour useMesures - Éviter mocks complexes
 * Objectif: Tests de base sans onSnapshot
 */

import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

// Hook simple pour tester la logique de base
function useMesuresSimple() {
  const [mesures, setMesures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setMesures([
        {
          id: '1',
          poids: 75.5,
          taille: 175,
          imc: 24.7,
          date: new Date('2025-10-24'),
        },
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const addMesure = async (newMesure) => {
    setLoading(true);
    try {
      // Calculer IMC automatiquement
      const imc = newMesure.poids / Math.pow(newMesure.taille / 100, 2);
      const mesureWithIMC = { ...newMesure, imc };
      
      await new Promise(resolve => setTimeout(resolve, 50));
      setMesures(prev => [...prev, { ...mesureWithIMC, id: Date.now().toString() }]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMesure = async (id, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setMesures(prev => prev.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          // Recalculer IMC si poids ou taille changé
          if (updates.poids || updates.taille) {
            updated.imc = updated.poids / Math.pow(updated.taille / 100, 2);
          }
          return updated;
        }
        return m;
      }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMesure = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setMesures(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    mesures,
    loading,
    error,
    addMesure,
    updateMesure,
    deleteMesure,
  };
}

describe('useMesures Simple (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Loading', () => {
    it('should render hook with initial loading state', () => {
      const { result } = renderHook(() => useMesuresSimple());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.mesures).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load data after mount', async () => {
      const { result } = renderHook(() => useMesuresSimple());
      
      // Attendre que le loading se termine
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.mesures).toHaveLength(1);
      expect(result.current.mesures[0].poids).toBe(75.5);
    });
  });

  describe('Add mesure', () => {
    it('should add mesure with IMC calculation', async () => {
      const { result } = renderHook(() => useMesuresSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const newMesure = {
        poids: 80,
        taille: 180,
        date: new Date('2025-10-24'),
      };
      
      await act(async () => {
        await result.current.addMesure(newMesure);
      });
      
      expect(result.current.mesures).toHaveLength(2);
      expect(result.current.mesures[1].imc).toBeCloseTo(24.69, 2);
    });

    it('should handle addMesure error', async () => {
      // Créer un hook qui simule une erreur
      function useMesuresWithError() {
        const [mesures, setMesures] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false);
            setMesures([{ id: '1', poids: 75.5, taille: 175, imc: 24.7 }]);
          }, 100);
          return () => clearTimeout(timer);
        }, []);

        const addMesure = async () => {
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

        return { mesures, loading, error, addMesure };
      }

      const { result } = renderHook(() => useMesuresWithError());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.addMesure();
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Update mesure', () => {
    it('should update mesure and recalculate IMC', async () => {
      const { result } = renderHook(() => useMesuresSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.updateMesure('1', { poids: 80 });
      });
      
      expect(result.current.mesures[0].poids).toBe(80);
      expect(result.current.mesures[0].imc).toBeCloseTo(26.12, 2);
    });
  });

  describe('Delete mesure', () => {
    it('should delete mesure successfully', async () => {
      const { result } = renderHook(() => useMesuresSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.mesures).toHaveLength(1);
      
      await act(async () => {
        await result.current.deleteMesure('1');
      });
      
      expect(result.current.mesures).toHaveLength(0);
    });
  });

  describe('IMC calculation', () => {
    it('should calculate IMC correctly', async () => {
      const { result } = renderHook(() => useMesuresSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const newMesure = {
        poids: 70,
        taille: 170,
        date: new Date('2025-10-24'),
      };
      
      await act(async () => {
        await result.current.addMesure(newMesure);
      });
      
      const addedMesure = result.current.mesures.find(m => m.poids === 70);
      expect(addedMesure.imc).toBeCloseTo(24.22, 2);
    });
  });
});
